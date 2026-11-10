/* =====================================================================
   THE SPREADCITY — site config & behaviour
   ---------------------------------------------------------------------
   👉 EDIT THE LINKS BELOW with your real destinations. Every button and
      social icon across ALL pages reads from this one place.
   ===================================================================== */
const LINKS = {
  // Telegram channel (prayer, devotionals, audio messages)
  telegram: "https://t.me/havenwordchurch",
  // Latest audio message (Telegram post) - the home page play button opens this
  latestMessage: "https://t.me/havenwordchurch/2873",
  // Online giving link (Paystack / Flutterwave / etc.)
  giveOnline: "",                        // TODO: paste your secure giving link
  // Podcast / streaming
  spotify: "",                       // TODO: Spotify show link
  applePodcast: "",                       // TODO: Apple Podcasts link
  // Social profiles
  youtube: "https://www.youtube.com/@TheSpreadCity",
  instagram: "https://www.instagram.com/thespreadcity/",
  facebook: "https://www.facebook.com/HavenWordChurch",
  tiktok: "https://www.tiktok.com/@spreadcitymoments",
  x: "",                        // TODO
  // Contact
  email: "hello@thespreadcity.org", // TODO: your real church email
  phone: "",                        // TODO: e.g. +234...
  // Soul Winners Conference Registration (Google Sheets Web App)
  conferenceRegEndpoint: "https://script.google.com/macros/s/AKfycbw6mxZq8BRTi6I89QCFnb3elDUmtM4uMd5WtFKPJ4Vzc7UxScg7jNM19HNWbglt2iRL_g/exec"
};

// Real Google Maps directions to the church address (already wired — no edit needed)
const CHURCH_ADDRESS = "Haven Word Church, Opposite Gate 5, Adamasingba, Ibadan, Oyo State, Nigeria";
LINKS.directions = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(CHURCH_ADDRESS);
LINKS.map = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(CHURCH_ADDRESS);

/* ---- Apply links to any element with data-link="key" ---- */
document.querySelectorAll('[data-link]').forEach(el => {
  const key = el.getAttribute('data-link');
  const url = LINKS[key];
  if (url) {
    el.setAttribute('href', url);
    if (/^https?:/.test(url)) { el.setAttribute('target', '_blank'); el.setAttribute('rel', 'noopener'); }
    el.classList.remove('link-missing');
  } else {
    // No URL yet — keep it inert but visible, and hint on hover
    el.setAttribute('href', 'javascript:void(0)');
    el.setAttribute('title', 'Link coming soon — add it in assets/site.js');
    el.classList.add('link-missing');
  }
});

/* ---- mailto / tel ---- */
if (LINKS.email) document.querySelectorAll('[data-mailto]').forEach(el => el.setAttribute('href', 'mailto:' + LINKS.email));
if (LINKS.phone) document.querySelectorAll('[data-tel]').forEach(el => el.setAttribute('href', 'tel:' + LINKS.phone.replace(/\s/g, '')));

/* ---- Play button opens the latest message in a new tab (or nudges to Messages) ---- */
document.querySelectorAll('[data-video]').forEach(el => {
  el.addEventListener('click', () => {
    if (LINKS.latestMessage) window.open(LINKS.latestMessage, '_blank', 'noopener');
    else window.location.href = 'messages';
  });
});

/* ---- Header scroll state ---- */
const header = document.getElementById('header');
if (header) {
  const solid = () => header.classList.toggle('scrolled', scrollY > 40);
  addEventListener('scroll', solid); solid();
}

/* ---- Reveal on scroll ---- */
const io = new IntersectionObserver((es) => {
  es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: .12 });
document.querySelectorAll('.reveal').forEach((el, i) => { el.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(el); });

/* ---- Mobile menu ---- */
function openM() { document.getElementById('mnav').classList.add('open'); }
function closeM() { document.getElementById('mnav').classList.remove('open'); }
(function () {
  const mnav = document.getElementById('mnav');
  if (!mnav) return;
  // click on the backdrop (not a link) closes the menu
  mnav.addEventListener('click', (e) => { if (e.target === mnav) closeM(); });
  // Esc closes it too
  addEventListener('keydown', (e) => { if (e.key === 'Escape') closeM(); });
})();

