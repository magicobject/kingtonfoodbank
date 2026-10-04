import { test } from 'node:test';
import assert from 'node:assert/strict';
import { encodeEmail, readableEmail, emailLinkHtml } from '../scripts/obfuscate-email.mjs';

test('encodeEmail round-trips and does not contain the address', () => {
  const address = 'info@kingtonfoodbank.org.uk';
  const encoded = encodeEmail(address);
  assert.ok(!encoded.includes('@') && !encoded.includes('info'));
  const decoded = Buffer.from(encoded, 'base64').toString('utf8').split('').reverse().join('');
  assert.equal(decoded, address);
});

test('the link html has only the readable "[at]" fallback, never the address', () => {
  const html = emailLinkHtml('safeguarding@kingtonfoodbank.org.uk');
  assert.ok(!html.includes('@'));
  assert.ok(html.includes(readableEmail('safeguarding@kingtonfoodbank.org.uk')));
  assert.ok(!html.includes('mailto:'));
});
