'use strict';

/**
 * Create a per-fixture email sink. Message content never leaves this test-only
 * object, and links are available only through the owning fixture instance.
 */
function createCaptureEmail() {
  const messages = [];

  return {
    async send({ kind, recipient, link }) {
      messages.push(Object.freeze({ kind, recipient, link }));
    },
    getLink(kind, recipient) {
      return messages.find((message) => message.kind === kind && message.recipient === recipient)?.link;
    },
    getMessages() {
      return messages.map((message) => ({ ...message }));
    },
  };
}

module.exports = { createCaptureEmail };
