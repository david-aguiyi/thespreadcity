/* =====================================================================
   THE SPREAD CITY — site config & behaviour
   ---------------------------------------------------------------------
   👉 EDIT THE LINKS BELOW with your real destinations. Every button and
      social icon across ALL pages reads from this one place.
   ===================================================================== */
const LINKS = {
  // Telegram channel (prayer, devotionals, audio messages)
  telegram:    "https://t.me/",          // TODO: paste your real Telegram channel link
  // Latest video message (YouTube / Facebook / Vimeo watch URL)
  latestVideo: "",                        // TODO: paste the latest video URL (leave "" for none yet)
  // Online giving link (Paystack / Flutterwave / etc.)
  giveOnline:  "",                        // TODO: paste your secure giving link
  // Podcast / streaming
  spotify:      "",                       // TODO: Spotify show link
  applePodcast: "",                       // TODO: Apple Podcasts link
  // Social profiles
  youtube:     "",                        // TODO
  instagram:   "",                        // TODO
  facebook:    "",                        // TODO
  tiktok:      "",                        // TODO
  x:           "",                        // TODO
  // Contact
  email:       "hello@thespreadcity.org", // TODO: your real church email
  phone:       "",                        // TODO: e.g. +234...
};

// Real Google Maps directions to the church address (already wired — no edit needed)
const CHURCH_ADDRESS = "Haven Word Church, Opposite Gate 5, Adamasingba, Ibadan, Oyo State, Nigeria";
LINKS.directions = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(CHURCH_ADDRESS);
LINKS.map        = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(CHURCH_ADDRESS);

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
if (LINKS.phone) document.querySelectorAll('[data-tel]').forEach(el => el.setAttribute('href', 'tel:' + LINKS.phone.replace(/\s/g,'')));

/* ---- Video: play button opens the latest video in a new tab (or nudges to Messages) ---- */
document.querySelectorAll('[data-video]').forEach(el => {
  el.addEventListener('click', () => {
    if (LINKS.latestVideo) window.open(LINKS.latestVideo, '_blank', 'noopener');
    else window.location.href = 'messages.html';
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
function openM(){ document.getElementById('mnav').classList.add('open'); }
function closeM(){ document.getElementById('mnav').classList.remove('open'); }
(function(){
  const mnav = document.getElementById('mnav');
  if(!mnav) return;
  // click on the backdrop (not a link) closes the menu
  mnav.addEventListener('click', (e) => { if(e.target === mnav) closeM(); });
  // Esc closes it too
  addEventListener('keydown', (e) => { if(e.key === 'Escape') closeM(); });
})();

/* ---- Fit the hero headline: as large as possible without spilling over ---- */
function fitHero(){
  const h1 = document.querySelector('.hero h1');
  if(!h1) return;
  h1.style.fontSize = '';                     // back to CSS base
  const box = h1.clientWidth;                 // available width
  if(!box) return;
  const cur = parseFloat(getComputedStyle(h1).fontSize) || 48;
  // measure the WIDEST line at the current font (shrink h1 to its content width)
  const dPrev = h1.style.display, wPrev = h1.style.width;
  h1.style.display = 'inline-block';
  h1.style.width = 'max-content';
  const widest = h1.getBoundingClientRect().width;
  h1.style.display = dPrev;
  h1.style.width = wPrev;
  if(!widest) return;
  let target = cur * ((box - 1) / widest);    // scale so the widest line fills the width
  target = Math.max(22, Math.min(target, 82)); // cap so it never overwhelms large screens
  h1.style.fontSize = target + 'px';
}
addEventListener('resize', fitHero);
addEventListener('orientationchange', fitHero);
addEventListener('load', fitHero);
addEventListener('pageshow', fitHero);
if(document.fonts && document.fonts.ready) document.fonts.ready.then(fitHero);
requestAnimationFrame(fitHero);
setTimeout(fitHero, 300);
fitHero();

/* ---- Fit the belief carousel: biggest size that keeps every statement on 2 lines ---- */
function fitBelief(){
  const roller = document.querySelector('.belief-roller');
  if(!roller) return;
  const lns = [...roller.querySelectorAll('.roller-track li .ln')];
  if(!lns.length) return;
  const avail = roller.clientWidth - 24;      // li has 12px padding each side
  if(avail <= 0) return;
  const REF = 100, LS = 0.015;                // reference px, letter-spacing (em)
  const ctx = fitBelief._ctx || (fitBelief._ctx = document.createElement('canvas').getContext('2d'));
  ctx.font = '400 ' + REF + "px Anton, sans-serif";
  let widest = 0;                             // widest single line across every statement, at REF px
  lns.forEach(ln => {
    ln.innerHTML.split(/<br\s*\/?>/i).forEach(part => {
      const tmp = document.createElement('div');
      tmp.innerHTML = part;
      const line = (tmp.textContent || '').trim().toUpperCase();
      if(!line) return;
      const w = ctx.measureText(line).width + LS * REF * Math.max(0, line.length - 1);
      if(w > widest) widest = w;
    });
  });
  if(!widest) return;
  let target = REF * (avail / widest) * 0.98; // fill width, tiny safety
  target = Math.max(24, Math.min(target, 88));
  roller.style.setProperty('--bfs', target + 'px');
}
function fitAll(){ fitHero(); fitBelief(); }
['resize','orientationchange','load','pageshow'].forEach(ev => addEventListener(ev, fitAll));
// wait for the display font (Anton) before measuring so text widths are accurate
if(document.fonts && document.fonts.load){
  Promise.all([
    document.fonts.load("400 40px 'Anton'"),
    document.fonts.load("700 40px 'Manrope'")
  ]).then(fitAll).catch(fitAll);
}
if(document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);
[0, 150, 500, 1000, 1800].forEach(t => setTimeout(fitAll, t));  // re-fit until the font has settled

/* ---- Belief: center-emphasized vertical carousel (steps up one statement at a time) ---- */
(function(){
  const track = document.querySelector('.roller-track');
  if(!track) return;
  const roller = track.parentElement;
  const items = [...track.children];
  const N = items.length / 2;                 // list is duplicated in the HTML
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const EASE = 'transform .9s cubic-bezier(.22,1,.36,1)';
  let a = 1;                                   // index of the centred (active) item

  const slot = () => roller.clientHeight / 3;
  function place(animate){
    track.style.transition = animate ? EASE : 'none';
    track.style.transform  = 'translateY(' + (-(a - 1) * slot()) + 'px)';
    if(!animate){ void track.offsetHeight; }   // force reflow so the rebase never animates
    items.forEach((li, k) => li.classList.toggle('active', k === a));
  }
  place(false);

  if(!reduce){
    setInterval(() => {
      a++;
      place(true);                             // always step one statement forward
      if(a >= N + 1){                          // stepped one into the duplicate — rebase to the identical view
        setTimeout(() => { a -= N; place(false); }, 950);
      }
    }, 2800);
  }
  addEventListener('resize', () => place(false));
})();

/* ---- Message filter chips (messages page) ---- */
document.querySelectorAll('.filter-bar .chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.filter-bar .chip').forEach(c => c.classList.remove('on'));
    chip.classList.add('on');
    const f = chip.dataset.filter;
    document.querySelectorAll('.msg-card').forEach(card => {
      card.style.display = (f === 'all' || card.dataset.type === f) ? '' : 'none';
    });
  });
});

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