/* ---- Fit the hero headline: as large as possible without spilling over ---- */
function fitHero() {
  const h1 = document.querySelector('.hero h1');
  if (!h1) return;
  h1.style.fontSize = '';                     // back to CSS base
  const box = h1.clientWidth;                 // available width
  if (!box) return;
  const cur = parseFloat(getComputedStyle(h1).fontSize) || 48;
  // measure the WIDEST line at the current font (shrink h1 to its content width)
  const dPrev = h1.style.display, wPrev = h1.style.width;
  h1.style.display = 'inline-block';
  h1.style.width = 'max-content';
  const widest = h1.getBoundingClientRect().width;
  h1.style.display = dPrev;
  h1.style.width = wPrev;
  if (!widest) return;
  let target = cur * ((box - 1) / widest);    // scale so the widest line fills the width
  target = Math.max(22, Math.min(target, 46)); // cap so it never overwhelms large screens
  h1.style.fontSize = target + 'px';
}
addEventListener('resize', fitHero);
addEventListener('orientationchange', fitHero);
addEventListener('load', fitHero);
addEventListener('pageshow', fitHero);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitHero);
requestAnimationFrame(fitHero);
setTimeout(fitHero, 300);
fitHero();

/* ---- Fit the belief carousel: biggest size that keeps every statement on 2 lines ---- */
function fitBelief() {
  const roller = document.querySelector('.belief-roller');
  if (!roller) return;
  const lns = [...roller.querySelectorAll('.roller-track li .ln')];
  if (!lns.length) return;
  const avail = roller.clientWidth - 24;      // li has 12px padding each side
  if (avail <= 0) return;
  const REF = 100, LS = 0.015;                // reference px, letter-spacing (em)
  const ctx = fitBelief._ctx || (fitBelief._ctx = document.createElement('canvas').getContext('2d'));
  ctx.font = '400 ' + REF + "px Anton, sans-serif";
  let widest = 0;                             // widest single line across every statement, at REF px
  lns.forEach(ln => {
    ln.innerHTML.split(/<br\s*\/?>/i).forEach(part => {
      const tmp = document.createElement('div');
      tmp.innerHTML = part;
      const line = (tmp.textContent || '').trim().toUpperCase();
      if (!line) return;
      const w = ctx.measureText(line).width + LS * REF * Math.max(0, line.length - 1);
      if (w > widest) widest = w;
    });
  });
  if (!widest) return;
  let target = REF * (avail / widest) * 0.98; // fill width, tiny safety
  target = Math.max(24, Math.min(target, 88));
  roller.style.setProperty('--bfs', target + 'px');
}
function fitAll() { fitHero(); fitBelief(); }
['resize', 'orientationchange', 'load', 'pageshow'].forEach(ev => addEventListener(ev, fitAll));
// wait for the display font (Anton) before measuring so text widths are accurate
if (document.fonts && document.fonts.load) {
  Promise.all([
    document.fonts.load("400 40px 'Anton'"),
    document.fonts.load("700 40px 'Manrope'")
  ]).then(fitAll).catch(fitAll);
}
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);
[0, 150, 500, 1000, 1800].forEach(t => setTimeout(fitAll, t));  // re-fit until the font has settled

/* ---- Belief: center-emphasized vertical carousel (steps up one statement at a time) ---- */
(function () {
  const track = document.querySelector('.roller-track');
  if (!track) return;
  const roller = track.parentElement;
  const items = [...track.children];
  const N = items.length / 2;                 // list is duplicated in the HTML
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const EASE = 'transform .9s cubic-bezier(.22,1,.36,1)';
  let a = 1;                                   // index of the centred (active) item

  const slot = () => roller.clientHeight / 3;
  function place(animate) {
    track.style.transition = animate ? EASE : 'none';
    track.style.transform = 'translateY(' + (-(a - 1) * slot()) + 'px)';
    if (!animate) { void track.offsetHeight; }   // force reflow so the rebase never animates
    items.forEach((li, k) => li.classList.toggle('active', k === a));
  }
  place(false);

  if (!reduce) {
    setInterval(() => {
      a++;
      place(true);                             // always step one statement forward
      if (a >= N + 1) {                          // stepped one into the duplicate — rebase to the identical view
        setTimeout(() => { a -= N; place(false); }, 950);
      }
    }, 2800);
  }
  addEventListener('resize', () => place(false));
})();

/* ---- Contact form (front-end only placeholder) ---- */
const cf = document.getElementById('contactForm');
if (cf) cf.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = cf.querySelector('button[type=submit]');
  btn.textContent = 'Thank you! ✓';
  btn.disabled = true;
  cf.reset();
  setTimeout(() => { btn.textContent = 'Send Message'; btn.disabled = false; }, 3500);
});

