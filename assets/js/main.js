/* =========================================================
   Ratolo Studios — site script
   ---------------------------------------------------------
   EDIT YOUR DETAILS HERE. Everything below updates the whole page.
   ========================================================= */
const CONFIG = {
  phone: '+254 705 605 147',          // shown on the page and used for tap-to-call
  whatsapp: '254705605147',           // international format, digits only, e.g. 254712345678
  whatsappLabel: '+254 705 605 147',  // how the WhatsApp number is displayed
  whatsappMessage: "Hi Ratolo Studios! I'd like to book a session.",
  email: 'hello@ratolostudios.com',
  location: 'Nairobi, Kenya',
  city: 'Nairobi, Kenya',
  founded: '2030',
  instagram: 'ratolostudios',         // handle without @
  tiktok: 'ratolostudios',            // handle without @
  // Paste a Formspree (or similar) endpoint to receive enquiries by email,
  // e.g. 'https://formspree.io/f/abcdwxyz'. Left empty, the form opens the
  // visitor's email app with the enquiry pre-filled instead.
  formEndpoint: ''
};

(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Fill contact details ---------- */
  const links = {
    phone: `tel:${CONFIG.phone.replace(/[^\d+]/g, '')}`,
    whatsapp: `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(CONFIG.whatsappMessage)}`,
    email: `mailto:${CONFIG.email}`,
    instagram: `https://instagram.com/${CONFIG.instagram}`,
    tiktok: `https://www.tiktok.com/@${CONFIG.tiktok}`
  };
  $$('[data-link]').forEach(a => { const href = links[a.dataset.link]; if (href) a.href = href; });
  $$('[data-fill]').forEach(el => { const v = CONFIG[el.dataset.fill]; if (v) el.textContent = v; });
  const year = $('#year'); if (year) year.textContent = new Date().getFullYear();

  /* ---------- Header: scrolled state ---------- */
  const header = $('.site-header');
  const waFloat = $('.wa-float');
  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
    waFloat.classList.toggle('is-shown', window.scrollY > window.innerHeight * 0.6);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Back to top ---------- */
  $$('a[href="#top"]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  }));

  /* ---------- Mobile menu ---------- */
  const toggle = $('.menu-toggle');
  const nav = $('#primary-nav');
  const setMenu = open => {
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) $('a', nav).focus();
  };
  toggle.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  nav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  // The menu floats over the page, so a tap anywhere else closes it
  document.addEventListener('click', e => {
    if (nav.classList.contains('is-open') && !nav.contains(e.target) && !toggle.contains(e.target)) setMenu(false);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
  });

  /* ---------- Active nav link ---------- */
  const navLinks = $$('.primary-nav ul a[href^="#"]');
  const sections = navLinks.map(a => $(a.getAttribute('href'))).filter(Boolean);
  const spy = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => spy.observe(s));

  /* ---------- Scroll reveal ---------- */
  const revealEls = $$('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const siblings = $$('.reveal', entry.target.parentElement);
        entry.target.style.transitionDelay = `${Math.min(siblings.indexOf(entry.target), 5) * 60}ms`;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  }

  /* ---------- Stat counters ---------- */
  const counters = $$('[data-count]');
  const runCounter = el => {
    const target = Number(el.dataset.count);
    if (reduceMotion) { el.textContent = target.toLocaleString(); return; }
    const start = performance.now(), dur = 1400;
    const tick = now => {
      const p = Math.min((now - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const cio = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { runCounter(e.target); cio.unobserve(e.target); } });
  }, { threshold: 0.6 });
  counters.forEach(el => { el.textContent = '0'; cio.observe(el); });

  /* ---------- Portfolio filter (portfolio page) ---------- */
  const items = $$('.gallery li');
  const chips = $$('.chip');
  const status = $('#filter-status');
  const lb = $('#lightbox');
  chips.forEach(chip => chip.addEventListener('click', () => {
    const f = chip.dataset.filter;
    chips.forEach(c => { const on = c === chip; c.classList.toggle('is-active', on); c.setAttribute('aria-pressed', String(on)); });
    let shown = 0;
    items.forEach(li => { const show = f === 'all' || li.dataset.cat === f; li.hidden = !show; if (show) shown++; });
    status.textContent = `Showing ${shown} ${f === 'all' ? '' : chip.textContent.toLowerCase() + ' '}photos`;
  }));

  /* ---------- Lightbox ---------- */
  if (lb) {
  const lbImg = $('img', lb), lbCat = $('.lb-cat', lb), lbCount = $('.lb-count', lb);
  let current = 0, opener = null;
  const visible = () => items.filter(li => !li.hidden);
  const show = i => {
    const list = visible();
    current = (i + list.length) % list.length;
    const img = $('img', list[current]);
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCat.textContent = list[current].dataset.cat;
    lbCount.textContent = `${current + 1} / ${list.length}`;
  };
  items.forEach(li => $('.tile', li).addEventListener('click', e => {
    opener = e.currentTarget;
    show(visible().indexOf(li));
    lb.showModal();
  }));
  $('.lb-prev', lb).addEventListener('click', () => show(current - 1));
  $('.lb-next', lb).addEventListener('click', () => show(current + 1));
  $('.lb-close', lb).addEventListener('click', () => lb.close());
  lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
  lb.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
  lb.addEventListener('close', () => opener && opener.focus());
  // Swipe on touch screens
  let touchX = null;
  lb.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    touchX = null;
  });
  }

  /* ---------- Package buttons preselect form ---------- */
  $$('[data-package]').forEach(btn => btn.addEventListener('click', () => {
    $('#f-package').value = btn.dataset.package;
  }));

  /* ---------- Contact form ---------- */
  const form = $('#contact-form');
  if (!form) return;
  const formStatus = $('.form-status', form);
  const submitBtn = $('button[type="submit"]', form);
  const rules = {
    name: v => v.trim() ? '' : 'Please enter your name.',
    email: v => !v.trim() ? 'Please enter your email so we can reply.'
      : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'That email looks incomplete. Check for a missing @ or domain.',
    service: v => v ? '' : 'Choose the service you are interested in.',
    message: v => v.trim().length >= 10 ? '' : 'Tell us a little more (at least 10 characters).'
  };
  const validateField = el => {
    const rule = rules[el.name];
    if (!rule) return true;
    const msg = rule(el.value);
    const field = el.closest('.field');
    field.classList.toggle('has-error', !!msg);
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    $('.field-error', field).textContent = msg;
    return !msg;
  };
  Object.keys(rules).forEach(name => {
    const el = form.elements[name];
    el.addEventListener('blur', () => validateField(el));
    el.addEventListener('input', () => { if (el.closest('.field').classList.contains('has-error')) validateField(el); });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const invalid = Object.keys(rules).map(n => form.elements[n]).filter(el => !validateField(el));
    if (invalid.length) {
      invalid[0].focus();
      formStatus.className = 'form-status';
      formStatus.textContent = `Please fix ${invalid.length} field${invalid.length > 1 ? 's' : ''} above.`;
      return;
    }
    const data = Object.fromEntries(new FormData(form));

    if (!CONFIG.formEndpoint) {
      const body = [
        `Name: ${data.name}`, `Email: ${data.email}`, `Phone: ${data.phone || '-'}`,
        `Event date: ${data.date || '-'}`, `Service: ${data.service}`, `Package: ${data.package || 'Not sure yet'}`,
        '', data.message
      ].join('\n');
      window.location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(`Booking enquiry: ${data.service}`)}&body=${encodeURIComponent(body)}`;
      formStatus.className = 'form-status is-success';
      formStatus.textContent = 'Your email app should open with the enquiry ready to send. Prefer WhatsApp? Use the button at the bottom right.';
      return;
    }

    submitBtn.disabled = true;
    $('.btn-label', submitBtn).textContent = 'Sending...';
    formStatus.className = 'form-status';
    formStatus.textContent = '';
    try {
      const res = await fetch(CONFIG.formEndpoint, {
        method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form)
      });
      if (!res.ok) throw new Error(res.statusText);
      form.reset();
      formStatus.className = 'form-status is-success';
      formStatus.textContent = 'Thank you! Your enquiry was sent. We will reply within 24 hours.';
    } catch {
      formStatus.className = 'form-status';
      formStatus.textContent = `Sorry, that didn't send. Please try again, or email us at ${CONFIG.email}.`;
    } finally {
      submitBtn.disabled = false;
      $('.btn-label', submitBtn).textContent = 'Send enquiry';
    }
  });
})();
