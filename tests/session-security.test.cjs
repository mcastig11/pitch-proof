'use strict';

// Scaffold-only cases: later implementation tasks must replace each todo with
// an active assertion. A todo does not count as final requirement coverage.
const test = require('node:test');
const { withServerFixture } = require('./support/server-fixture.cjs');

test.todo('database session expiry is fixed and enforced by the server');
test.todo('sign-out invalidates the active session cookie');
test.todo('password reset invalidates every cookie issued before reset');
test.todo('sign-in does not adopt a session identifier supplied before authentication');
test.todo('cross-origin state-changing requests are rejected');
test.todo('auth endpoints enforce rate limits');
test.todo('signup, resend, and reset responses do not reveal account existence');
test.todo('private responses include Cache-Control no-store');
