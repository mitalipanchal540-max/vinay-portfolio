(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  function $(s, r) { return (r || doc).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }

  // theme (storage may be blocked on file:// in some browsers, so guard it)
  try { var saved = localStorage.getItem('theme'); if (saved) root.setAttribute('data-theme', saved); } catch (e) {}
  $('#theme').addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  // mobile menu
  var links = $('#links'), menu = $('#menu');
  function closeMenu() { links.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); }
  menu.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    menu.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  $$('a', links).forEach(function (a) { a.addEventListener('click', closeMenu); });
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  // scroll progress, back-to-top, active link
  var navLinks = $$('a', links), sections = $$('section[id]');
  function onScroll() {
    var y = window.pageYOffset || root.scrollTop, max = root.scrollHeight - window.innerHeight;
    $('#bar').style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    $('#totop').classList.toggle('show', y > 600);
    var current = sections[0];
    sections.forEach(function (s) { if (s.getBoundingClientRect().top < 140) current = s; });
    var key = current.getAttribute('data-nav') || current.id;
    navLinks.forEach(function (a) {
      var on = a.getAttribute('href') === '#' + key;
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
  $('#totop').addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  // reveal on scroll + stat counters
  function countUp(el) {
    var end = parseFloat(el.getAttribute('data-n')), dec = end % 1 ? 1 : 0, t0 = null;
    function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min((t - t0) / 1200, 1);
      el.textContent = (end * p).toFixed(dec);
      if (p < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }
  function reveal(el) {
    el.classList.add('in');
    $$('[data-n]', el).forEach(countUp);
  }
  var targets = $$('.rv, .stats');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { reveal(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    targets.forEach(function (t) { io.observe(t); });
  } else {
    targets.forEach(reveal);
  }

  // contact form: mailto fallback (no backend configured)
  $('#cform').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target.elements;
    var body = 'Name: ' + f['name'].value + '\nEmail: ' + f['email'].value + '\nRequirement: ' + f['service'].value + '\n\n' + f['message'].value;
    window.location.href = 'mailto:cavinaypanchal@outlook.com?subject=' +
      encodeURIComponent('Enquiry: ' + f['service'].value) + '&body=' + encodeURIComponent(body);
    $('#note').textContent = 'Your email app should open with the message ready to send.';
  });

  $('#year').textContent = new Date().getFullYear();
})();
