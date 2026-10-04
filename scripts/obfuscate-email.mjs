// Keeps plain email addresses out of the generated HTML (spam harvesters read
// page source, not the rendered page). The build writes a <span> holding the
// address reversed then base64-encoded, with a readable "name [at] domain"
// fallback as its text; public/js/main.js decodes it into a real mailto: link.
// Without JavaScript, visitors still see "name [at] domain" and can type it.

export function encodeEmail(address) {
  return Buffer.from([...address].reverse().join(''), 'utf8').toString('base64');
}

export function readableEmail(address) {
  return address.replace('@', ' [at] ');
}

export function emailLinkHtml(address) {
  return `<span class="obf-email" data-e="${encodeEmail(address)}">${readableEmail(address)}</span>`;
}
