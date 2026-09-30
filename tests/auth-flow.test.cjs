'use strict';

// Scaffold-only cases: later implementation tasks must replace each todo with
// an active assertion. A todo does not count as final requirement coverage.
const test = require('node:test');
const { withServerFixture } = require('./support/server-fixture.cjs');

test.todo('email signup creates a pending account without private access');
test.todo('captured verification link confirms the intended account');
test.todo('verification email can be resent without revealing account state');
test.todo('corrected-address signup creates a usable pending account');
test.todo('first verified sign-in returns to the public example');
test.todo('later sign-in returns to the private workspace');
test.todo('unknown account sign-in response is generic');
test.todo('duplicate signup response is generic');
test.todo('concurrent signup requests cannot create duplicate accounts');
test.todo('password reset link changes the password and requires fresh sign-in');
test.todo('pending accounts are removed only after the cleanup cutoff');
