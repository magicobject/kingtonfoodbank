document.addEventListener('DOMContentLoaded', function () {
  var year = document.getElementById('year');
  if (year) { year.textContent = new Date().getFullYear(); }

  // Seasonal notices carry a data-hide-from="YYYY-MM-DD" date and remove
  // themselves once that date arrives, so a dated announcement (e.g.
  // Christmas opening hours) doesn't need a follow-up change to take it
  // down again. Without JavaScript the notice simply stays up.
  document.querySelectorAll('[data-hide-from]').forEach(function (el) {
    var hideFrom = new Date(el.getAttribute('data-hide-from') + 'T00:00:00');
    if (!isNaN(hideFrom.getTime()) && new Date() >= hideFrom) { el.remove(); }
  });

  // Turn each obfuscated email span (see scripts/obfuscate-email.mjs) into a
  // real mailto: link. Without JavaScript the "name [at] domain" text stays.
  document.querySelectorAll('.obf-email').forEach(function (el) {
    try {
      var address = atob(el.getAttribute('data-e')).split('').reverse().join('');
      var a = document.createElement('a');
      a.href = 'mailto:' + address;
      a.textContent = address;
      el.replaceWith(a);
    } catch (e) { /* leave the readable fallback */ }
  });

  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }
});
