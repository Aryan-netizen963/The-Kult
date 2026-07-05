/* ================================================================
   THE KULT v2 — MAIN JAVASCRIPT
   ================================================================
   Table of Contents:
   1.  Navbar — floating pill on scroll
   2.  Mobile menu — toggle open/close
   3.  Scroll reveal — IntersectionObserver fade-in
   4.  Cursor-follow section glow — lerped radial per [data-glow]
   5.  Magnetic micro-interactions — nav links, CTAs
   6.  Count-up animation — stat counters
   7.  Case study cards — data + render into bento track
   8.  Artist portfolio cards — data + render into bento track
   9.  Creator network — 3D-style orbiting SVG graph
   10. FAQ accordion — single-open expand/collapse
   11. Bento carousel engine — drag + snap + rail + arrows
   12. Hero audio player — play/pause with AbortError guard
   13. Hero waveform canvas — Candy Blue sine lines
   ================================================================ */

'use strict';


/* ----------------------------------------------------------------
   1. NAVBAR — floating pill on scroll
   Adds .scrolled to #navbar after 40px; CSS handles pill morph.
   ---------------------------------------------------------------- */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });


/* ----------------------------------------------------------------
   2. MOBILE MENU — toggle open / close
   ---------------------------------------------------------------- */
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu    = document.getElementById('mobileMenu');

mobileMenuBtn.addEventListener('click', () => {
  mobileMenu.classList.toggle('hidden');
});

mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => mobileMenu.classList.add('hidden'));
});


/* ----------------------------------------------------------------
   3. SCROLL REVEAL
   Uses IntersectionObserver at 15% threshold.
   Unobserves after first reveal (runs once).
   ---------------------------------------------------------------- */
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealEls.forEach(el => revealObserver.observe(el));


/* ----------------------------------------------------------------
   4. CURSOR-FOLLOW SECTION GLOW
   Injects a .cursor-glow div into every [data-glow] section.
   Mouse position is lerped 12% per frame toward the real cursor
   so the candy-blue radial gradient trails fluidly.
   Writes CSS custom properties (--gx, --gy) — paint-only, no layout.
   Skipped entirely on touch-only devices.
   ---------------------------------------------------------------- */
(function initCursorGlow() {
  // Skip on touch devices — pointermove doesn't fire for them
  if (window.matchMedia('(hover: none)').matches) return;

  const sections = [...document.querySelectorAll('[data-glow]')];
  if (!sections.length) return;

  let active = null;
  let raf    = null;
  const pos    = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };

  sections.forEach(sec => {
    // Inject the glow layer as the first child
    const layer = document.createElement('div');
    layer.className = 'cursor-glow';
    sec.prepend(layer);

    // Ensure the section is a positioning context
    if (getComputedStyle(sec).position === 'static') {
      sec.style.position = 'relative';
    }

    sec.addEventListener('pointerenter', e => {
      active = { sec, layer };
      snapToPointer(e);
      startLoop();
    });

    sec.addEventListener('pointermove', e => {
      if (active && active.sec === sec) trackPointer(e);
    });

    sec.addEventListener('pointerleave', () => {
      if (active && active.sec === sec) {
        active = null;
        cancelAnimationFrame(raf);
      }
    });
  });

  function getRelativeCoords(e) {
    const rect = active.sec.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  function snapToPointer(e) {
    const c = getRelativeCoords(e);
    pos.x = target.x = c.x;
    pos.y = target.y = c.y;
  }

  function trackPointer(e) {
    const c = getRelativeCoords(e);
    target.x = c.x;
    target.y = c.y;
  }

  function startLoop() {
    function loop() {
      if (!active) return;

      // Lerp 12% per frame — gives fluid trailing feel
      pos.x += (target.x - pos.x) * 0.12;
      pos.y += (target.y - pos.y) * 0.12;

      active.layer.style.setProperty('--gx', pos.x + 'px');
      active.layer.style.setProperty('--gy', pos.y + 'px');

      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
  }
})();


/* ----------------------------------------------------------------
   5. MAGNETIC MICRO-INTERACTIONS
   Elements with .magnetic subtly pull toward the cursor.
   Translation capped at maxShift px to keep nav links readable.
   On pointer-leave, .is-releasing enables the spring-back transition.
   ---------------------------------------------------------------- */
(function initMagnetic() {
  if (window.matchMedia('(hover: none)').matches) return;

  const STRENGTH  = 0.28;   // fraction of offset applied as translation
  const MAX_SHIFT = 12;     // px cap

  document.querySelectorAll('.magnetic').forEach(el => {
    el.addEventListener('pointermove', e => {
      el.classList.remove('is-releasing');

      const rect = el.getBoundingClientRect();
      const dx   = e.clientX - (rect.left + rect.width  / 2);
      const dy   = e.clientY - (rect.top  + rect.height / 2);

      const tx = Math.max(-MAX_SHIFT, Math.min(MAX_SHIFT, dx * STRENGTH));
      const ty = Math.max(-MAX_SHIFT, Math.min(MAX_SHIFT, dy * STRENGTH));

      el.style.transform = `translate(${tx}px, ${ty}px) scale(1.04)`;
    });

    el.addEventListener('pointerleave', () => {
      el.classList.add('is-releasing');
      el.style.transform = 'translate(0, 0) scale(1)';
    });
  });
})();


/* ----------------------------------------------------------------
   6. COUNT-UP ANIMATION — Section 3 stat cards
   Triggered by IntersectionObserver at 40% visibility.
   Uses ease-out cubic easing over 1800ms.
   ---------------------------------------------------------------- */
const counters = document.querySelectorAll('.counter');

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    const el       = entry.target;
    const target   = parseFloat(el.dataset.target);
    const suffix   = el.dataset.suffix || '';
    const duration = 1800;
    const start    = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      const value    = target * eased;

      el.textContent = (target >= 100 ? Math.floor(value) : value.toFixed(0)) + suffix;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target + suffix;
      }
    }

    requestAnimationFrame(tick);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.4 });

