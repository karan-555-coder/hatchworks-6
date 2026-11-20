/* BORDEAUX VELVET · motion layer
 * Slow luxe: blur-to-sharp staggered reveals, image settle-ins, liquid ripple buttons,
 * outline section labels gliding behind each section (with scroll parallax) and a
 * progress orb. Adds .vv-* classes and aria-hidden decorative nodes only. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  function el(tag, cls, parent) { var n = doc.createElement(tag); n.className = cls; n.setAttribute('aria-hidden', 'true'); (parent || doc.body).appendChild(n); return n; }
  function all(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }
  var outside = function (n) { return !n.closest('header.hw-header, .hw-header, nav, footer, .elementor-location-header, [aria-hidden="true"]'); };

  /* Pages that render inside shadow DOM get the theme sheet too. */
  var shadowRoots = [];
  all('*').forEach(function (host) {
    var sr = host.shadowRoot;
    if (sr) shadowRoots.push(sr);
    if (!sr || sr.querySelector('link[data-vv]')) return;
    var l = doc.createElement('link'); l.rel = 'stylesheet'; l.href = '/styles/velvet.css'; l.setAttribute('data-vv', '');
    sr.appendChild(l);
  });

  /* ---------- progress orb ---------------------------------------------------------------- */
  var orb = el('div', 'vv-orb');
  orb.innerHTML = '<svg viewBox="0 0 46 46"><circle class="t" cx="23" cy="23" r="20"/><circle class="f" cx="23" cy="23" r="20"/></svg><b>0</b>';
  var orbNum = orb.querySelector('b');

  /* ---------- section marquee labels ------------------------------------------------------- */
  var sections = all('section').filter(function (s) {
    return s.offsetHeight > 260 && outside(s) && !(s.parentElement && s.parentElement.closest('section'));
  });
  var marquees = [];
  sections.forEach(function (s, i) {
    var h = s.querySelector('h2, .hwh-trust-label, .hwh-partners-label');
    var text = h ? h.textContent.replace(/\s+/g, ' ').trim() : '';
    if (!text || text.length > 48) return;
    if (getComputedStyle(s).position === 'static') s.style.position = 'relative';
    s.classList.add('vv-host');
    var m = el('div', 'vv-marquee');
    s.insertBefore(m, s.firstChild);
    var span = doc.createElement('span');
    var unit = text + '  ·  ';
    span.textContent = unit + unit + unit + unit;
    span.style.setProperty('--vv-dur', (48 + (i % 3) * 12) + 's');
    if (i % 2) span.style.animationDirection = 'reverse';
    m.appendChild(span);
    marquees.push({ s: s, span: span });
  });

  var ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      var max = Math.max(1, root.scrollHeight - innerHeight), p = Math.min(1, scrollY / max);
      orb.style.setProperty('--p', p.toFixed(4));
      orbNum.textContent = Math.round(p * 100);
      orb.classList.toggle('on', scrollY > innerHeight * .4);
      if (!reduced) marquees.forEach(function (o) {
        var r = o.s.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        o.span.style.setProperty('--vv-par', ((r.top + r.height / 2 - innerHeight / 2) * -0.12).toFixed(1) + 'px');
      });
      ticking = false;
    });
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- liquid ripple buttons ------------------------------------------------------------ */
  var BTN = 'a.cta, .hwh-cta, .hw-btn--cta, .hwf-cta, .hwh-work-cta, .elementor-button, .hs-button';
  shadowRoots.reduce(function (list, sr) { return list.concat(all(BTN, sr)); }, all(BTN)).forEach(function (b) {
    if (b.querySelector(':scope > .vv-ripple')) return;
    b.classList.add('vv-liquid');
    var r = el('span', 'vv-ripple', b);
    b.insertBefore(r, b.firstChild);
    function place(e) {
      var rect = b.getBoundingClientRect();
      b.style.setProperty('--rx', (e.clientX - rect.left) + 'px');
      b.style.setProperty('--ry', (e.clientY - rect.top) + 'px');
      b.style.setProperty('--rs', Math.ceil(Math.hypot(rect.width, rect.height) / 5));
    }
    b.addEventListener('pointerenter', place);
    b.addEventListener('pointerleave', place);
    b.addEventListener('focus', function () { var rect = b.getBoundingClientRect(); b.style.setProperty('--rs', Math.ceil(Math.hypot(rect.width, rect.height) / 5)); });
  });

  /* ---------- cards ------------------------------------------------------------------------------ */
  var cards = all('.hwh-bx, .hwh-ccard, .hwh-mcard, .hwh-suite-card, .hwh-award, .hwh-eng-card, .hwh-belief, ' +
                  '.elementor-widget-call-to-action .elementor-cta, .e-loop-item, .elementor-post, .hwh-res a').filter(outside);
  cards.forEach(function (c) { c.classList.add('vv-card'); });

  /* ---------- slow luxe reveals ---------------------------------------------------------------- */
  if (reduced || !('IntersectionObserver' in window)) return;
  var heads = all('h2, .elementor-widget-heading .elementor-heading-title, .hwh-leader-h, .hwh-index-head p, .hwh-pos-sub')
    .filter(function (h) { return outside(h) && !h.closest('.hwh-hero'); });
  var media = all('.hwh-ccard-media, .elementor-widget-image .elementor-widget-container').filter(outside);
  heads.forEach(function (h) { h.classList.add('vv-rv'); });
  media.forEach(function (m) { m.classList.add('vv-rv-m'); });
  cards.forEach(function (c) {
    if (c.closest('.hwh-trust-marquee')) return;
    var idx = c.parentElement ? Array.prototype.indexOf.call(c.parentElement.children, c) : 0;
    c.classList.add('vv-rv'); c.style.setProperty('--d', (Math.min(idx, 6) * .12).toFixed(2) + 's');
  });
  root.classList.add('vv-js');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var t = en.target; io.unobserve(t); t.classList.add('vv-in');
      setTimeout(function () { t.style.removeProperty('--d'); }, 2400);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
  heads.concat(media, cards).forEach(function (n) { io.observe(n); });
})();
