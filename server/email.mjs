import { z } from 'zod';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const DEFAULT_TIMEOUT_MS = 10000;

function deliveryFailure() {
  const error = new Error('Account email could not be delivered. Please try again.');
  error.code = 'EMAIL_DELIVERY_FAILED';
  return error;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

function validSender(from) {
  if (typeof from !== 'string' || /[\r\n]/.test(from)) return false;
  const friendly = from.match(/^[^<>]+<([^<>]+)>$/);
  return z.email().safeParse(friendly ? friendly[1] : from).success;
}

function accountMessage({ kind, recipient, link }, requireHttps) {
  if (!['verification', 'reset'].includes(kind) || !z.email().safeParse(recipient).success || typeof link !== 'string') throw deliveryFailure();
  let url;
  try { url = new URL(link); } catch { throw deliveryFailure(); }
  if (url.username || url.password || (url.protocol !== 'https:' && (
    requireHttps || url.protocol !== 'http:' || !['localhost', '127.0.0.1'].includes(url.hostname)
  ))) throw deliveryFailure();
  const subject = kind === 'verification' ? 'Confirm your Pitch Proof email' : 'Reset your Pitch Proof password';
  // D-04 and D-06: no private session is created by confirmation or recovery.
  const instruction = kind === 'verification'
    ? 'Confirm your email, then sign in to open your private space.'
    : 'Set a new password, then sign in again. Your existing sessions will end.';
  return { subject, text: `${instruction}\n\n${link}\n\nIf you did not request this, ignore this email.`,
    html: `<p>${instruction}</p><p><a href="${escapeHtml(link)}">${kind === 'verification' ? 'Confirm email' : 'Reset password'}</a></p><p>If you did not request this, ignore this email.</p>` };
}

// A private per-process sink for local/test use. No HTTP route exposes it.
export function createCaptureEmail() {
  const messages = [];
  return {
    async send(message) {
      accountMessage(message, false);
      const { kind, recipient, link } = message;
      messages.push(Object.freeze({ kind, recipient, link }));
    },
    getLink(kind, recipient) {
      return messages.find((message) => message.kind === kind && message.recipient === recipient)?.link;
    },
    getMessages() { return messages.map((message) => ({ ...message })); },
  };
}

// Only the caller on the server supplies credentials; tests inject fetch.
export function createResendEmail({ apiKey, from, fetchImpl = globalThis.fetch, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  if (typeof apiKey !== 'string' || !apiKey.trim() || /[\r\n]/.test(apiKey)) throw new Error('RESEND_API_KEY is required and must be valid.');
  if (!validSender(from)) throw new Error('RESEND_FROM must be a valid sender email address.');
  if (typeof fetchImpl !== 'function' || !Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 30000) throw new Error('Email transport requires fetch and a timeout between 1 and 30000 milliseconds.');
  return {
    async send(message) {
      const content = accountMessage(message, true);
      const controller = new AbortController();
      let timer;
      try {
        const timeout = new Promise((_resolve, reject) => {
          timer = setTimeout(() => { controller.abort(); reject(deliveryFailure()); }, timeoutMs);
        });
        // The race includes response parsing; a hung body cannot exhaust workers.
        const delivery = (async () => {
          const response = await fetchImpl(RESEND_ENDPOINT, {
            method: 'POST', redirect: 'error', signal: controller.signal,
            headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', 'User-Agent': 'Pitch-Proof/1.0' },
            body: JSON.stringify({ from, to: [message.recipient], ...content }),
          });
          if (!response.ok) throw deliveryFailure();
          const result = await response.json();
          if (typeof result?.id !== 'string' || !result.id.trim() || result.error || result.message) throw deliveryFailure();
          return { id: result.id };
        })();
        return await Promise.race([delivery, timeout]);
      } catch {
        // Do not retain raw provider errors, causes, recipients, links or keys.
        throw deliveryFailure();
      } finally { clearTimeout(timer); }
    },
  };
}