counters.forEach(el => counterObserver.observe(el));


/* ----------------------------------------------------------------
   7. CASE STUDY CARDS — data + render into bento track
   All campaign data is identical to v1.
   Cards clone #caseStudyTemplate into #caseStudyGrid (.bento-track).
   ---------------------------------------------------------------- */
const caseStudies = [
  {
    name: 'exhibit',
    duration: '4-Week Campaign',
    spotifyBefore: '1.2k streams',
    spotifyAfter:  '500k streams',
    tiktokBefore:  '1K views',
    tiktokAfter:   '3M views',
    growth: '+41,567%',
    image: 'images/exhibit.jpg',
    bars: [10, 18, 22, 35, 52, 78, 100],
  },
  {
    name: 'Jaquarious indie',
    duration: '2-Week Campaign',
    spotifyBefore: '1.2k streams',
    spotifyAfter:  '200k streams',
    tiktokBefore:  '1K views',
    tiktokAfter:   '2.2M views',
    growth: '+16,567%',
    image: 'images/jaquarious-indie-cover.jpg',
    bars: [10, 18, 22, 35, 52, 78, 100],
  },
  {
    name: 'Wer$e',
    duration: '2-Week Campaign',
    spotifyBefore: '1k streams',
    spotifyAfter:  '170K streams',
    tiktokBefore:  '1K views',
    tiktokAfter:   '1.5M views',
    growth: '+16,900%',
    image: 'images/wer$e.jpg',
    bars: [14, 20, 28, 40, 55, 72, 95],
  },
  {
    name: 'ifwmyglokk',
    duration: '2-Week Campaign',
    spotifyBefore: '12K streams',
    spotifyAfter:  '400k streams',
    tiktokBefore:  '60K views',
    tiktokAfter:   '3M views',
    growth: '+3,233%',
    image: 'images/ifwmyglokk.jpg',
    bars: [12, 16, 24, 38, 60, 82, 100],
  },
  {
    name: 'predayed',
    duration: '3-Week Campaign',
    spotifyBefore: '30K streams',
    spotifyAfter:  '500K streams',
    tiktokBefore:  '180K views',
    tiktokAfter:   '6M views',
    growth: '+1,567%',
    image: 'images/predayed.jpg',
    bars: [8, 15, 26, 40, 58, 76, 98],
  },
  {
    name: 'The Kavities',
    duration: '3-Week Campaign',
    spotifyBefore: '60K streams',
    spotifyAfter:  '250K streams',
    tiktokBefore:  '25K views',
    tiktokAfter:   '2.5M views',
    growth: '+317%',
    image: 'images/thekavities.jpg',
    bars: [10, 18, 28, 42, 60, 78, 96],
  },
];

const caseGrid     = document.getElementById('caseStudyGrid');
const caseTemplate = document.getElementById('caseStudyTemplate');

