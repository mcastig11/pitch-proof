'use strict';

// Scaffold-only cases: later implementation tasks must replace each todo with
// an active assertion. A todo does not count as final requirement coverage.
const test = require('node:test');
const { withServerFixture } = require('./support/server-fixture.cjs');

test.todo('unauthenticated requests cannot read private resource metadata or bytes');
test.todo('Alice cannot read Bob resource metadata');
test.todo('Alice cannot read Bob resource bytes');
test.todo('forged owner identifiers cannot bypass server-side ownership checks');
test.todo('resource metadata lists only the authenticated owner records');
test.todo('resource bytes are available to their authenticated owner');
