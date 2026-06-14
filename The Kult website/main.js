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
  { name: 'Jaquarois indie', duration: '2-Week Campaign',  spotifyBefore: '1.2k streams',  spotifyAfter: '400k streams', tiktokBefore: '1K views', tiktokAfter: '2.2M views',   growth: '+2,567%', bars: [10,18,22,35,52,78,100] },
  { name: 'Wer$e',  duration: '3-Week Campaign',  spotifyBefore: '82K streams',  spotifyAfter: '940K streams', tiktokBefore: '410K views', tiktokAfter: '6.1M views',  growth: '+1,046%', bars: [14,20,28,40,55,72,95]  },
  { name: 'ifwmyglokk', duration: '4-Week Campaign', spotifyBefore: '120K streams', spotifyAfter: '2.3M streams', tiktokBefore: '600K views', tiktokAfter: '18.7M views', growth: '+1,817%', bars: [12,16,24,38,60,82,100] },
  { name: 'predayed', duration: '3-Week Campaign',  spotifyBefore: '30K streams',  spotifyAfter: '410K streams', tiktokBefore: '180K views', tiktokAfter: '4.8M views',  growth: '+1,267%', bars: [8,15,26,40,58,76,98]   },
  { name: 'scrappydoll', duration: '3-Week Campaign',  spotifyBefore: '95K streams',  spotifyAfter: '1.6M streams', tiktokBefore: '520K views', tiktokAfter: '9.3M views',  growth: '+1,584%', bars: [16,22,30,48,64,80,100] },
  { name: 'The Kavities',   duration: '3-Week Campaign',  spotifyBefore: '60K streams',  spotifyAfter: '880K streams', tiktokBefore: '250K views', tiktokAfter: '7.4M views',  growth: '+1,367%', bars: [10,18,28,42,60,78,96]  },
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
  { name: 'Jaquarious indie',genre: 'Indie Pop',          tiktok: '2.2M',  spotify: '400k',  duration: '6 weeks'  },
  { name: 'wer$e',           genre: 'Indie',              tiktok: '1.5M',  spotify: '300K',  duration: '1 week'   },
  { name: 'exhibit',         genre: 'Ambient music',      tiktok: '18.7M', spotify: '2.3M',  duration: '10 weeks' },
  { name: 'scrappydoll',     genre: 'Latin Trap',         tiktok: '4.8M',  spotify: '410K',  duration: '4 weeks'  },
  { name: 'The Kavities',    genre: 'Dream Pop',          tiktok: '9.3M',  spotify: '1.6M',  duration: '6 weeks'  },
  { name: 'Predayed',        genre: 'K-Pop Solo',         tiktok: '7.4M',  spotify: '880K',  duration: '8 weeks'  },
  { name: 'ifwmyglokk',      genre: 'Hip-Hop',            tiktok: '15.2M', spotify: '2.1M',  duration: '8 weeks'  },
  { name: 'razors',          genre: 'indie',              tiktok: '1.5M',  spotify: '30K',   duration:  '1 week'  },
  { name: 'Lola Vance',      genre: 'Pop',                tiktok: '21.6M', spotify: '3.4M',  duration: '10 weeks' },
  { name: 'Theo Marsh',      genre: 'Lo-fi',              tiktok: '2.6M',  spotify: '260K',  duration: '4 weeks'  },
  { name: 'Cypher Row',      genre: 'Electronic',         tiktok: '11.8M', spotify: '1.4M',  duration: '6 weeks'  },
  { name: 'Aria North',      genre: 'Singer-Songwriter',  tiktok: '5.9M',  spotify: '720K',  duration: '6 weeks'  },
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

  // Stagger entrance in groups of 4 across the grid
  const card = node.querySelector('.reveal');
  card.style.transitionDelay = `${(i % 4) * 0.08}s`;

  artistGrid.appendChild(node);
});

document.querySelectorAll('#artistGrid .reveal').forEach(el => revealObserver.observe(el));


/* ----------------------------------------------------------------
   8. DASHBOARD LINE CHARTS — animated SVG draw-in
   Each <svg class="dashboard-line"> in Section 6 has a
   data-points attribute with polyline coordinates.
   This function builds the line + area fill and animates
   the stroke-dashoffset from full-length → 0 on scroll.
   ---------------------------------------------------------------- */
document.querySelectorAll('.dashboard-line').forEach(svg => {
  const points = svg.dataset.points;

  // --- Main line ---
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  path.setAttribute('points', points);
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', '#7DDCFF');
  path.setAttribute('stroke-width', '2');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  path.style.filter = 'drop-shadow(0 0 6px rgba(125,220,255,0.5))';

  // --- Area fill under the line ---
  const areaPoints = `6,90 ${points} 286,90`;
  const area = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  area.setAttribute('points', areaPoints);
  area.setAttribute('fill', 'rgba(125,220,255,0.08)');

  svg.appendChild(area);
  svg.appendChild(path);

  // Draw-in animation: stroke-dashoffset starts at full length, animates to 0
  const length = 600; // approximate path length — sufficient for these charts
  path.style.strokeDasharray  = length;
  path.style.strokeDashoffset = length;
  path.style.transition       = 'stroke-dashoffset 1.6s cubic-bezier(.16,1,.3,1)';

  const lineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.strokeDashoffset = '0';
        lineObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  lineObserver.observe(path);
});


/* ----------------------------------------------------------------
   9. CREATOR NETWORK VISUALIZATION — SVG graph
   Draws a hub-and-spoke diagram inside #networkSvg.
   The hub is centred at (400, 110); 14 creator nodes are
   positioned evenly around an ellipse with slight randomness.
   ---------------------------------------------------------------- */
(function buildNetwork() {
  const linesGroup = document.getElementById('networkLines');
  const nodesGroup = document.getElementById('networkNodes');

  const hub       = { x: 400, y: 110 };
  const nodeCount = 14; // ← change to add/remove outer nodes
  const nodes     = [hub];

  // Generate outer node positions along an ellipse
  for (let i = 0; i < nodeCount; i++) {
    const angle   = (i / nodeCount) * Math.PI * 2;
    const radiusX = 320 + Math.random() * 40; // horizontal spread
    const radiusY =  80 + Math.random() * 20; // vertical spread (flatter ellipse)

    nodes.push({
      x: hub.x + Math.cos(angle) * radiusX,
      y: hub.y + Math.sin(angle) * radiusY,
      r: 3 + Math.random() * 4, // node radius 3 – 7 px
    });
  }

  // Draw spoke lines from hub to each outer node
  nodes.slice(1).forEach(n => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', hub.x);
    line.setAttribute('y1', hub.y);
    line.setAttribute('x2', n.x);
    line.setAttribute('y2', n.y);
    linesGroup.appendChild(line);
  });

  // Draw nodes — hub is larger and glowing, outer nodes are smaller
  nodes.forEach((n, i) => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', n.x);
    circle.setAttribute('cy', n.y);
    circle.setAttribute('r',    i === 0 ? 8 : n.r);
    circle.setAttribute('fill', i === 0 ? '#7DDCFF' : 'rgba(125,220,255,0.55)');

    if (i === 0) {
      circle.style.filter = 'drop-shadow(0 0 10px #7DDCFF)';
    }

    nodesGroup.appendChild(circle);
  });
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
