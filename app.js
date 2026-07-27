// NeuroSuite Ã¢â‚¬â€ constellation hero canvas
// Quiet, premium nodes-and-edges field

(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);
  let nodes = [];
  let mouse = { x: -9999, y: -9999 };
  let raf = null;
  let mode = document.documentElement.getAttribute('data-mode') || 'dark';
  let variant = document.documentElement.getAttribute('data-hero') || 'constellation';

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
    const density = variant === 'flow' ? 0.00009 : 0.00010;
    const count = Math.max(36, Math.min(110, Math.floor(W * H * density)));
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.10,
        vy: (Math.random() - 0.5) * 0.10,
        r: Math.random() * 1.2 + 0.4,
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    const accent = getAccent();
    const isLight = mode === 'light';
    const baseColor = isLight ? 'rgba(20,18,12,' : 'rgba(244,243,238,';
    const lineMax = variant === 'flow' ? 160 : 130;

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
      const breathe = 0.6 + 0.4 * Math.sin(t * 0.0008 + n.phase);
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
    window.location.href = 'mailto:info@neurosuite.net?subject=' + subject + '&body=' + body;
  });
})();