if (caseGrid && caseTemplate) {
  caseStudies.forEach(c => {
    const node = caseTemplate.content.cloneNode(true);

    node.querySelector('.artist-name').textContent       = c.name;
    node.querySelector('.campaign-duration').textContent = c.duration;
    node.querySelector('.stream-before').textContent     = c.spotifyBefore + ' →';
    node.querySelector('.stream-after').textContent      = c.spotifyAfter;
    node.querySelector('.tiktok-before').textContent     = c.tiktokBefore + ' →';
    node.querySelector('.tiktok-after').textContent      = c.tiktokAfter;
    node.querySelector('.growth-badge').textContent      = `${c.growth} growth`;

    const caseImg         = node.querySelector('.case-study-image');
    const casePlaceholder = node.querySelector('.case-study-placeholder');

    if (caseImg && casePlaceholder) {
      caseImg.alt = c.name;
      caseImg.onload  = () => {
        caseImg.classList.remove('hidden');
        casePlaceholder.classList.add('hidden');
      };
      caseImg.onerror = () => console.warn(`Case study image not found: ${c.image}`);
      caseImg.src = c.image;
    }

    // Build mini bar chart
    const chartEl = node.querySelector('[data-chart]');
    if (chartEl) {
      c.bars.forEach((h, idx) => {
        const bar = document.createElement('div');
        bar.className = 'chart-bar flex-1 rounded-t-sm bg-gradient-to-t from-ice/20 to-ice';
        bar.style.height          = `${h}%`;
        bar.style.transitionDelay = `${idx * 60}ms`;
        chartEl.appendChild(bar);
      });
    }

    caseGrid.appendChild(node);
  });

  // Animate chart bars when they scroll into view inside the carousel
  const chartBarObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.chart-bar').forEach(bar => bar.classList.add('is-visible'));
        chartBarObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('#caseStudyGrid [data-chart]').forEach(el => chartBarObserver.observe(el));
}


/* ----------------------------------------------------------------
   8. ARTIST PORTFOLIO CARDS — data + render into bento track
   All artist data identical to v1.
   Cards clone #artistTemplate into #artistGrid (.bento-track).
   ---------------------------------------------------------------- */
const artists = [
  { name: 'Jaquarious indie', genre: 'Indie Pop',     tiktok: '2.2M', spotify: '200k', duration: '2 weeks', image: 'images/jaquarious-indie-cover.jpg' },
  { name: 'wer$e',            genre: 'Indie',          tiktok: '1.5M', spotify: '170K', duration: '2 weeks', image: 'images/wer$e.jpg' },
  { name: 'exhibit',          genre: 'Ambient music',  tiktok: '3M',   spotify: '500k', duration: '4 weeks', image: 'images/exhibit.jpg' },
  { name: 'The Kavities',     genre: 'Dream Pop',      tiktok: '2.5M', spotify: '250k', duration: '3 weeks', image: 'images/thekavities.jpg' },
  { name: 'Predayed',         genre: 'Rap',            tiktok: '6M',   spotify: '500K', duration: '4 weeks', image: 'images/predayed.jpg' },
  { name: 'ifwmyglokk',       genre: 'indie',          tiktok: '3M',   spotify: '400k', duration: '2 weeks', image: 'images/ifwmyglokk.jpg' },
];

const artistGrid     = document.getElementById('artistGrid');
const artistTemplate = document.getElementById('artistTemplate');

if (artistGrid && artistTemplate) {
  artists.forEach(a => {
    const node = artistTemplate.content.cloneNode(true);

    node.querySelector('.genre-tag').textContent        = a.genre;
    node.querySelector('.artist-name').textContent      = a.name;
    node.querySelector('.duration-tag').textContent     = `Campaign · ${a.duration}`;
    node.querySelector('.tiktok-views').textContent     = `+${a.tiktok}`;
    node.querySelector('.spotify-streams').textContent  = `+${a.spotify}`;

    const img         = node.querySelector('.artist-image');
    const placeholder = node.querySelector('.placeholder-icon');

    img.alt = a.name;
    img.onload  = () => { img.classList.remove('hidden'); placeholder.classList.add('hidden'); };
    img.onerror = () => console.warn(`Artist image not found for ${a.name}: ${a.image}`);
    img.src = a.image;

    artistGrid.appendChild(node);
  });
}