/* ---- Bank details & Copy to clipboard ---- */
const BANK_DETAILS = {
  bank: "Wema Bank",
  accountName: "Haven Word Church",
  accountNumber: "0275817169"
};

function copyTextToClipboard(text, callback) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text)
      .then(callback)
      .catch(() => fallbackCopy(text, callback));
  } else {
    fallbackCopy(text, callback);
  }
}

function fallbackCopy(text, callback) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  ta.style.top = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    if (callback) callback();
  } catch (err) {
    console.error('Copy failed:', err);
  }
  document.body.removeChild(ta);
}

document.querySelectorAll('[data-copy]').forEach(el => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    const val = el.getAttribute('data-copy');
    if (!val) return;
    copyTextToClipboard(val, () => {
      document.querySelectorAll(`[data-copy="${val}"]`).forEach(btn => {
        if (btn._copyTimer) clearTimeout(btn._copyTimer);
        btn.classList.add('copied');

        const ic = btn.querySelector('i');
        if (ic) {
          if (!btn._origIcon) btn._origIcon = ic.className;
          ic.className = 'fa-solid fa-check';
        }

        const span = btn.querySelector('span:not(.copy-tooltip)');
        if (span) {
          if (!btn._origText) btn._origText = span.textContent;
          span.textContent = 'Copied! ✓';
        }

        const tip = btn.querySelector('.copy-tooltip');
        if (tip) tip.classList.add('show');

        btn._copyTimer = setTimeout(() => {
          btn.classList.remove('copied');
          if (ic && btn._origIcon) ic.className = btn._origIcon;
          if (span && btn._origText) {
            span.textContent = btn._origText;
            btn._origText = null;
          }
          if (tip) tip.classList.remove('show');
          btn._copyTimer = null;
        }, 2000);
      });
    });
  });
});

/* =====================================================================
   SOUL WINNERS CONFERENCE 2026 — INTERACTIVE LOGIC
   ===================================================================== */
