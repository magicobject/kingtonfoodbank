document.addEventListener('DOMContentLoaded', function () {
  var year = document.getElementById('year');
  if (year) { year.textContent = new Date().getFullYear(); }

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
