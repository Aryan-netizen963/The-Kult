/* ================================================================
   WAVELENGTH — MAIN JAVASCRIPT
   ================================================================
   Table of Contents:
   1.  Navbar: blur on scroll
   2.  Mobile menu: toggle open/close
   3.  Scroll reveal: fade-in elements as they enter the viewport
   4.  Particle field: animated dots behind the hero section
   5.  Count-up animation: animated stat numbers in Section 3
   6.  Case study cards: data + DOM render
   7.  Artist portfolio cards: data + DOM render
   8.  Dashboard line charts: animated SVG draw-in
   9.  Creator network visualization: SVG node/line graph
   10. FAQ accordion: single-open expand/collapse
   ================================================================ */

'use strict';

/* ----------------------------------------------------------------
   1. NAVBAR — blur on scroll
   Adds .scrolled to #navbar after the page scrolls 40px.
   The CSS rule #navbar.scrolled applies the frosted-glass effect.
   ---------------------------------------------------------------- */
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});


/* ----------------------------------------------------------------
   2. MOBILE MENU — toggle open / close
   The hamburger button toggles the .hidden class on the dropdown.
   Each nav link also closes it so it doesn't linger mid-page.
   ---------------------------------------------------------------- */
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu    = document.getElementById('mobileMenu');

mobileMenuBtn.addEventListener('click', () => {
  mobileMenu.classList.toggle('hidden');
});

// Close the menu automatically when any link inside it is tapped
mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => mobileMenu.classList.add('hidden'));
});


/* ----------------------------------------------------------------
   3. SCROLL REVEAL
   Uses IntersectionObserver to add .is-visible to any .reveal
   element when it enters the viewport at 15% threshold.
   Once visible, the element is unobserved (animation runs once).
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
   4. PARTICLE FIELD — hero background
   Creates 36 tiny floating dots and appends them to #particleField.
   Each particle gets randomised: size, horizontal start, speed,
   and delay — so they feel organic rather than synchronised.
   ---------------------------------------------------------------- */
const particleField  = document.getElementById('particleField');
const PARTICLE_COUNT = 36; // ← change this to add/remove particles

for (let i = 0; i < PARTICLE_COUNT; i++) {
  const p    = document.createElement('div');
  const size = Math.random() * 3 + 1; // 1 – 4 px

  p.className = 'particle';
  p.style.width           = `${size}px`;
  p.style.height          = `${size}px`;
  p.style.left            = `${Math.random() * 100}%`;
  p.style.bottom          = `-${Math.random() * 20}px`;
  p.style.animationDuration = `${12 + Math.random() * 14}s`;
  p.style.animationDelay    = `${Math.random() * 10}s`;

  particleField.appendChild(p);
}


/* ----------------------------------------------------------------
   5. COUNT-UP ANIMATION — Section 3 stat cards
   Each .counter element needs two data attributes:
     data-target   — the final number to count up to
     data-suffix   — optional string appended after the number (e.g. "M+")
   Uses an ease-out cubic curve over 1800 ms.
   ---------------------------------------------------------------- */
const counters = document.querySelectorAll('.counter');

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;

    const el       = entry.target;
    const target   = parseFloat(el.dataset.target);
    const suffix   = el.dataset.suffix || '';
    const duration = 1800; // animation length in ms
    const start    = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const value    = target * eased;

      // Show integers for large numbers, no decimal for small ones
      el.textContent = (target >= 100 ? Math.floor(value) : value.toFixed(0)) + suffix;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target + suffix; // snap to final value
      }
    }

    requestAnimationFrame(tick);
    counterObserver.unobserve(el); // run once only
  });
}, { threshold: 0.4 });

counters.forEach(el => counterObserver.observe(el));


/* ----------------------------------------------------------------
   6. CASE STUDY CARDS — data + render
   ----------------------------------------------------------------
   To add or edit a case study, update the caseStudies array below.
   Each object maps to one card cloned from #caseStudyTemplate.

   Fields:
     name          — artist name
     duration      — e.g. "6-Week Campaign"
     spotifyBefore — stream count before campaign
     spotifyAfter  — stream count after campaign
     tiktokBefore  — view count before campaign
     tiktokAfter   — view count after campaign
     growth        — headline growth % badge
     bars          — array of 7 heights (0–100) for the mini chart
   ---------------------------------------------------------------- */
