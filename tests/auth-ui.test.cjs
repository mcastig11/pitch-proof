'use strict';

// Scaffold-only cases: Plan 02-06 must replace each todo with an active
// assertion. A todo does not count as final requirement coverage.
const test = require('node:test');
const { withServerFixture } = require('./support/server-fixture.cjs');

test.todo('pending email state has clear confirmation copy, resend, and correction actions');
test.todo('signup, sign-in, and reset forms use accessible native semantics');
test.todo('first sign-in returns to example and later sign-in opens workspace');
test.todo('welcome page gives Try the example and Sign in equal weight');
test.todo('expired workspace session clears private content and offers sign-in');
test.todo('signed-in example shows My space and keeps sign-out in the account menu');
test.todo('D-03 invitation appears near practice and once after an attempt with exact copy');
test.todo('guest example practice continues uninterrupted after session expiry');