/* ----------------------------------------------------------------
   9. CREATOR NETWORK VISUALIZATION — 3D-style orbiting graph
   Nodes orbit the hub on a tilted ellipse. Depth (front/back of
   the orbit) controls size, opacity, and line thickness, giving
   a sense of 3D space. Small light pulses travel along each
   spoke toward the hub to suggest live data flow.
   Visibility-gated rAF loop: stops when section scrolls away.
   Colors updated to Candy Blue #B2D5E5 / Frost #DCEDF5.
   ---------------------------------------------------------------- */
(function buildNetwork3D() {
  const svg   = document.getElementById('networkSvg');
  const group = document.getElementById('networkOrbit');
  if (!svg || !group) return;

  const hub       = { x: 400, y: 130 };
  const nodeCount = 14;
  const radiusX   = 300;
  const radiusY   = 65;

  const nodes = [];
  for (let i = 0; i < nodeCount; i++) {
    nodes.push({ baseAngle: (i / nodeCount) * Math.PI * 2 });
  }

  let rotation     = 0;
  let isVisible    = true;
  let needsRestart = false;
  const NS = 'http://www.w3.org/2000/svg';

  function render() {
    if (isVisible) {
      group.innerHTML = '';
      rotation += 0.0025;

      const positioned = nodes.map((node, idx) => {
        const a     = node.baseAngle + rotation;
        const x     = hub.x + Math.cos(a) * radiusX;
        const y     = hub.y + Math.sin(a) * radiusY;
        const depth = (Math.sin(a) + 1) / 2;
        return {
          x, y, depth, idx,
          scale:   0.5 + depth * 0.9,
          opacity: 0.22 + depth * 0.68,
        };
      });

      positioned.sort((p1, p2) => p1.depth - p2.depth);

      positioned.forEach(node => {
        // Spoke line
        const line = document.createElementNS(NS, 'line');
        line.setAttribute('x1', hub.x);
        line.setAttribute('y1', hub.y);
        line.setAttribute('x2', node.x);
        line.setAttribute('y2', node.y);
        line.setAttribute('stroke', '#B2D5E5');
        line.setAttribute('stroke-width', 0.5 + node.depth * 1.2);
        line.setAttribute('stroke-opacity', node.opacity * 0.4);
        group.appendChild(line);

        // Outer node circle
        const circle = document.createElementNS(NS, 'circle');
        circle.setAttribute('cx', node.x);
        circle.setAttribute('cy', node.y);
        circle.setAttribute('r', 3 + node.scale * 4);
        circle.setAttribute('fill', '#B2D5E5');
        circle.setAttribute('fill-opacity', node.opacity);
        group.appendChild(circle);

        // Travelling pulse dot along the spoke
        const t  = (Date.now() / 1000 * 0.5 + node.idx * 0.35) % 1;
        const px = hub.x + (node.x - hub.x) * t;
        const py = hub.y + (node.y - hub.y) * t;

        const pulse = document.createElementNS(NS, 'circle');
        pulse.setAttribute('cx', px);
        pulse.setAttribute('cy', py);
        pulse.setAttribute('r', 1.6);
        pulse.setAttribute('fill', '#DCEDF5');
        pulse.setAttribute('fill-opacity', node.opacity);
        group.appendChild(pulse);
      });

      requestAnimationFrame(render);
    } else {
      needsRestart = true;
    }
  }

  render();

  // Restart loop when the section scrolls back into view
  new IntersectionObserver((entries) => {
    entries.forEach(e => {
      isVisible = e.isIntersecting;
      if (isVisible && needsRestart) {
        needsRestart = false;
        render();
      }
    });
  }, { threshold: 0.1 }).observe(svg);
})();


/* ----------------------------------------------------------------
   10. FAQ ACCORDION
   Single-open: clicking opens one panel, closes all others.
   The .faq-icon rotates 45° when open (+ → ×).
   ---------------------------------------------------------------- */
document.querySelectorAll('.faq-item').forEach(item => {
  const trigger = item.querySelector('.faq-trigger');
  const panel   = item.querySelector('.accordion-panel');
  const icon    = item.querySelector('.faq-icon');

  trigger.addEventListener('click', () => {
    const isOpen = panel.style.maxHeight && panel.style.maxHeight !== '0px';

    // Close every panel + reset all icons
    document.querySelectorAll('.accordion-panel').forEach(p => p.style.maxHeight = '0px');
    document.querySelectorAll('.faq-icon').forEach(i => i.style.transform = 'rotate(0deg)');

    // If this panel was closed, open it
    if (!isOpen) {
      panel.style.maxHeight = panel.scrollHeight + 'px';
      icon.style.transform  = 'rotate(45deg)';
    }
  });
});


