import assert from 'node:assert/strict';
import { randomBytes, X509Certificate } from 'node:crypto';
import { mkdtemp, readFile } from 'node:fs/promises';
import { request } from 'node:https';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';

async function until(check, description) {
  for (let attempt = 0; attempt < 150; attempt++) {
    const result = await check();
    if (result) return result;
    await delay(100);
  }
  throw new Error(`Timed out: ${description}`);
}

async function launchChrome(executable, profileDirectory) {
  const child = spawn(executable, [
    '--headless=new', '--remote-debugging-port=0', '--remote-debugging-address=127.0.0.1',
    `--user-data-dir=${profileDirectory}`, '--no-first-run', '--no-default-browser-check',
    '--disable-sync', '--disable-extensions', '--disable-background-networking', 'about:blank',
  ], { windowsHide: true, stdio: 'ignore' });
  let launchError;
  child.on('error', (error) => { launchError = error; });
  const portInfo = await until(async () => {
    if (launchError || child.exitCode !== null) throw new Error('Isolated Chrome could not start.');
    try { return (await readFile(join(profileDirectory, 'DevToolsActivePort'), 'utf8')).trim().split(/\r?\n/); }
    catch { return false; }
  }, 'Chrome debugging endpoint');
  const socket = new WebSocket(`ws://127.0.0.1:${portInfo[0]}${portInfo[1]}`);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', () => reject(new Error('Chrome debugging connection failed.')), { once: true });
  });
  let nextId = 0;
  const pending = new Map();
  const events = [];
  socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data);
    if (!message.id) { events.push(message); return; }
    const callback = pending.get(message.id);
    if (!callback) return;
    pending.delete(message.id);
    clearTimeout(callback.timer);
    if (message.error) callback.reject(new Error(`Chrome protocol failed: ${callback.method}`));
    else callback.resolve(message.result);
  });
  function send(method, params = {}, sessionId) {
    return new Promise((resolve, reject) => {
      const id = ++nextId;
      const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Chrome protocol timeout: ${method}`)); }, 10000);
      pending.set(id, { resolve, reject, timer, method });
      socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
  }
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  const page = (method, params) => send(method, params, sessionId);
  for (const domain of ['Page', 'Runtime', 'Network', 'Security']) await page(`${domain}.enable`);
  let closed = false;
  return {
    send, page, events,
    async evaluate(expression) {
      const result = await page('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (result.exceptionDetails) throw new Error('Browser acceptance expression failed.');
      return result.result.value;
    },
    async close() {
      if (closed) return;
      closed = true;
      try { await send('Browser.close'); } catch { /* Closing can precede the response. */ }
      await until(() => child.exitCode !== null, 'isolated browser shutdown');
      socket.close();
      // Chromium rewrites this endpoint on restart; never reconnect to an old port.
      const { unlink } = await import('node:fs/promises');
      await unlink(join(profileDirectory, 'DevToolsActivePort')).catch(() => {});
    },
  };
}

// Explicit host-dependent acceptance test; not part of portable npm test.
// Passwords, mail links and cookie values remain in memory and are never returned.
export async function verifyLocalHttps({ running, dataDirectory, chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe' }) {
  const certificate = new X509Certificate(await readFile(running.configuration.certificatePath));
  const profileDirectory = await mkdtemp(join(dataDirectory, 'chrome-acceptance-'));
  const email = `https.uat.${randomBytes(8).toString('hex')}@example.test`;
  const password = randomBytes(24).toString('base64url');
  function call(path, body) {
    return new Promise((resolve, reject) => {
      const req = request(new URL(path, running.origin), {
        ca: certificate.toString(), method: body ? 'POST' : 'GET',
        headers: { Origin: running.origin, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      }, (response) => {
        response.resume();
        response.on('end', () => resolve(response.statusCode));
      });
      req.on('error', () => reject(new Error('Certificate-validated fixture request failed.')));
      req.end(body ? JSON.stringify(body) : undefined);
    });
  }
  assert.equal(await call('/api/auth/sign-up/email', { email, password, name: 'HTTPS acceptance', callbackURL: '/auth?mode=verify' }), 200);
  const link = running.emailTransport.getLink('verification', email);
  assert.ok(link, 'Private verification capture exists');
  assert.equal(await call(link), 302);
  let browser;
  try {
    browser = await launchChrome(chromePath, profileDirectory);
    const version = await browser.send('Browser.getVersion');
    const navigation = await browser.page('Page.navigate', { url: `${running.origin}/auth?mode=signin&returnTo=%2Fworkspace` });
    assert.equal(navigation.errorText, undefined, 'Chrome accepts the trusted localhost TLS certificate');
    await until(() => browser.evaluate('document.readyState === "complete" && Boolean(document.getElementById("auth-form"))'), 'initialized sign-in form');
    await browser.evaluate(`(() => { document.getElementById('email').value=${JSON.stringify(email)}; document.getElementById('password').value=${JSON.stringify(password)}; document.getElementById('auth-form').requestSubmit(); })()`);
    await until(() => browser.evaluate('location.pathname === "/workspace" && document.body.innerText.includes("Signed in as")'), 'authenticated private workspace');
    assert.equal(await browser.evaluate(`document.body.innerText.includes(${JSON.stringify(email)})`), true);
    const cookies = (await browser.send('Storage.getCookies')).cookies;
    const session = cookies.find((cookie) => cookie.name.endsWith('.session_token'));
    assert.ok(session, 'Browser stored the session cookie');
    assert.equal(session.secure, true);
    assert.equal(session.httpOnly, true);
    assert.equal(session.sameSite, 'Lax');
    assert.equal(session.session, false);
    assert.ok(session.name.startsWith('__Secure-'));
    assert.ok(Math.abs(session.expires - Date.now() / 1000 - 604800) < 120);
    const secureContext = await browser.evaluate('isSecureContext');
    assert.equal(secureContext, true);
    const javascriptCannotReadSession = await browser.evaluate('!document.cookie.includes("session_token")');
    assert.equal(javascriptCannotReadSession, true);
    const security = browser.events.filter((event) => event.method === 'Security.visibleSecurityStateChanged').at(-1)?.params.visibleSecurityState;
    assert.equal(security?.securityState, 'secure');
    const tlsResponse = browser.events.find((event) => event.method === 'Network.responseReceived' && event.params.response.url.startsWith(running.origin) && event.params.response.securityDetails)?.params.response;
    assert.ok(tlsResponse?.securityDetails.protocol.startsWith('TLS'));
    const setCookie = browser.events.filter((event) => event.method === 'Network.responseReceivedExtraInfo')
      .flatMap((event) => Object.entries(event.params.headers).filter(([key]) => key.toLowerCase() === 'set-cookie').map(([, value]) => value))
      .find((value) => value.includes('.session_token='));
    assert.ok(setCookie, 'Observed actual HTTPS sign-in Set-Cookie');
    assert.ok(/;\s*Secure(?:;|$)/i.test(setCookie), 'HTTPS session header has Secure');
    assert.ok(/;\s*HttpOnly(?:;|$)/i.test(setCookie), 'HTTPS session header has HttpOnly');
    assert.ok(/;\s*SameSite=Lax(?:;|$)/i.test(setCookie), 'HTTPS session header has SameSite=Lax');
    assert.ok(/;\s*Max-Age=604800(?:;|$)/i.test(setCookie), 'HTTPS session header has seven-day Max-Age');
    await browser.close();
    browser = await launchChrome(chromePath, profileDirectory);
    const restartNavigation = await browser.page('Page.navigate', { url: `${running.origin}/workspace` });
    assert.equal(restartNavigation.errorText, undefined);
    await until(() => browser.evaluate(`location.pathname === '/workspace' && document.body.innerText.includes(${JSON.stringify(email)})`), 'private access after full browser restart');
    const persisted = (await browser.send('Storage.getCookies')).cookies.find((cookie) => cookie.name === session.name);
    assert.ok(persisted && persisted.value === session.value, 'The same persistent session survives browser restart');
    return {
      checkedAt: new Date().toISOString(), origin: running.origin, browser: version.product,
      isolatedProfile: true, certificateErrorBypass: false,
      certificate: { subject: certificate.subject, sha1Fingerprint: certificate.fingerprint, expires: certificate.validTo, browserTrusted: true },
      tlsProtocol: tlsResponse.securityDetails.protocol, securityState: security.securityState, secureContext,
      cookie: { name: session.name, secure: session.secure, httpOnly: session.httpOnly, sameSite: session.sameSite, path: session.path, persistent: !session.session, maxAgeSeconds: 604800, expires: new Date(session.expires * 1000).toISOString() },
      actualHttpsSetCookieObserved: true, javascriptCannotReadSession, privateWorkspaceAccessible: true,
      sameSessionAfterBrowserRestart: true,
    };
  } finally { if (browser) await browser.close(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const dataDirectory = join(process.env.LOCALAPPDATA || '', 'PitchProof', 'local-https');
  const { startLocalHttps } = await import('./local-https.mjs');
  let running;
  try {
    running = await startLocalHttps({ dataDirectory });
    console.log(JSON.stringify(await verifyLocalHttps({ running, dataDirectory }), null, 2));
  } catch (error) {
    console.error(`Local HTTPS acceptance failed: ${error.message}`);
    process.exitCode = 1;
  } finally { if (running) await running.close(); }
}