const caseStudies = [
  { name: 'exhibit', duration: '4-Week Campaign',  spotifyBefore: '1.2k streams',  spotifyAfter: '500k streams', tiktokBefore: '1K views', tiktokAfter: '3M views',   growth: '+41,567%', image: 'images/exhibit.jpg', bars: [10,18,22,35,52,78,100]  },
  { name: 'Jaquarious indie', duration: '2-Week Campaign',  spotifyBefore: '1.2k streams',  spotifyAfter: '200k streams', tiktokBefore: '1K views', tiktokAfter: '2.2M views',   growth: '+16,567%', image: 'images/jaquarious-indie.jpg', bars: [10,18,22,35,52,78,100]  },
  { name: 'Wer$e',  duration: '2-Week Campaign',  spotifyBefore: '1k streams',  spotifyAfter: '170K streams', tiktokBefore: '1K views', tiktokAfter: '1.5M views',  growth: '+16,900%', image: 'images/wer$e.jpg', bars: [14,20,28,40,55,72,95]  },
  { name: 'ifwmyglokk', duration: '2-Week Campaign', spotifyBefore: '12K streams', spotifyAfter: '400k streams', tiktokBefore: '60K views', tiktokAfter: '3M views', growth: '+3,233%', image: 'images/ifwmyglokk.jpg', bars: [12,16,24,38,60,82,100] },
  { name: 'predayed', duration: '3-Week Campaign',  spotifyBefore: '30K streams',  spotifyAfter: '500K streams', tiktokBefore: '180K views', tiktokAfter: '6M views',  growth: '+1,567%', image: 'images/predayed.jpg', bars: [8,15,26,40,58,76,98]   },
  { name: 'The Kavities',   duration: '3-Week Campaign',  spotifyBefore: '60K streams',  spotifyAfter: '250K streams', tiktokBefore: '25K views', tiktokAfter: '2.5M views',  growth: '+317%', image: 'images/thekavities.jpg', bars: [10,18,28,42,60,78,96]  },
];

const caseGrid     = document.getElementById('caseStudyGrid');
const caseTemplate = document.getElementById('caseStudyTemplate');

caseStudies.forEach((c, i) => {
  const node = caseTemplate.content.cloneNode(true);

  // Populate text fields
  node.querySelector('.artist-name').textContent       = c.name;
  node.querySelector('.campaign-duration').textContent = c.duration;
  node.querySelector('.stream-before').textContent     = c.spotifyBefore + ' →';
  node.querySelector('.stream-after').textContent      = c.spotifyAfter;
  node.querySelector('.tiktok-before').textContent     = c.tiktokBefore + ' →';
  node.querySelector('.tiktok-after').textContent      = c.tiktokAfter;
  node.querySelector('.growth-badge').textContent      = `${c.growth} growth`;
 
  const caseImg = node.querySelector('.case-study-image');
  const casePlaceholder = node.querySelector('.case-study-placeholder');

  if (caseImg && casePlaceholder) {
  caseImg.alt = c.name;
  caseImg.onload = () => {
    caseImg.classList.remove('hidden');
    casePlaceholder.classList.add('hidden');
  };
  caseImg.onerror = () => {
    console.warn(`Case study image not found for ${c.name}: ${c.image}`);
  };
  caseImg.src = c.image;
}
 

  // Build the mini bar chart from the bars array
  const chartEl = node.querySelector('[data-chart]');
  c.bars.forEach((h, idx) => {
    const bar = document.createElement('div');
    bar.className = 'chart-bar flex-1 rounded-t-sm bg-gradient-to-t from-ice/20 to-ice';
    bar.style.height          = `${h}%`;
    bar.style.transitionDelay = `${idx * 60}ms`;
    chartEl.appendChild(bar);
  });

  // Stagger card entrance within each row of 3
  const card = node.querySelector('.reveal');
  card.style.transitionDelay = `${(i % 3) * 0.1}s`;

  caseGrid.appendChild(node);
});

// Wire up newly-injected elements to the existing observers
document.querySelectorAll('#caseStudyGrid .reveal').forEach(el => revealObserver.observe(el));

