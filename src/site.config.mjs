// Single source of truth for contact details and facts repeated across the
// site — the hero, the "Getting help" and "Donating food" sections, the
// footer, and the 404 page. Edit a value here to update it everywhere at
// once; scripts/build.mjs replaces every {{TOKEN}} (e.g. {{EMAIL}},
// {{PHONE_DISPLAY}}) with the matching value below, in templates and in
// src/pages/*.html content alike.

export const SITE = {
  orgName: 'Kington Foodbank',
  runBy: 'Churches Together in Kington',

  email: 'info@kingtonfoodbank.org.uk',
  phoneDisplay: '07794 439644',
  phoneTel: '+447794439644',

  venue: 'Parish Hall',
  street: 'Church Street',
  town: 'Kington',
  county: 'Herefordshire',
  postcode: 'HR5 3AG',

  openingDay: 'Friday',
  openingTimeShort: '11:30 – 13:30',
  openingTimeDisplay: '11:30am – 1:30pm',

  mediawrightHref: 'https://mediawright.uk',
  mediawrightLabel: 'mediawright.uk',
};