/* ----------------------------------------------------------------
   11. BENTO CAROUSEL ENGINE
   One engine powers all tracks marked [data-bento]:
   — Mouse drag-to-scroll (pointer capture, momentum handoff to snap)
   — Arrow buttons (data-bento-prev="trackId" / data-bento-next="trackId")
   — Progress rail fill (data-bento-rail="trackId") via scaleX transform
   Touch swiping is fully native via scroll-snap — no JS needed there.
   ---------------------------------------------------------------- */
(function initBento() {
  document.querySelectorAll('[data-bento]').forEach(track => {
    const id = track.id;

    /* -- Mouse drag-to-scroll -------------------------------------- */
    let isDown     = false;
    let startX     = 0;
    let startScroll= 0;
    let moved      = false;

    track.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse') return;   // touch handled natively
      isDown = true;
      moved  = false;
      startX = e.clientX;
      startScroll = track.scrollLeft;
      track.classList.add('is-dragging');
      track.setPointerCapture(e.pointerId);
    });

    track.addEventListener('pointermove', e => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      track.scrollLeft = startScroll - dx;
    });

    function release() {
      if (!isDown) return;
      isDown = false;
      track.classList.remove('is-dragging');  // snap re-engages → glides to nearest card
    }

    track.addEventListener('pointerup',     release);
    track.addEventListener('pointercancel', release);

    // Prevent click from firing on drag-end (e.g. hitting a CTA link mid-drag)
    track.addEventListener('click', e => {
      if (moved) { e.preventDefault(); e.stopPropagation(); }
    }, true);

    /* -- Arrow button controls ------------------------------------- */
    function cardWidth() {
      const card = track.querySelector('.bento-card');
      return card ? card.getBoundingClientRect().width + 20 : 360;
    }

    document.querySelectorAll(`[data-bento-prev="${id}"]`).forEach(btn => {
      btn.addEventListener('click', () =>
        track.scrollBy({ left: -cardWidth(), behavior: 'smooth' }));
    });

    document.querySelectorAll(`[data-bento-next="${id}"]`).forEach(btn => {
      btn.addEventListener('click', () =>
        track.scrollBy({ left: cardWidth(), behavior: 'smooth' }));
    });

    /* -- Progress rail --------------------------------------------- */
    const rail = document.querySelector(`[data-bento-rail="${id}"]`);
    if (rail) {
      function updateRail() {
        const max = track.scrollWidth - track.clientWidth;
        const pct = max > 0 ? track.scrollLeft / max : 0;
        rail.style.transform = `scaleX(${pct})`;
      }
      track.addEventListener('scroll', () => requestAnimationFrame(updateRail), { passive: true });
      window.addEventListener('resize', updateRail);
      updateRail();
    }
  });
})();


/* ----------------------------------------------------------------
   12. HERO BACKGROUND VIDEO
   Fades the video in only once it's actually playable, so users
   never see a loading stutter — just the dark fallback, then a
   smooth cross-fade into footage. Honors reduced-motion by
   pausing the video for those users.
   ---------------------------------------------------------------- */
(function initHeroVideo() {
  const vid = document.querySelector('.hero-video-el');
  if (!vid) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    vid.pause();
    vid.classList.add('is-ready');
    return;
  }

  const reveal = () => vid.classList.add('is-ready');
  if (vid.readyState >= 3) reveal();
  else vid.addEventListener('canplay', reveal, { once: true });
})();

/* ----------------------------------------------------------------
   PACKAGE AUTOFILL
   Pricing carousel "Get Started" / "Launch Campaign" buttons
   pre-select the matching option in the #field_budget dropdown.
   ---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.package-btn').forEach(button => {
    button.addEventListener('click', () => {
      const packageField = document.getElementById('field_budget');
      if (packageField) packageField.value = button.dataset.package;
    });
  });
});


/* ----------------------------------------------------------------
   CONTACT FORM — character counter + EmailJS submit
   Inline in index.html at the bottom of the form section,
   keeping this block here for organization reference only.
   Actual form submit handler lives in the inline <script> tag
   immediately after the form in index.html (unchanged from v1).
   ---------------------------------------------------------------- */