// Separate observer for chart bars (triggers at 30% visibility)
const chartBarObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.chart-bar').forEach(bar => bar.classList.add('is-visible'));
      chartBarObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('#caseStudyGrid [data-chart]').forEach(el => chartBarObserver.observe(el));


/* ----------------------------------------------------------------
   7. ARTIST PORTFOLIO CARDS — data + render
   ----------------------------------------------------------------
   To add / remove artists, edit the artists array below.
   Cards are cloned from #artistTemplate.

   Fields:
     name     — artist name displayed on the card
     genre    — genre label badge
     tiktok   — total TikTok views gained
     spotify  — total Spotify streams gained
     duration — campaign length shown as "Campaign · X weeks"
   ---------------------------------------------------------------- */
const artists = [
  { name: 'Jaquarious indie',genre: 'Indie Pop',          tiktok: '2.2M',  spotify: '200k',  duration: '2 weeks', image: 'images/jaquarious-indie.jpg', },
  { name: 'wer$e',           genre: 'Indie',              tiktok: '1.5M',  spotify: '170K',  duration: '2 weeks', image: 'images/wer$e.jpg', },
  { name: 'exhibit',         genre: 'Ambient music',      tiktok: '3M'   , spotify: '500k',  duration: '4 weeks', image: 'images/exhibit.jpg', },
  { name: 'The Kavities',    genre: 'Dream Pop',          tiktok: '2.5M',  spotify: '250k',  duration: '3 weeks', image: 'images/thekavities.jpg', },
  { name: 'Predayed',        genre: 'Rap',                tiktok: '6M',    spotify: '500K',  duration: '4 weeks', image: 'images/predayed.jpg', },
  { name: 'ifwmyglokk',      genre: 'indie',              tiktok: '3M',    spotify: '400k',  duration: '2 weeks', image: 'images/ifwmyglokk.jpg', }
];

const artistGrid     = document.getElementById('artistGrid');
const artistTemplate = document.getElementById('artistTemplate');

artists.forEach((a, i) => {
  const node = artistTemplate.content.cloneNode(true);

  node.querySelector('.genre-tag').textContent      = a.genre;
  node.querySelector('.artist-name').textContent    = a.name;
  node.querySelector('.duration-tag').textContent   = `Campaign · ${a.duration}`;
  node.querySelector('.tiktok-views').textContent   = `+${a.tiktok}`;
  node.querySelector('.spotify-streams').textContent = `+${a.spotify}`;

  // ADD — wire up the artist photo
  const img = node.querySelector('.artist-image');
  const placeholder = node.querySelector('.placeholder-icon');

  img.alt = a.name;
  img.onload = () => {
    img.classList.remove('hidden');
    placeholder.classList.add('hidden');
  };
  img.onerror = () => {
    console.warn(`Image not found for ${a.name}: ${a.image}`);
  };
  img.src = a.image;
  // END ADD

  // Stagger entrance in groups of 4 across the grid
  const card = node.querySelector('.reveal');
  card.style.transitionDelay = `${(i % 4) * 0.08}s`;

  artistGrid.appendChild(node);
});
document.querySelectorAll('#artistGrid .reveal').forEach(el => revealObserver.observe(el));


/* ----------------------------------------------------------------
   9. CREATOR NETWORK VISUALIZATION — 3D-style orbiting graph
   Nodes orbit the hub on a tilted ellipse. Depth (front/back of
   the orbit) controls size, opacity and line thickness, giving
   a sense of 3D space. Small light pulses travel along each
   spoke toward the hub to suggest live data flow.
   The animation loop only runs while this section is on screen,
   so it doesn't eat CPU/GPU elsewhere on the page (e.g. the hero
   audio player above it).
   ---------------------------------------------------------------- */
