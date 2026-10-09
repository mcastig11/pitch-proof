(() => {
  'use strict';
  const get = (id) => document.getElementById(id);
  const privatePage = document.body.dataset.page === 'workspace';
  const offline = 'We could not reach Pitch Proof. Check your connection and try again.';
  const failed = 'Your request could not be completed. Try again.';
  let generation = 0;
  let signedIn = false;
  let signingOut = false;
  let attemptEnded = false;

  function invitations() {
    if (privatePage) return;
    get('guest-invite').hidden = signedIn;
    get('attempt-invite').hidden = signedIn || !attemptEnded;
  }
  function clearPrivate() {
    generation += 1; signedIn = false;
    if (privatePage) { get('private-content').replaceChildren(); get('private-content').hidden = true; }
    get('account-nav').hidden = true;
    if (!privatePage) { get('guest-signin').hidden = false; invitations(); }
  }
  function workspaceState(kind) {
    if (!privatePage) return;
    const heading = kind === 'ended' ? 'Your sign-in has ended' : kind === 'unavailable' ? 'Your private space could not be opened' : 'My space';
    get('workspace-heading').textContent = heading; document.title = `Pitch Proof — ${heading}`;
    get('workspace-status').textContent = kind === 'ended' ? 'Sign in again to open your private space, or try the example.'
      : kind === 'unavailable' ? 'Check your connection and try again, or try the public example.'
      : kind === 'loading' ? 'Opening your private space…' : '';
    get('workspace-signin').hidden = kind !== 'ended'; get('workspace-signin').href = '/auth?mode=signin&returnTo=%2Fworkspace';
    get('workspace-retry').hidden = kind !== 'unavailable'; get('workspace-example').hidden = kind !== 'ended' && kind !== 'unavailable'; get('workspace-example').href = '/';
    if (kind === 'ended' || kind === 'unavailable') get('workspace-heading').focus();
  }
  function renderIdentity(identity) {
    const label = document.createElement('p'); label.textContent = 'Signed in as';
    const text = document.createElement('p'); text.textContent = identity;
    const link = document.createElement('a'); link.href = '/'; link.className = 'action'; link.textContent = 'Try the example';
    const actions = document.createElement('div'); actions.className = 'actions'; actions.append(link);
    const note = document.createElement('p'); note.textContent = 'Your own scores are coming next.';
    get('private-content').replaceChildren(label, text, actions, note); get('private-content').hidden = false;
  }
  async function load() {
    if (signingOut) return;
    clearPrivate(); workspaceState('loading'); const version = generation;
    if (!privatePage) get('account-status').textContent = 'Checking sign-in…';
    try {
      const response = await fetch('/api/me/workspace', { credentials: 'same-origin', cache: 'no-store' });
      if (version !== generation) return;
      if (response.status === 401) { clearPrivate(); workspaceState('ended'); if (!privatePage) get('account-status').textContent = ''; return; }
      if (!response.ok) throw new Error('unavailable');
      const data = await response.json(); if (version !== generation) return;
      if (typeof data.identity !== 'string' || !data.identity.trim()) throw new Error('invalid identity');
      signedIn = true; get('account-nav').hidden = false;
      if (privatePage) { workspaceState('ready'); renderIdentity(data.identity); }
      else { get('guest-signin').hidden = true; get('account-status').textContent = ''; invitations(); }
    } catch {
      if (version !== generation) return;
      clearPrivate(); workspaceState('unavailable'); if (!privatePage) get('account-status').textContent = '';
    }
  }
  async function signOut() {
    if (signingOut) return;
    signingOut = true; clearPrivate(); workspaceState('loading');
    // Leave the native disclosure available for retry if server invalidation fails.
    get('account-nav').hidden = false; get('sign-out').disabled = true; get('account-status').textContent = 'Signing out…';
    const version = generation;
    try {
      const response = await fetch('/api/auth/sign-out', { method: 'POST', credentials: 'same-origin', cache: 'no-store', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      if (version !== generation) return;
      if (!response.ok) throw { status: response.status };
      const data = await response.json(); if (data.success !== true && data.status !== true) throw { status: 500 };
      if (version !== generation) return;
      get('account-nav').hidden = true; get('account-status').textContent = ''; window.location.assign('/welcome');
    } catch (error) {
      if (version !== generation) return;
      workspaceState('unavailable'); get('account-status').textContent = error.status === 429 ? 'Please wait before trying again.' : error.status ? failed : offline;
      get('account-status').classList.add('error'); get('account-status').focus();
    } finally { if (version === generation) { signingOut = false; get('sign-out').disabled = false; } }
  }
  get('sign-out').addEventListener('click', signOut);
  get('account-menu').addEventListener('keydown', (event) => { if (event.key === 'Escape') { get('account-menu').open = false; get('account-trigger').focus(); } });
  if (privatePage) {
    get('workspace-heading').focus();
    get('workspace-retry').addEventListener('click', load);
    // Periodic private authorization is independent of every public audio callback.
    setInterval(() => { if (!document.hidden && !signingOut) load(); }, 30000);
  } else {
    document.addEventListener('pitchproof:attempt-ended', () => { attemptEnded = true; invitations(); });
  }
  window.addEventListener('pagehide', () => { clearPrivate(); signingOut = false; get('sign-out').disabled = false; });
  window.addEventListener('pageshow', (event) => { if (event.persisted) load(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { if (privatePage) clearPrivate(); }
    else load();
  });
  load();
})();
