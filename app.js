// NeuroSuite Ã¢â‚¬â€ constellation hero canvas
// Quiet, premium nodes-and-edges field

(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);
  let nodes = [];
  let heroConstellations = [];
  let mouse = { x: -9999, y: -9999 };
  let raf = null;
  let mode = document.documentElement.getAttribute('data-mode') || 'dark';
  let variant = document.documentElement.getAttribute('data-hero') || 'constellation';

  const heroPatterns = [
    {
      points: [[-.5,.08],[-.32,-.12],[-.12,.02],[.08,-.2],[.28,-.08],[.5,-.3],[.36,.18],[.12,.3],[-.18,.22]],
      edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[4,6],[6,7],[7,8],[8,2]]
    },
    {
      points: [[-.52,-.16],[-.36,.04],[-.18,.18],[.02,.02],[.2,-.22],[.4,-.04],[.54,.2],[.26,.28],[-.06,.34]],
      edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[3,7],[7,8],[8,2]]
    },
    {
      points: [[-.52,.22],[-.34,.02],[-.14,-.08],[.04,.08],[.2,-.16],[.38,-.3],[.52,-.08],[.34,.16],[.12,.3],[-.16,.24]],
      edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[4,6],[6,7],[7,8],[8,9],[9,3]]
    }
  ];

  function getAccent() {
    const s = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    return s || '#e8c8a0';
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    W = rect.width; H = rect.height;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    seed();
  }

  function seed() {
    nodes = [];
    const density = variant === 'flow' ? 0.000075 : 0.000082;
    const count = Math.max(36, Math.min(110, Math.floor(W * H * density)));
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.045,
        vy: (Math.random() - 0.5) * 0.045,
        r: Math.random() * 1.2 + 0.4,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const mobile = W < 620;
    const centers = mobile
      ? [[.46,.14], [.56,.5], [.44,.84]]
      : [[.17,.16], [.78,.32], [.74,.72]];
    const longAxis = Math.min(W * (mobile ? .92 : .43), mobile ? 410 : 620);
    const shortAxis = Math.min(H * (mobile ? .19 : .24), mobile ? 155 : 230);
    heroConstellations = heroPatterns.map((pattern, index) => ({
      ...pattern,
      x: centers[index][0] * W,
      y: centers[index][1] * H,
      width: longAxis * (.9 + index * .06),
      height: shortAxis * (1 - index * .05),
      baseRotation: [-.32,.24,-.18][index],
      direction: index % 2 ? 1 : -1,
      rotationSpeed: [.000024,.000019,.000022][index],
      phase: index * 2.17 + .4
    }));
  }

  function drawHeroConstellation(cluster, time, baseColor, accent, isLight) {
    const rotation = cluster.baseRotation
      + time * cluster.rotationSpeed * cluster.direction
      + Math.sin(time * .000012 + cluster.phase) * .08;
    const swayX = Math.sin(time * .000016 + cluster.phase) * (W < 620 ? 8 : 18);
    const swayY = Math.cos(time * .000013 + cluster.phase) * (W < 620 ? 6 : 13);

    ctx.save();
    ctx.translate(cluster.x + swayX, cluster.y + swayY);
    ctx.rotate(rotation);

    ctx.save();
    ctx.scale(1.65, .62);
    const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, cluster.width * .46);
    halo.addColorStop(0, isLight ? 'rgba(92,116,145,.045)' : 'rgba(28,105,192,.085)');
    halo.addColorStop(.55, isLight ? 'rgba(92,116,145,.025)' : 'rgba(13,67,143,.042)');
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(0, 0, cluster.width * .46, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    for (const edge of cluster.edges) {
      const a = cluster.points[edge[0]];
      const b = cluster.points[edge[1]];
      const gradient = ctx.createLinearGradient(
        a[0] * cluster.width, a[1] * cluster.height,
        b[0] * cluster.width, b[1] * cluster.height
      );
      gradient.addColorStop(0, baseColor + (isLight ? '.14)' : '.17)'));
      gradient.addColorStop(.62, baseColor + (isLight ? '.19)' : '.235)'));
      gradient.addColorStop(1, isLight ? 'rgba(124,84,32,.19)' : 'rgba(239,198,112,.29)');
      ctx.strokeStyle = gradient;
      ctx.lineWidth = .86;
      ctx.beginPath();
      ctx.moveTo(a[0] * cluster.width, a[1] * cluster.height);
      ctx.lineTo(b[0] * cluster.width, b[1] * cluster.height);
      ctx.stroke();
    }

    cluster.points.forEach((point, index) => {
      const breathe = .72 + .28 * Math.sin(time * .00024 + cluster.phase + index * .73);
      const x = point[0] * cluster.width;
      const y = point[1] * cluster.height;
      ctx.shadowColor = index % 4 === 0 ? accent : (isLight ? 'rgba(64,82,104,.38)' : 'rgba(137,202,255,.58)');
      ctx.shadowBlur = 6 + breathe * 7;
      ctx.fillStyle = index % 4 === 0 ? accent : baseColor + (isLight ? '.52)' : '.66)');
      ctx.globalAlpha = .68 + breathe * .27;
      ctx.beginPath();
      ctx.arc(x, y, (.75 + (index % 3) * .28) * breathe, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    const accent = getAccent();
    const isLight = mode === 'light';
    const baseColor = isLight ? 'rgba(20,18,12,' : 'rgba(244,243,238,';
    const lineMax = variant === 'flow' ? 160 : 130;

    heroConstellations.forEach(cluster => drawHeroConstellation(cluster, t, baseColor, accent, isLight));

    // edges
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx*dx + dy*dy;
        if (d2 < lineMax*lineMax) {
          const d = Math.sqrt(d2);
          const alpha = (1 - d / lineMax) * (isLight ? 0.18 : 0.14);
          ctx.strokeStyle = baseColor + alpha + ')';
          ctx.lineWidth = 0.6;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      // edge to mouse
      const mdx = a.x - mouse.x, mdy = a.y - mouse.y;
      const md2 = mdx*mdx + mdy*mdy;
      if (md2 < 200*200) {
        const d = Math.sqrt(md2);
        const alpha = (1 - d / 200) * 0.55;
        ctx.strokeStyle = `oklch(0.82 0.08 75 / ${alpha})`;
        ctx.lineWidth = 0.7;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
    }

    // nodes
    for (const n of nodes) {
      const breathe = 0.6 + 0.4 * Math.sin(t * 0.00028 + n.phase);
      ctx.fillStyle = baseColor + (isLight ? 0.55 : 0.7) + ')';
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * breathe, 0, Math.PI * 2);
      ctx.fill();

      // occasional accent node
      if ((n.phase * 31 | 0) % 11 === 0) {
        ctx.fillStyle = accent;
        ctx.globalAlpha = 0.35 * breathe;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 1.6 * breathe, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    }
  }

  function loop(t) {
    draw(t || 0);
    raf = requestAnimationFrame(loop);
  }

  function onMove(e) {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  }
  function onLeave() { mouse.x = -9999; mouse.y = -9999; }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('mousemove', onMove, { passive: true });
  window.addEventListener('mouseleave', onLeave);

  // observe attribute changes on root
  const obs = new MutationObserver(() => {
    mode = document.documentElement.getAttribute('data-mode') || 'dark';
    variant = document.documentElement.getAttribute('data-hero') || 'constellation';
    seed();
  });
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode', 'data-hero', 'data-accent'] });

  resize();
  loop();
})();

// NeuroSuite — living neural constellations below the hero.
// The CSS blue-black sky remains underneath as a permanent fallback.
(function () {
  const main = document.querySelector('main');
  const hasBlueGoldTheme = document.querySelector('link[href*="blue-gold.css"]');
  if (!main || !hasBlueGoldTheme) return;

  const style = document.createElement('style');
  style.id = 'ns-cosmic-background-style';
  style.textContent = `
    html[data-mode="dark"] main.cosmic-enhanced {
      position: relative;
      isolation: isolate;
    }
    html[data-mode="dark"] main.cosmic-enhanced > .cosmic-background {
      position: absolute;
      inset: 0;
      z-index: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      opacity: .96;
      mix-blend-mode: screen;
    }
    html[data-mode="dark"] main.cosmic-enhanced > :not(.cosmic-background) {
      position: relative;
      z-index: 1;
    }
    html[data-mode="light"] .cosmic-background {
      display: none;
    }
    @media (max-width: 620px) {
      html[data-mode="dark"] main.cosmic-enhanced > .cosmic-background {
        opacity: .9;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      html[data-mode="dark"] main.cosmic-enhanced > .cosmic-background {
        opacity: .78;
      }
    }
  `;
  document.head.appendChild(style);

  const canvas = document.createElement('canvas');
  canvas.className = 'cosmic-background';
  canvas.setAttribute('aria-hidden', 'true');
  main.prepend(canvas);

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) {
    canvas.remove();
    style.remove();
    return;
  }

  main.classList.add('cosmic-enhanced');

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reduceMotion = motionQuery.matches;
  let mode = document.documentElement.getAttribute('data-mode') || 'dark';
  let width = 0;
  let height = 0;
  let dpr = 1;
  let mainTop = 0;
  let ambientStars = [];
  let constellations = [];
  let dust = [];
  let raf = null;
  let lastFrame = 0;
  let inView = false;
  let resizeTimer = null;

  const patterns = [
    {
      family: 'taurus', x: .72, y: .09, strength: 1.12, phase: .08,
      points: [[.08,.54,.68],[.29,.49,.9],[.47,.57,1],[.64,.43,.82],[.86,.22,.72],[.67,.68,.66],[.93,.79,.58]],
      edges: [[0,1],[1,2],[2,3],[3,4],[2,5],[5,6]]
    },
    {
      family: 'leo', x: .23, y: .25, strength: .88, phase: .24,
      points: [[.08,.63,.6],[.25,.45,.86],[.43,.34,1],[.52,.14,.72],[.66,.31,.78],[.58,.58,.9],[.78,.69,.66],[.94,.57,.58]],
      edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,2],[5,6],[6,7]]
    },
    {
      family: 'scorpius', x: .72, y: .42, strength: 1.03, phase: .41,
      points: [[.08,.19,.58],[.23,.31,.7],[.35,.49,.92],[.49,.65,1],[.64,.72,.82],[.79,.66,.72],[.9,.51,.85],[.83,.35,.64],[.95,.24,.7]],
      edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8]]
    },
    {
      family: 'gemini', x: .28, y: .58, strength: .78, phase: .57,
      points: [[.22,.09,.92],[.31,.31,.72],[.27,.58,.66],[.16,.86,.56],[.67,.13,1],[.62,.35,.76],[.69,.61,.69],[.84,.86,.58],[.31,.31,.72],[.62,.35,.76],[.27,.58,.64],[.69,.61,.64]],
      edges: [[0,1],[1,2],[2,3],[4,5],[5,6],[6,7],[8,9],[10,11]]
    },
    {
      family: 'aquarius', x: .69, y: .75, strength: .92, phase: .73,
      points: [[.05,.36,.58],[.2,.22,.72],[.36,.4,.9],[.51,.24,.68],[.67,.43,1],[.82,.28,.72],[.95,.47,.62],[.23,.67,.55],[.42,.79,.66],[.62,.69,.58],[.83,.84,.54]],
      edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[2,7],[7,8],[8,9],[9,10]]
    },
    {
      family: 'pisces', x: .34, y: .91, strength: .82, phase: .89,
      points: [[.05,.42,.58],[.17,.26,.68],[.32,.28,.86],[.4,.45,.72],[.31,.62,.62],[.15,.65,.55],[.57,.51,1],[.69,.34,.72],[.84,.31,.68],[.95,.46,.56],[.83,.62,.62],[.68,.66,.7]],
      edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[3,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,6]]
    },
    {
      family: 'cygnus', x: .5, y: .5, strength: .9, phase: .17,
      points: [[.03,.51,.54],[.18,.45,.68],[.35,.48,.82],[.52,.42,1],[.7,.47,.78],[.97,.38,.62],[.49,.08,.72],[.54,.72,.69],[.66,.91,.56]],
      edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[3,6],[3,7],[7,8]]
    },
    {
      family: 'orion', x: .5, y: .5, strength: 1.04, phase: .36,
      points: [[.05,.72,.58],[.19,.36,.73],[.37,.5,.92],[.5,.46,1],[.63,.42,.88],[.82,.2,.69],[.96,.57,.61],[.42,.14,.67],[.6,.82,.72]],
      edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[4,6],[2,7],[3,8]]
    },
    {
      family: 'auriga', x: .5, y: .5, strength: .84, phase: .64,
      points: [[.02,.4,.56],[.16,.21,.7],[.34,.32,.85],[.5,.14,.72],[.68,.29,1],[.84,.2,.68],[.98,.42,.58],[.78,.62,.74],[.55,.78,.66],[.3,.67,.72],[.13,.82,.54]],
      edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[4,7],[7,8],[8,9],[9,10],[9,2]]
    }
  ];

  function hash(value) {
    const x = Math.sin(value * 127.1 + 311.7) * 43758.5453123;
    return x - Math.floor(x);
  }

  function rgba(r, g, b, alpha) {
    return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, alpha))})`;
  }

  function buildScene() {
    const area = width * height;
    const starCount = Math.max(180, Math.min(640, Math.round(area / 18000)));
    ambientStars = Array.from({ length: starCount }, (_, index) => ({
      x: hash(index + 1.13) * width,
      y: hash(index + 17.81) * height,
      radius: .28 + hash(index + 31.47) * 1.15,
      alpha: .2 + hash(index + 49.03) * .55,
      phase: hash(index + 71.17) * Math.PI * 2,
      speed: .00008 + hash(index + 91.53) * .00024,
      gold: hash(index + 111.91) > .76
    }));

    const mobile = width < 620;
    const viewportSpan = Math.max(560, window.innerHeight || 720);
    const verticalStep = viewportSpan / 3;
    const clusterCount = Math.max(5, Math.ceil(height / verticalStep) + 2);
    const lanes = mobile ? [.3, .7, .5] : [.19, .53, .82];
    const baseWidth = Math.min(width * (mobile ? .88 : .44), mobile ? 420 : 690);

    constellations = Array.from({ length: clusterCount }, (_, clusterIndex) => {
      const pattern = patterns[clusterIndex % patterns.length];
      const lane = clusterIndex % lanes.length;
      const xJitter = (hash(clusterIndex * 19.7 + 4.2) - .5) * (mobile ? .08 : .07);
      const centerX = Math.max(width * .08, Math.min(width * .92, (lanes[lane] + xJitter) * width));
      const centerY = (clusterIndex + .14) * verticalStep;
      const clusterWidth = baseWidth * (.88 + hash(clusterIndex * 23.1 + 8.4) * .22);
      const clusterHeight = Math.max(118, Math.min(mobile ? 190 : 270, clusterWidth * (.36 + hash(clusterIndex + 12.7) * .1)));
      const points = pattern.points.map((point, pointIndex) => ({
        x: centerX + (point[0] - .5) * clusterWidth,
        y: centerY + (point[1] - .5) * clusterHeight,
        importance: point[2],
        phase: hash(clusterIndex * 37 + pointIndex * 11.3) * Math.PI * 2,
        speed: .00014 + hash(clusterIndex * 53 + pointIndex * 7.9) * .00028,
        planet: (clusterIndex * 3 + pointIndex) % 13 === 0
      }));
      return {
        ...pattern,
        strength: pattern.strength * (.78 + hash(clusterIndex * 31.4 + 2.9) * .27),
        phase: hash(clusterIndex * 41.3 + 6.7),
        centerX,
        centerY,
        points,
        baseRotation: (hash(clusterIndex * 17.9 + 1.4) - .5) * 1.05,
        direction: clusterIndex % 2 === 0 ? 1 : -1,
        rotationSpeed: .000016 + hash(clusterIndex * 29.2 + 9.1) * .000013,
        driftX: (mobile ? 8 : 18) + hash(clusterIndex * 13.6 + 4.4) * (mobile ? 10 : 24),
        driftY: 5 + hash(clusterIndex * 21.8 + 7.3) * (mobile ? 7 : 12)
      };
    });

    dust = [];
    constellations.forEach((cluster, clusterIndex) => {
      const amount = mobile ? 18 : 26;
      for (let i = 0; i < amount; i++) {
        const angle = hash(clusterIndex * 89 + i * 3.7) * Math.PI * 2;
        const distance = 18 + hash(clusterIndex * 71 + i * 5.1) * (mobile ? 125 : 220);
        dust.push({
          x: cluster.centerX + Math.cos(angle) * distance * 1.55,
          y: cluster.centerY + Math.sin(angle) * distance * .62,
          radius: .25 + hash(clusterIndex * 47 + i * 9.3) * 1.05,
          alpha: .08 + hash(clusterIndex * 101 + i * 4.9) * .28,
          phase: hash(clusterIndex * 59 + i * 12.7) * Math.PI * 2
        });
      }
    });
  }

  function resize() {
    const rect = main.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(main.scrollHeight));
    mainTop = rect.top + window.scrollY;

    const preferred = Math.min(window.devicePixelRatio || 1, width < 620 ? 1.15 : 1.35);
    const maxPixels = width < 620 ? 5200000 : 10500000;
    dpr = Math.max(.72, Math.min(preferred, Math.sqrt(maxPixels / (width * height))));

    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildScene();
    if (inView) draw(reduceMotion ? 0 : performance.now(), true);
  }

  function visibleBand() {
    const top = Math.max(0, window.scrollY - mainTop - 180);
    const bottom = Math.min(height, window.scrollY - mainTop + window.innerHeight + 180);
    return { top, bottom, bandHeight: Math.max(0, bottom - top) };
  }

  function drawNebula(cluster) {
    const radius = width < 620 ? Math.min(width * .78, 360) : Math.min(width * .34, 520);
    ctx.save();
    ctx.translate(cluster.centerX, cluster.centerY);
    ctx.scale(1.72, .64);
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
    glow.addColorStop(0, rgba(23, 110, 205, .105 * cluster.strength));
    glow.addColorStop(.34, rgba(13, 75, 157, .072 * cluster.strength));
    glow.addColorStop(.7, rgba(5, 35, 91, .038 * cluster.strength));
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawAmbient(time, band) {
    for (const star of ambientStars) {
      if (star.y < band.top || star.y > band.bottom) continue;
      const twinkle = .62 + .38 * Math.sin(time * star.speed + star.phase);
      ctx.fillStyle = star.gold
        ? rgba(248, 214, 139, star.alpha * twinkle)
        : rgba(177, 218, 255, star.alpha * twinkle);
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius * (.72 + twinkle * .35), 0, Math.PI * 2);
      ctx.fill();
    }

    for (const mote of dust) {
      if (mote.y < band.top || mote.y > band.bottom) continue;
      const shimmer = .58 + .42 * Math.sin(time * .00018 + mote.phase);
      ctx.fillStyle = rgba(237, 193, 105, mote.alpha * shimmer);
      ctx.beginPath();
      ctx.arc(mote.x, mote.y, mote.radius * (.75 + shimmer * .4), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawConnection(cluster, a, b, alpha) {
    const gradient = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
    gradient.addColorStop(0, rgba(108, 184, 255, alpha * .8));
    gradient.addColorStop(.58, rgba(154, 207, 255, alpha));
    gradient.addColorStop(1, rgba(235, 191, 103, alpha * .9));
    ctx.strokeStyle = gradient;
    ctx.lineWidth = .62 + cluster.strength * .34;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  function drawPulse(cluster, a, b, progress, edgeIndex) {
    for (let trail = 0; trail < 7; trail++) {
      const p = progress - trail * .018;
      if (p < 0 || p > 1) continue;
      const x = a.x + (b.x - a.x) * p;
      const y = a.y + (b.y - a.y) * p;
      const alpha = (1 - trail / 7) * .68 * cluster.strength;
      const radius = 1.05 + (1 - trail / 7) * 1.45;
      ctx.shadowColor = rgba(242, 202, 118, alpha);
      ctx.shadowBlur = 9;
      ctx.fillStyle = rgba(250, 220, 151, alpha);
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    if (progress < .82) return;
    const dissolve = (progress - .82) / .18;
    for (let mote = 0; mote < 8; mote++) {
      const seed = edgeIndex * 29 + mote * 13 + cluster.phase * 100;
      const angle = hash(seed) * Math.PI * 2;
      const distance = dissolve * (7 + hash(seed + 8.3) * 20);
      const x = b.x + Math.cos(angle) * distance;
      const y = b.y + Math.sin(angle) * distance * .65;
      const alpha = (1 - dissolve) * (.2 + hash(seed + 17.2) * .62);
      ctx.fillStyle = rgba(247, 206, 119, alpha);
      ctx.beginPath();
      ctx.arc(x, y, .35 + hash(seed + 23.1) * 1.05, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawStar(point, cluster, time, pointIndex) {
    const breathe = .68 + .32 * Math.sin(time * point.speed + point.phase);
    const core = (.72 + point.importance * 1.35) * (.82 + breathe * .28);
    const halo = 4 + point.importance * 8;

    ctx.save();
    ctx.shadowColor = pointIndex % 4 === 0 ? 'rgba(247,206,125,.8)' : 'rgba(143,202,255,.76)';
    ctx.shadowBlur = halo * breathe * cluster.strength;
    ctx.fillStyle = pointIndex % 4 === 0
      ? rgba(255, 226, 160, .66 + breathe * .3)
      : rgba(207, 232, 255, .6 + breathe * .34);
    ctx.beginPath();
    ctx.arc(point.x, point.y, core, 0, Math.PI * 2);
    ctx.fill();

    if (point.importance > .82) {
      const ray = 3.5 + point.importance * 4.5 * breathe;
      ctx.strokeStyle = rgba(240, 216, 164, .18 + breathe * .2);
      ctx.lineWidth = .55;
      ctx.beginPath();
      ctx.moveTo(point.x - ray, point.y);
      ctx.lineTo(point.x + ray, point.y);
      ctx.moveTo(point.x, point.y - ray);
      ctx.lineTo(point.x, point.y + ray);
      ctx.stroke();
    }

    if (point.planet) {
      ctx.shadowBlur = 0;
      ctx.strokeStyle = rgba(232, 197, 127, .34);
      ctx.lineWidth = .55;
      ctx.beginPath();
      ctx.ellipse(point.x, point.y, core * 2.9, core * 1.05, -.35, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function draw(time, force) {
    if (!width || !height || mode !== 'dark') return;
    const band = visibleBand();
    if (!band.bandHeight) return;

    ctx.clearRect(0, band.top, width, band.bandHeight);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, band.top, width, band.bandHeight);
    ctx.clip();
    ctx.globalCompositeOperation = 'screen';

    constellations.forEach((cluster, clusterIndex) => {
      const margin = width < 620 ? 300 : 560;
      if (cluster.centerY < band.top - margin || cluster.centerY > band.bottom + margin) return;

      const swayX = reduceMotion ? 0 : Math.sin(time * .000018 + cluster.phase * Math.PI * 2) * cluster.driftX;
      const swayY = reduceMotion ? 0 : Math.cos(time * .000014 + cluster.phase * Math.PI * 2) * cluster.driftY;
      const rotation = cluster.baseRotation + (reduceMotion ? 0 : time * cluster.rotationSpeed * cluster.direction)
        + (reduceMotion ? 0 : Math.sin(time * .000009 + cluster.phase * Math.PI * 2) * .075);

      ctx.save();
      ctx.translate(cluster.centerX + swayX, cluster.centerY + swayY);
      ctx.rotate(rotation);
      ctx.translate(-cluster.centerX, -cluster.centerY);
      drawNebula(cluster);
      cluster.edges.forEach((edge, edgeIndex) => {
        const a = cluster.points[edge[0]];
        const b = cluster.points[edge[1]];
        const lineBreath = .72 + .28 * Math.sin(time * .00012 + cluster.phase * Math.PI * 2 + edgeIndex);
        drawConnection(cluster, a, b, (.12 + cluster.strength * .105) * lineBreath);

        if (!reduceMotion && (edgeIndex + clusterIndex) % 2 === 0) {
          const progress = (time * (.000018 + cluster.strength * .000004) + edgeIndex * .17 + cluster.phase) % 1;
          drawPulse(cluster, a, b, progress, clusterIndex * 20 + edgeIndex);
        }
      });
      cluster.points.forEach((point, pointIndex) => drawStar(point, cluster, time, pointIndex));
      ctx.restore();
    });

    drawAmbient(time, band);
    ctx.restore();

    if (force && reduceMotion) canvas.dataset.static = 'true';
  }

  function loop(time) {
    raf = null;
    if (!inView || document.hidden || mode !== 'dark' || reduceMotion) return;
    if (time - lastFrame >= 42) {
      draw(time, false);
      lastFrame = time;
    }
    raf = requestAnimationFrame(loop);
  }

  function start() {
    if (raf || !inView || document.hidden || mode !== 'dark' || reduceMotion) return;
    raf = requestAnimationFrame(loop);
  }

  function stop() {
    if (!raf) return;
    cancelAnimationFrame(raf);
    raf = null;
  }

  function refreshMotion() {
    reduceMotion = motionQuery.matches;
    if (reduceMotion) {
      stop();
      draw(0, true);
    } else {
      canvas.removeAttribute('data-static');
      start();
    }
  }

  const visibilityObserver = new IntersectionObserver((entries) => {
    inView = entries.some(entry => entry.isIntersecting);
    if (inView) {
      draw(reduceMotion ? 0 : performance.now(), true);
      start();
    } else {
      stop();
    }
  }, { rootMargin: '0px 0px -35% 0px' });
  visibilityObserver.observe(main);

  const themeObserver = new MutationObserver(() => {
    mode = document.documentElement.getAttribute('data-mode') || 'dark';
    if (mode === 'dark') {
      draw(reduceMotion ? 0 : performance.now(), true);
      start();
    } else {
      stop();
    }
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode'] });

  const requestResize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resize, 140);
  };

  window.addEventListener('resize', requestResize, { passive: true });
  window.addEventListener('scroll', () => {
    if (reduceMotion && mode === 'dark') draw(0, true);
  }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else start();
  });
  if (motionQuery.addEventListener) motionQuery.addEventListener('change', refreshMotion);

  if ('ResizeObserver' in window) {
    const sizeObserver = new ResizeObserver(entries => {
      const nextHeight = Math.round(entries[0].contentRect.height);
      const nextWidth = Math.round(entries[0].contentRect.width);
      if (Math.abs(nextHeight - height) > 2 || Math.abs(nextWidth - width) > 2) requestResize();
    });
    sizeObserver.observe(main);
  }

  resize();
  refreshMotion();
})();

// Reveal on scroll
(function(){
  const els = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  els.forEach(el => io.observe(el));
})();

// Nav scrolled state
(function(){
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 24);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// Mode toggle
(function(){
  const btn = document.getElementById('mode-toggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-mode') || 'dark';
    document.documentElement.setAttribute('data-mode', cur === 'dark' ? 'light' : 'dark');
  });
})();

// Section keyboard navigation
(function(){
  const sections = Array.from(document.querySelectorAll('section[id]'));
  if (!sections.length) return;
  let lastMove = 0;

  function isEditingTarget(el) {
    if (!el) return false;
    const tag = el.tagName ? el.tagName.toLowerCase() : '';
    return tag === 'input' || tag === 'textarea' || tag === 'select' || el.isContentEditable;
  }

  function currentIndex() {
    const y = window.scrollY + Math.max(96, window.innerHeight * 0.28);
    let index = 0;
    sections.forEach((section, i) => {
      if (section.offsetTop <= y) index = i;
    });
    return index;
  }

  function go(delta) {
    const now = Date.now();
    if (now - lastMove < 240) return;
    lastMove = now;
    const next = Math.max(0, Math.min(sections.length - 1, currentIndex() + delta));
    sections[next].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  window.addEventListener('keydown', (event) => {
    if (isEditingTarget(document.activeElement)) return;
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown' || event.key === 'PageDown') {
      event.preventDefault();
      go(1);
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp' || event.key === 'PageUp') {
      event.preventDefault();
      go(-1);
    }
    if (event.key === 'Home') {
      event.preventDefault();
      sections[0].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (event.key === 'End') {
      event.preventDefault();
      sections[sections.length - 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
})();

// Form
(function(){
  const form = document.getElementById('access-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    form.classList.add('is-submitted');
  });
})();


// Contact form: build a prefilled email without uploading files from the static site
(function(){
  const form = document.getElementById('contact-form');
  if (!form) return;
  const type = document.getElementById('contact-type');
  const companyRow = document.getElementById('company-row');
  const company = document.getElementById('contact-company');

  function syncCompany() {
    const isCompany = type && type.value === 'Azienda / ente';
    if (companyRow) companyRow.hidden = !isCompany;
    if (company) company.required = isCompany;
  }

  if (type) type.addEventListener('change', syncCompany);
  syncCompany();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const lines = [
      'Buongiorno,',
      '',
      'richiedo un contatto operativo.',
      '',
      'Nome e cognome: ' + (data.get('name') || ''),
      'Tipo contatto: ' + (data.get('type') || ''),
      'Azienda / ente: ' + (data.get('company') || ''),
      'Email per ricontatto: ' + (data.get('email') || ''),
      'Telefono per ricontatto: ' + (data.get('phone') || ''),
      'Preferenza: ' + (data.get('preference') || ''),
      '',
      'Messaggio:',
      data.get('message') || '',
      '',
      'Eventuali allegati possono essere aggiunti direttamente a questa email.'
    ];
    const subject = encodeURIComponent('Contatto operativo - neurosuite.dev');
    const body = encodeURIComponent(lines.join('\n'));
    window.location.href = 'mailto:alessandro@neurosuite.dev?subject=' + subject + '&body=' + body;
  });
})();

// NeuroSuite horizontal public deck v3
(function () {
  if (document.documentElement.classList.contains('private-scenario-page')) return;
  if (!document.querySelector('body > section[id]')) return;

  const mq = window.matchMedia('(min-width: 761px)');
  let overlay = null;
  let track = null;
  let cue = null;
  let slides = [];
  let current = 0;
  let wheelLock = 0;

  function cleanIds(node) {
    if (!node || node.nodeType !== 1) return;
    node.removeAttribute('id');
    node.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
  }

  function cloneOriginal(node) {
    const cloned = node.cloneNode(true);
    cleanIds(cloned);
    return cloned;
  }

  function titleFor(section, fallback) {
    const h = section.querySelector('h1,h2,h3');
    return (h ? h.textContent : fallback || 'Slide').replace(/\s+/g, ' ').trim();
  }

  function makeSlide(section) {
    const slide = document.createElement('section');
    slide.className = 'nsd-slide';
    slide.dataset.source = section.id || '';
    slide.dataset.title = titleFor(section, section.id || 'Slide');

    const scroll = document.createElement('div');
    scroll.className = 'nsd-scroll';

    const frame = document.createElement('div');
    frame.className = 'nsd-frame';
    frame.appendChild(cloneOriginal(section));

    scroll.appendChild(frame);
    slide.appendChild(scroll);

    slide.addEventListener('scroll', function () {
      updateCue();
    }, { passive: true });

    slides.push(slide);
  }

  function collectSlides() {
    slides = [];
    Array.from(document.querySelectorAll('body > section[id]')).forEach(makeSlide);
  }

  function build() {
    collectSlides();

    overlay = document.createElement('div');
    overlay.className = 'nsd';
    overlay.setAttribute('aria-label', 'Presentazione NeuroSuite');

    track = document.createElement('div');
    track.className = 'nsd-track';
    slides.forEach(slide => track.appendChild(slide));
    overlay.appendChild(track);

    const controls = document.createElement('div');
    controls.className = 'nsd-controls';

    const full = document.createElement('button');
    full.type = 'button';
    full.className = 'nsd-btn';

    const page = document.createElement('button');
    page.type = 'button';
    page.className = 'nsd-btn';
    page.textContent = 'Vista pagina';

    controls.appendChild(full);
    controls.appendChild(page);
    overlay.appendChild(controls);

    const count = document.createElement('div');
    count.className = 'nsd-count';
    overlay.appendChild(count);

    cue = document.createElement('button');
    cue.type = 'button';
    cue.className = 'nsd-cue';
    cue.addEventListener('click', function () {
      const slide = slides[current];
      if (!slide) return;

      if (canScrollDown()) {
        slide.scrollBy({ top: Math.round(slide.clientHeight * 0.78), behavior: 'smooth' });
      } else if (slide.classList.contains('nsd-over')) {
        slide.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
    overlay.appendChild(cue);

    document.body.appendChild(overlay);

    function updateFullLabel() {
      full.textContent = document.fullscreenElement ? 'Esci schermo pieno' : 'Schermo pieno';
    }

    full.addEventListener('click', function () {
      if (document.fullscreenElement) {
        if (document.exitFullscreen) document.exitFullscreen();
      } else {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(function () {});
        }
      }
    });

    page.addEventListener('click', stop);

    document.addEventListener('fullscreenchange', function () {
      updateFullLabel();
      refreshCurrentSlide();
    });

    updateFullLabel();
  }

  function canScrollDown() {
    const slide = slides[current];
    if (!slide || !slide.classList.contains('nsd-over')) return false;
    return slide.scrollTop + slide.clientHeight < slide.scrollHeight - 4;
  }

  function canScrollUp() {
    const slide = slides[current];
    if (!slide || !slide.classList.contains('nsd-over')) return false;
    return slide.scrollTop > 4;
  }

  function updateCue() {
    if (!cue) return;
    const slide = slides[current];
    if (!slide || !slide.classList.contains('nsd-over')) {
      cue.classList.remove('is-visible');
      return;
    }

    cue.classList.add('is-visible');

    if (canScrollDown()) {
      cue.textContent = '\u2193 scorri';
    } else {
      cue.textContent = '\u2191 risali';
    }
  }

  function refreshCurrentSlide() {
    const slide = slides[current];
    if (!slide) return;

    slide.classList.remove('nsd-over');
    slide.scrollTop = 0;

    requestAnimationFrame(function () {
      const overflow = slide.scrollHeight > slide.clientHeight + 8;
      slide.classList.toggle('nsd-over', overflow);
      updateCue();
    });
  }

  function updateCount() {
    const count = overlay && overlay.querySelector('.nsd-count');
    if (!count) return;

    count.textContent =
      String(current + 1).padStart(2, '0') +
      ' / ' +
      String(slides.length).padStart(2, '0');
    count.setAttribute('aria-label', slides[current] ? slides[current].dataset.title : 'Slide');
  }

  function indexForHash(hash) {
    if (!hash || hash === '#') return -1;
    const id = hash.slice(1);
    return slides.findIndex(function (slide) {
      return slide.dataset.source === id;
    });
  }

  function scrollActive(deltaY) {
    const slide = slides[current];
    if (!slide || !slide.classList.contains('nsd-over')) return false;
    if (deltaY > 0 && !canScrollDown()) return false;
    if (deltaY < 0 && !canScrollUp()) return false;

    slide.scrollBy({ top: deltaY, behavior: 'auto' });
    updateCue();
    return true;
  }

  function goTo(index) {
    if (!track || !slides.length) return;

    current = Math.max(0, Math.min(slides.length - 1, index));

    slides.forEach(function (slide, i) {
      slide.classList.toggle('nsd-active', i === current);
      if (i !== current) slide.scrollTop = 0;
    });

    track.scrollTo({ left: current * window.innerWidth, behavior: 'smooth' });
    updateCount();
    refreshCurrentSlide();
  }

  function start() {
    if (!mq.matches || overlay) return;
    document.documentElement.classList.add('nsd-on');
    build();
    goTo(0);
  }

  function stop() {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen();
    }

    document.documentElement.classList.remove('nsd-on');

    if (overlay) overlay.remove();
    overlay = null;
    track = null;
    cue = null;
    slides = [];
  }

  document.addEventListener('click', function (event) {
    if (!overlay) return;
    const target = event.target;
    const link = target && target.closest ? target.closest('a[href^="#"]') : null;
    if (!link) return;

    const index = indexForHash(link.getAttribute('href'));
    if (index < 0) return;

    event.preventDefault();
    event.stopPropagation();
    goTo(index);
  }, true);

  window.addEventListener('keydown', function (event) {
    if (!overlay) return;

    const tag = (document.activeElement && document.activeElement.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
    if (event.altKey || event.ctrlKey || event.metaKey) return;

    if (event.key === 'ArrowRight' || event.key === 'PageDown' || event.key === ' ') {
      event.preventDefault();
      event.stopImmediatePropagation();
      goTo(current + 1);
      return;
    }

    if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
      event.preventDefault();
      event.stopImmediatePropagation();
      goTo(current - 1);
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      event.stopImmediatePropagation();

      if (canScrollDown()) {
        slides[current].scrollBy({ top: Math.round(slides[current].clientHeight * 0.78), behavior: 'smooth' });
      } else {
        goTo(current + 1);
      }
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      event.stopImmediatePropagation();

      if (canScrollUp()) {
        slides[current].scrollBy({ top: -Math.round(slides[current].clientHeight * 0.78), behavior: 'smooth' });
      } else {
        goTo(current - 1);
      }
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      event.stopImmediatePropagation();
      goTo(0);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      event.stopImmediatePropagation();
      goTo(slides.length - 1);
      return;
    }

    if (event.key.toLowerCase() === 'f') {
      event.preventDefault();
      event.stopImmediatePropagation();

      if (document.fullscreenElement) {
        if (document.exitFullscreen) document.exitFullscreen();
      } else {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(function () {});
        }
      }
    }
  }, true);

  window.addEventListener('wheel', function (event) {
    if (!overlay) return;

    const verticalIntent = Math.abs(event.deltaY) >= Math.abs(event.deltaX);

    if (verticalIntent && scrollActive(event.deltaY)) {
      event.preventDefault();
      return;
    }

    event.preventDefault();

    const now = Date.now();
    if (now - wheelLock < 420) return;
    wheelLock = now;

    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    goTo(current + (delta > 0 ? 1 : -1));
  }, { passive: false, capture: true });

  window.addEventListener('resize', function () {
    if (!mq.matches) {
      stop();
    } else if (!overlay) {
      start();
    } else {
      refreshCurrentSlide();
    }
  }, { passive: true });

  const deckParams = new URLSearchParams(window.location.search);
  const publicDeckEnabled = deckParams.get('deck') === '1' || deckParams.get('deck') === 'true';
  if (publicDeckEnabled) {
    setTimeout(start, 80);
  }
})();

// NeuroSuite original soundscape — user-controlled by design.
(function () {
  const source = 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Tchaikovsky_Violin_Concerto_Sniped_MuseSounds.ogg';
  const language = (document.documentElement.lang || 'en').toLowerCase();
  const italian = language.startsWith('it');
  const copy = italian
    ? {
        play: 'Avvia la colonna sonora originale',
        pause: 'Metti in pausa la colonna sonora',
        loading: 'Caricamento audio',
        label: 'Colonna sonora',
        error: 'Audio non disponibile'
      }
    : {
        play: 'Play Tchaikovsky violin concerto',
        pause: 'Pause Tchaikovsky violin concerto',
        loading: 'Loading audio',
        label: 'Soundtrack',
        error: 'Audio unavailable'
      };

  const audio = document.createElement('audio');
  audio.className = 'ns-soundtrack';
  audio.src = source;
  audio.loop = true;
  audio.preload = 'none';
  audio.volume = 0.38;
  audio.setAttribute('playsinline', '');
  audio.setAttribute('aria-hidden', 'true');

  const button = document.createElement('button');
  button.className = 'sound-toggle';
  button.type = 'button';
  button.setAttribute('aria-label', copy.play);
  button.setAttribute('aria-pressed', 'false');
  button.innerHTML = [
    '<span class="sound-toggle__bars" aria-hidden="true">',
    '<i></i><i></i><i></i><i></i>',
    '</span>',
    '<span class="sound-toggle__label">' + copy.label + '</span>'
  ].join('');

  function setState(state) {
    button.classList.toggle('is-playing', state === 'playing');
    button.classList.toggle('is-loading', state === 'loading');
    button.classList.toggle('has-error', state === 'error');
    button.setAttribute('aria-pressed', state === 'playing' ? 'true' : 'false');
    button.setAttribute(
      'aria-label',
      state === 'playing' ? copy.pause : state === 'loading' ? copy.loading : state === 'error' ? copy.error : copy.play
    );
    button.title = button.getAttribute('aria-label');
  }

  button.addEventListener('click', async function () {
    if (!audio.paused) {
      audio.pause();
      return;
    }

    setState('loading');
    try {
      await audio.play();
    } catch (error) {
      setState('error');
    }
  });

  audio.addEventListener('play', function () { setState('playing'); });
  audio.addEventListener('playing', function () { setState('playing'); });
  audio.addEventListener('pause', function () { setState('paused'); });
  audio.addEventListener('waiting', function () { setState('loading'); });
  audio.addEventListener('error', function () { setState('error'); });

  document.body.append(audio, button);
  setState('paused');
})();