(function buildNetwork3D() {
  const svg   = document.getElementById('networkSvg');
  const group = document.getElementById('networkOrbit');
  if (!svg || !group) return;

  const hub      = { x: 400, y: 130 };
  const nodeCount = 14; // ← change to add/remove outer nodes
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

      positioned.forEach((node) => {
        const line = document.createElementNS(NS, 'line');
        line.setAttribute('x1', hub.x);
        line.setAttribute('y1', hub.y);
        line.setAttribute('x2', node.x);
        line.setAttribute('y2', node.y);
        line.setAttribute('stroke', '#7DDCFF');
        line.setAttribute('stroke-width', 0.5 + node.depth * 1.2);
        line.setAttribute('stroke-opacity', node.opacity * 0.4);
        group.appendChild(line);

        const circle = document.createElementNS(NS, 'circle');
        circle.setAttribute('cx', node.x);
        circle.setAttribute('cy', node.y);
        circle.setAttribute('r', 3 + node.scale * 4);
        circle.setAttribute('fill', '#7DDCFF');
        circle.setAttribute('fill-opacity', node.opacity);
        group.appendChild(circle);

        const t  = (Date.now() / 1000 * 0.5 + node.idx * 0.35) % 1;
        const px = hub.x + (node.x - hub.x) * t;
        const py = hub.y + (node.y - hub.y) * t;
        const pulse = document.createElementNS(NS, 'circle');
        pulse.setAttribute('cx', px);
        pulse.setAttribute('cy', py);
        pulse.setAttribute('r', 1.6);
        pulse.setAttribute('fill', '#B9F2FF');
        pulse.setAttribute('fill-opacity', node.opacity);
        group.appendChild(pulse);
      });

      // Only schedule the next frame while the section is actually on screen
      requestAnimationFrame(render);
    } else {
      // Section scrolled away — stop the loop entirely until it's visible again
      needsRestart = true;
    }
  }

  render();

  // Restart the loop once the section scrolls back into view
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
   Single-open accordion: clicking a trigger opens its panel
   and closes all others simultaneously.
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
      panel.style.maxHeight  = panel.scrollHeight + 'px';
      icon.style.transform   = 'rotate(45deg)';
    }
  });
});

/* ----------------------------------------------------------------
   12. HERO AUDIO PREVIEW
   Fix: AbortError "play() interrupted by pause()"
   Cause: play() is async — if pause() fires before the Promise
   resolves (double-click, fast re-click), the browser throws.
   Solution: an isTransitioning flag that locks the button during
   the async gap between play() call and Promise resolution.
   ---------------------------------------------------------------- */
const heroPlayBtn   = document.getElementById('heroPlayBtn');
const heroAudio     = document.getElementById('heroAudio');
const heroPlayIcon  = document.getElementById('heroPlayIcon');
const heroPauseIcon = document.getElementById('heroPauseIcon');

if (!heroPlayBtn || !heroAudio || !heroPlayIcon || !heroPauseIcon) {
  console.warn('[hero audio] Missing element — check IDs in index.html');
} else {

  /* -- Icon helpers --------------------------------------------- */
  function showPlay() {
    heroPlayIcon.classList.remove('hidden');
    heroPauseIcon.classList.add('hidden');
  }

  function showPause() {
    heroPlayIcon.classList.add('hidden');
    heroPauseIcon.classList.remove('hidden');
  }

  /* -- Transition lock ------------------------------------------ */
  // True during the async window between play() call and resolution.
  // Prevents a second click from calling pause() before play() settles.
  let isTransitioning = false;

  /* -- Click handler -------------------------------------------- */
  heroPlayBtn.addEventListener('click', async () => {

    // Ignore clicks while play() Promise is still pending
    if (isTransitioning) return;

    if (heroAudio.paused) {
      isTransitioning = true;           // lock button

      try {
        await heroAudio.play();         // wait for browser confirmation
        showPause();                    // only flip icon after success
      } catch (err) {
        if (err.name === 'AbortError') {
          // A pause() snuck in during the async gap — safe to ignore,
          // the audio is already stopped so keep showing play icon.
          console.info('[hero audio] Play interrupted (AbortError) — ignored safely.');
        } else {
          // Real error: file missing, codec unsupported, policy block, etc.
          console.warn('[hero audio] play() failed:', err.name, err.message);
        }
        showPlay();                     // reset icon on any failure
      } finally {
        isTransitioning = false;        // always unlock, even on error
      }

    } else {
      heroAudio.pause();
      showPlay();
    }
  });

  /* -- Auto-reset when clip ends --------------------------------- */
  heroAudio.addEventListener('ended', showPlay);

  /* -- Surface file-load errors ---------------------------------- */
  heroAudio.addEventListener('error', () => {
    const src = heroAudio.currentSrc
      || heroAudio.querySelector('source')?.src
      || 'unknown';
    console.warn('[hero audio] Failed to load file:', src);
  });

}