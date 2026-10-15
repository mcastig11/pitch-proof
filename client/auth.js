(() => {
  'use strict';
  const get = (id) => document.getElementById(id);
  const params = new URLSearchParams(window.location.search);
  const generic = 'Check your email for the next step if the address is eligible.';
  const offline = 'We could not reach Pitch Proof. Check your connection and try again.';
  const failed = 'Your request could not be completed. Try again.';
  const definitions = {
    signin: ['Sign in', '', 'Sign in'],
    signup: ['Create your private space', '', 'Create your private space'],
    pending: ['Check your email', 'Email confirmation is required before you can open your private space. You can try the example while you wait.'],
    resend: ['Check your email', 'Email confirmation is required before you can open your private space. You can try the example while you wait.', 'Resend confirmation email'],
    correction: ['Correct your email address', 'Enter the address used at signup and your password. If the correction succeeds, use the new confirmation email; the earlier link will no longer work.', 'Update email address'],
    'reset-request': ['Reset your password', 'Enter your email address to request a password reset link.', 'Send reset email'],
    reset: ['Set a new password', 'Saving a new password signs you out on every device. You will need to sign in again.', 'Save new password'],
    'reset-sent': ['Check your email', ''],
    updated: ['Password updated', 'You are signed out on every device. Sign in with your new password to open your private space.'],
    verified: ['Email confirmed', 'Sign in to continue.'],
    'invalid-verify': ['Check your email', 'This confirmation link is no longer valid. Request a new confirmation email or try the example.'],
    'invalid-reset': ['Reset your password', 'This reset link is no longer valid. Request a new reset email.'],
    verifying: ['Check your email', 'Checking confirmation…'],
  };
  let mode = 'signin';
  let generation = 0;
  let busy = false;
  let token = params.get('token') || '';
  const returnTo = params.get('returnTo') === '/workspace' ? '/workspace' : undefined;
  const callbackURL = '/auth?mode=verify';

  function clearSecrets() { get('password').value = ''; }
  function state(next) {
    generation += 1; busy = false; mode = next; clearSecrets();
    const [heading, body, submit] = definitions[next];
    document.title = `Pitch Proof — ${heading}`;
    get('auth-heading').textContent = heading;
    get('auth-body').textContent = next === 'signin' && returnTo ? 'Sign in to open your private space.' : body;
    get('auth-form').hidden = !submit; get('auth-submit').disabled = false; get('auth-submit').textContent = submit || '';
    get('email-field').hidden = next === 'reset';
    get('password-field').hidden = !['signup', 'signin', 'correction', 'reset'].includes(next);
    get('newEmail-field').hidden = next !== 'correction';
    get('email').disabled = next === 'reset'; get('password').disabled = get('password-field').hidden; get('newEmail').disabled = next !== 'correction';
    get('email-label').textContent = next === 'correction' ? 'Current email address' : 'Email address';
    get('password-label').textContent = next === 'reset' ? 'New password' : 'Password';
    const newPassword = ['signup', 'reset'].includes(next);
    get('password').setAttribute('autocomplete', newPassword ? 'new-password' : 'current-password');
    get('password-requirement').hidden = !newPassword;
    get('resend').hidden = next !== 'pending'; get('resend').disabled = false;
    get('correct-email').hidden = next !== 'pending'; get('correct-email').disabled = false;
    get('signup-link').hidden = next !== 'signin'; get('reset-link').hidden = next !== 'signin';
    get('sign-in-link').hidden = next === 'signin';
    get('sign-in-link').textContent = next === 'signup' ? 'Already have an account? Sign in.' : 'Sign in';
    get('sign-in-link').href = next === 'updated' || returnTo ? '/auth?mode=signin&returnTo=%2Fworkspace' : '/auth?mode=signin';
    get('recover-link').hidden = !['invalid-verify', 'invalid-reset'].includes(next);
    get('recover-link').href = next === 'invalid-reset' ? '/auth?mode=reset-request' : '/auth?mode=resend';
    get('recover-link').textContent = next === 'invalid-reset' ? 'Send reset email' : 'Resend confirmation email';
    get('auth-status').textContent = ['pending', 'reset-sent'].includes(next) ? generic : '';
    get('auth-status').classList.remove('error');
    for (const id of ['email', 'password', 'newEmail']) { get(`${id}-error`).textContent = ''; get(id).removeAttribute('aria-invalid'); }
    get('auth-heading').focus();
  }
  function validate() {
    let first;
    for (const id of ['email', 'password', 'newEmail']) {
      const input = get(id); let message = '';
      if (!input.disabled) {
        if (id === 'password') {
          if (['signup', 'reset'].includes(mode) && (input.value.length < 8 || input.value.length > 128)) message = 'Use a password with 8–128 characters.';
          else if (!input.value) message = 'Enter your password.';
        } else {
          if (!input.value.trim()) message = 'Enter your email address.';
          else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) message = 'Enter a valid email address.';
        }
      }
      get(`${id}-error`).textContent = message;
      if (message) { input.setAttribute('aria-invalid', 'true'); first ||= input; }
      else input.removeAttribute('aria-invalid');
    }
    first?.focus(); return !first;
  }
  async function request(url, body) {
    const response = await fetch(url, { method: 'POST', credentials: 'same-origin', cache: 'no-store', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    let data; try { data = await response.json(); } catch { throw { message: failed }; }
    if (!response.ok) throw { status: response.status, code: data.code };
    return data;
  }
  async function submit(event, resending = false) {
    event.preventDefault(); if (busy || (!resending && !validate())) return;
    const current = mode; const version = generation; busy = true;
    const button = get(resending ? 'resend' : 'auth-submit'); const focused = document.activeElement === button;
    button.disabled = true; get('correct-email').disabled = true;
    const progress = resending || ['resend', 'reset-request'].includes(current) ? 'Sending email…'
      : { signup: 'Creating your private space…', signin: 'Signing in…', correction: 'Updating email address…', reset: 'Saving new password…' }[current];
    get('auth-status').textContent = progress; get('auth-status').classList.remove('error');
    const email = get('email').value.trim(); const password = get('password').value;
    try {
      if (resending || current === 'resend') {
        await request('/api/auth/send-verification-email', { email, callbackURL });
      } else if (current === 'signup') {
        await request('/api/auth/sign-up/email', { email, password, name: email, callbackURL });
      } else if (current === 'correction') {
        await request('/api/auth/correct-pending-email', { email, password, newEmail: get('newEmail').value.trim() });
      } else if (current === 'reset-request') {
        await request('/api/auth/request-password-reset', { email, redirectTo: '/auth?mode=reset' });
      } else if (current === 'reset') {
        await request('/api/auth/reset-password', { token, newPassword: password });
      } else {
        await request('/api/auth/sign-in/email', { email, password });
        if (generation !== version) return;
        const landing = await request('/api/me/landing', { ...(returnTo ? { returnTo } : {}) });
        if (generation !== version) return;
        if (!['/', '/workspace'].includes(landing.destination)) throw { message: failed };
        clearSecrets(); window.location.assign(landing.destination); return;
      }
      if (generation !== version) return;
      if (current === 'correction') get('email').value = get('newEmail').value.trim();
      if (current === 'reset') { token = ''; state('updated'); }
      else state(current === 'reset-request' ? 'reset-sent' : 'pending');
    } catch (error) {
      if (generation !== version) return;
      if (error.code === 'EMAIL_NOT_VERIFIED' && current === 'signin') state('pending');
      else if (current === 'reset' && ['INVALID_TOKEN', 'TOKEN_EXPIRED', 'USER_NOT_FOUND'].includes(error.code)) { token = ''; state('invalid-reset'); }
      else {
        get('auth-status').textContent = error.status === 429 ? 'Please wait before trying again.'
          : [401, 403].includes(error.status) ? 'Email or password is incorrect. Check your details and try again.'
          : error.message === failed || error.status ? failed : offline;
        get('auth-status').classList.add('error'); get('auth-status').focus();
      }
    } finally {
      if (generation === version) { busy = false; clearSecrets(); button.disabled = false; get('correct-email').disabled = false; if (focused && document.activeElement !== get('auth-status')) button.focus(); }
    }
  }
  get('auth-form').addEventListener('submit', submit);
  get('resend').addEventListener('click', (event) => submit(event, true));
  get('correct-email').addEventListener('click', () => state('correction'));
  for (const [id, next] of [['reset-link', 'reset-request'], ['signup-link', 'signup']]) get(id).addEventListener('click', (event) => { event.preventDefault(); state(next); });
  window.addEventListener('pagehide', () => { generation += 1; token = ''; clearSecrets(); });
  const requested = params.get('mode') || 'signin';
  if (requested === 'verify') {
    state('invalid-verify');
    if (params.get('confirmed') === '1' && !params.has('error')) {
      state('verifying'); const version = generation;
      fetch('/api/auth/confirmation-result', { credentials: 'same-origin', cache: 'no-store' }).then(async (response) => {
        const data = await response.json(); if (version === generation) state(response.ok && data.confirmed === true ? 'verified' : 'invalid-verify');
      }).catch(() => { if (version === generation) state('invalid-verify'); });
    }
  } else {
    // Completion states require a server result in this page lifecycle. A URL
    // must neither claim success nor index inherited object properties.
    const entry = ['signin', 'signup', 'pending', 'resend', 'correction', 'reset-request', 'reset'].includes(requested) ? requested : 'signin';
    state(entry === 'reset' && (!token || params.has('error')) ? 'invalid-reset' : entry);
  }
})();
