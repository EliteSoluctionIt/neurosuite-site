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