(function initConference() {
  // 1. Live Countdown Timer (Target: Dec 12, 2026 08:00:00 WAT)
  const cdTarget = new Date('2026-12-12T08:00:00+01:00').getTime();
  const dEl = document.getElementById('cdDays');
  const hEl = document.getElementById('cdHours');
  const mEl = document.getElementById('cdMins');
  const sEl = document.getElementById('cdSecs');

  function updateCountdown() {
    if (!dEl) return;
    const now = Date.now();
    const diff = cdTarget - now;
    if (diff <= 0) {
      dEl.textContent = '00';
      hEl.textContent = '00';
      mEl.textContent = '00';
      sEl.textContent = '00';
      return;
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    dEl.textContent = String(days).padStart(2, '0');
    hEl.textContent = String(hours).padStart(2, '0');
    mEl.textContent = String(mins).padStart(2, '0');
    sEl.textContent = String(secs).padStart(2, '0');
  }
  if (dEl) {
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  // 2. Schedule Tabs
  const tabs = document.querySelectorAll('.sched-tab');
  const panels = document.querySelectorAll('.sched-panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-day');
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const activePanel = document.getElementById('dayPanel-' + target);
      if (activePanel) activePanel.classList.add('active');
    });
  });

  // 3. Registration Form submission
  const regForm = document.getElementById('confRegForm');
  const successBox = document.getElementById('regSuccessBox');
  const formBox = document.getElementById('regFormCard');

  // Check if previously registered
  try {
    const cached = localStorage.getItem('swc_registration_2026');
    if (cached && successBox && formBox) {
      const reg = JSON.parse(cached);
      populatePass(reg);
    }
  } catch (e) { }

  function populatePass(data) {
    if (!successBox) return;
    const pName = document.getElementById('passName');
    const pCode = document.getElementById('passCode');
    const pType = document.getElementById('passType');
    const pEmail = document.getElementById('passEmail');
    const pPhone = document.getElementById('passPhone');
    const pFrom = document.getElementById('passFrom');
    const pAccom = document.getElementById('passAccom');

    if (pName) pName.textContent = data.firstName + ' ' + data.lastName;
    if (pCode) pCode.textContent = data.regCode;
    if (pType) pType.textContent = data.isPastor === 'Yes' ? 'MINISTER / PASTOR' : 'CONFERENCE DELEGATE';
    if (pEmail) pEmail.textContent = data.email;
    if (pPhone) pPhone.textContent = data.phone;
    if (pFrom) pFrom.textContent = data.origin;
    if (pAccom) {
      pAccom.textContent = 'Free Admission (Confirmed)';
    }

    formBox.style.display = 'none';
    successBox.classList.add('active');
  }

  if (regForm) {
      regForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = regForm.querySelector('.btn-submit-reg');
        if (submitBtn) submitBtn.classList.add('loading');

        const formData = new FormData(regForm);
        const firstName = formData.get('first_name')?.toString().trim() || '';
        const lastName = formData.get('last_name')?.toString().trim() || '';
        const email = formData.get('email')?.toString().trim() || '';
        const phone = formData.get('phone')?.toString().trim() || '';
        const gender = formData.get('gender')?.toString() || 'Male';
        const isPastor = formData.get('is_pastor')?.toString() || 'No';
        const origin = formData.get('origin')?.toString() || 'Ibadan (Within Town)';
        const regCode = 'SWC-2026-' + Math.floor(1000 + Math.random() * 9000);
        const timestampIso = new Date().toISOString();
        const timestampFormatted = new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' });

        const data = {
          firstName,
          lastName,
          email,
          phone,
          gender,
          isPastor,
          origin,
          regCode,
          timestamp: timestampIso
        };

        const payload = {
          // Snake case keys
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone: phone,
          gender: gender,
          is_pastor: isPastor,
          origin: origin,
          reg_code: regCode,

          // Camel case keys
          firstName: firstName,
          lastName: lastName,
          isPastor: isPastor,
          regCode: regCode,
        fullName: `${firstName} ${lastName}`.trim(),

          // Formatted title case keys
          'First Name': firstName,
          'Last Name': lastName,
          'Full Name': `${firstName} ${lastName}`.trim(),
          'Email': email,
          'Phone': phone,
          'Gender': gender,
          'Is Pastor': isPastor,
          'Origin': origin,
          'Reg Code': regCode,
          'Timestamp': timestampFormatted,
          timestamp: timestampIso
        };

          const endpoint = (typeof LINKS !== 'undefined' && LINKS.conferenceRegEndpoint)
            ? LINKS.conferenceRegEndpoint
            : 'https://script.google.com/macros/s/AKfycbw6mxZq8BRTi6I89QCFnb3elDUmtM4uMd5WtFKPJ4Vzc7UxScg7jNM19HNWbglt2iRL_g/exec';

        // Submit to Google Sheets (text/plain payload avoids CORS preflight failures on Google Apps Script)
        try {
          if (endpoint) {
            await fetch(endpoint, {
              method: 'POST',
              mode: 'no-cors',
              headers: {
                'Content-Type': 'text/plain;charset=utf-8'
              },
              body: JSON.stringify(payload)
            });
          }
        } catch (err) {
          console.warn('Could not post registration to remote endpoint:', err);
        }

        try {
          localStorage.setItem('swc_registration_2026', JSON.stringify(data));
        } catch (err) { }

        populatePass(data);
        if (submitBtn) submitBtn.classList.remove('loading');
        successBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

  // 5. Register Another Action
  const btnResetReg = document.getElementById('btnResetReg');
    if (btnResetReg) {
      btnResetReg.addEventListener('click', (e) => {
        e.preventDefault();
        try { localStorage.removeItem('swc_registration_2026'); } catch (e) { }
        if (regForm) regForm.reset();
        if (successBox) successBox.classList.remove('active');
        if (formBox) formBox.style.display = 'block';
        if (formBox) formBox.scrollIntoView({ behavior: 'smooth' });
      });
    }

    // 6. Print Pass Action
    const btnPrintPass = document.getElementById('btnPrintPass');
    if (btnPrintPass) {
      btnPrintPass.addEventListener('click', (e) => {
        e.preventDefault();
        window.print();
      });
    }

    // 7. FAQ Accordion
    const faqCards = document.querySelectorAll('.faq-card');
    faqCards.forEach(card => {
      const q = card.querySelector('.faq-q');
      if (q) {
        q.addEventListener('click', () => {
          const isOpen = card.classList.contains('open');
          faqCards.forEach(c => c.classList.remove('open'));
          if (!isOpen) card.classList.add('open');
        });
      }
    });

    // 8. Hero Zoom-in Crossfade Slideshow
    const confSlides = document.querySelectorAll('.conf-slide');
    if (confSlides.length > 1) {
      let currentSlide = 0;
      setInterval(() => {
        confSlides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % confSlides.length;
        confSlides[currentSlide].classList.add('active');
      }, 5500);
    }
  }) ();
