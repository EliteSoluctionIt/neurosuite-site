// NeuroSuite public site interactions
(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2), nodes = [];
  let mouse = { x: -9999, y: -9999 };
  let mode = document.documentElement.getAttribute('data-mode') || 'dark';
  let variant = document.documentElement.getAttribute('data-hero') || 'constellation';
  const accent = () => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#e8c8a0';

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
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    seed();
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    const isLight = mode === 'light';
    const base = isLight ? 'rgba(20,18,12,' : 'rgba(244,243,238,';
    const lineMax = variant === 'flow' ? 160 : 130;

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < lineMax * lineMax) {
          const d = Math.sqrt(d2);
          const alpha = (1 - d / lineMax) * (isLight ? 0.18 : 0.14);
          ctx.strokeStyle = base + alpha + ')';
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      const mdx = a.x - mouse.x;
      const mdy = a.y - mouse.y;
      const md2 = mdx * mdx + mdy * mdy;
      if (md2 < 40000) {
        const d = Math.sqrt(md2);
        const alpha = (1 - d / 200) * 0.55;
        ctx.strokeStyle = `oklch(0.82 0.08 75 / ${alpha})`;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }

      const breathe = 0.6 + 0.4 * Math.sin(t * 0.0008 + a.phase);
      ctx.fillStyle = base + (isLight ? 0.55 : 0.7) + ')';
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.r * breathe, 0, Math.PI * 2);
      ctx.fill();
      if (((a.phase * 31) | 0) % 11 === 0) {
        ctx.fillStyle = accent();
        ctx.globalAlpha = 0.35 * breathe;
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r * 1.6 * breathe, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      a.x += a.vx;
      a.y += a.vy;
      if (a.x < 0 || a.x > W) a.vx *= -1;
      if (a.y < 0 || a.y > H) a.vy *= -1;
    }
    requestAnimationFrame(draw);
  }

  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  }, { passive: true });
  canvas.addEventListener('mouseleave', () => { mouse = { x: -9999, y: -9999 }; });
  window.addEventListener('resize', resize, { passive: true });
  new MutationObserver(() => {
    mode = document.documentElement.getAttribute('data-mode') || 'dark';
    variant = document.documentElement.getAttribute('data-hero') || 'constellation';
    seed();
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode', 'data-hero', 'data-accent'] });
  resize();
  requestAnimationFrame(draw);
})();

(function () {
  const els = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  }), { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  els.forEach(el => io.observe(el));
})();

(function () {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

(function () {
  const btn = document.getElementById('mode-toggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-mode') || 'dark';
    document.documentElement.setAttribute('data-mode', cur === 'dark' ? 'light' : 'dark');
  });
})();

(function () {
  const form = document.getElementById('access-form');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    form.classList.add('is-submitted');
  });
})();

(function () {
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
  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(form);
    const lines = [
      'Buongiorno,', '', 'richiedo un contatto operativo.', '',
      'Nome e cognome: ' + (data.get('name') || ''),
      'Tipo contatto: ' + (data.get('type') || ''),
      'Azienda / ente: ' + (data.get('company') || ''),
      'Email per ricontatto: ' + (data.get('email') || ''),
      'Telefono per ricontatto: ' + (data.get('phone') || ''),
      'Preferenza: ' + (data.get('preference') || ''), '',
      'Messaggio:', data.get('message') || '', '',
      'Eventuali allegati possono essere aggiunti direttamente a questa email.'
    ];
    window.location.href = 'mailto:info@neurosuite.net?subject=' + encodeURIComponent('Contatto operativo - neurosuite.dev') + '&body=' + encodeURIComponent(lines.join('\n'));
  });
})();

// Italian public page: concrete outcomes, scientific context and full NeuroSuite vision.
(function () {
  if (document.documentElement.lang !== 'it') return;
  const old = document.getElementById('ecosistema');
  if (!old) return;

  const style = document.createElement('style');
  style.textContent = `
    .ns-impact-intro{max-width:780px;font-size:clamp(1.05rem,1.5vw,1.32rem);line-height:1.58;color:var(--fg-2);margin:0 0 clamp(34px,5vw,64px)}
    .ns-cases{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;background:transparent;border:0;border-radius:0;overflow:visible}
    .ns-case{position:relative;background:color-mix(in oklab,var(--surface) 88%,transparent);border:1px solid var(--line);border-radius:22px;padding:clamp(28px,3vw,42px);min-height:360px;display:flex;flex-direction:column;box-shadow:0 18px 55px rgba(20,60,64,.055)}
    .ns-case__top{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;margin-bottom:30px;text-transform:uppercase;letter-spacing:.11em;font-size:.69rem;line-height:1.35;color:var(--fg-3)}
    .ns-case__risk{color:var(--accent);font-weight:700;text-align:right;max-width:18ch}
    .ns-case h3{font-family:var(--serif);font-size:clamp(1.55rem,2.3vw,2.15rem);line-height:1.08;letter-spacing:-.025em;margin:0 0 22px;max-width:20ch;text-wrap:balance}
    .ns-case p{font-size:clamp(.98rem,1.1vw,1.06rem);color:var(--fg-2);line-height:1.65;margin:0;max-width:52ch}
    .ns-case__answer{margin-top:auto;padding-top:30px;border-top:1px solid var(--line);font-size:clamp(.98rem,1.08vw,1.05rem);line-height:1.55;color:var(--fg);font-weight:500}
    .ns-case__answer strong{color:var(--accent);font-weight:700}
    .ns-proof{margin-top:30px;padding:22px 24px;border:1px solid var(--line);border-left:3px solid var(--accent);border-radius:0 16px 16px 0;background:color-mix(in oklab,var(--accent) 6%,transparent);color:var(--fg-2);font-size:.98rem;line-height:1.6}
    .ns-focus{margin-top:clamp(72px,9vw,128px);display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr);gap:clamp(44px,7vw,100px);align-items:start}
    .ns-focus__statement{font-family:var(--serif);font-size:clamp(2rem,3.6vw,3.7rem);line-height:1.02;letter-spacing:-.04em;margin:0;text-wrap:balance}
    .ns-focus__copy{max-width:660px}
    .ns-focus__copy p{font-size:clamp(1rem,1.2vw,1.1rem);line-height:1.72;color:var(--fg-2);margin:0 0 20px}
    .ns-world{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:34px}
    .ns-world span{border:1px solid var(--line);border-radius:999px;padding:12px 15px;text-align:center;font-size:.8rem;line-height:1.3;color:var(--fg-2);background:color-mix(in oklab,var(--surface) 80%,transparent)}

    @media(max-width:820px){
      .nav{padding:12px 16px;gap:10px;min-height:72px}
      .nav__brand{gap:8px;min-width:0;font-size:0}
      .nav__brand .mark{width:20px;height:20px;flex:0 0 auto}
      .nav__actions{gap:8px;min-width:0;margin-left:auto}
      .nav__cta{display:none}
      .mode-toggle{flex:0 0 auto}
      .ns-language-switcher{margin:0!important;padding:3px!important;gap:1px!important;max-width:230px}
      .ns-language-switcher a{min-width:36px!important;min-height:34px!important;padding:5px 8px!important;font-size:12px!important;letter-spacing:.02em!important}
      .shell{padding-inline:20px}
      section[id]{scroll-margin-top:78px}
      .s-head{padding-top:clamp(64px,14vw,92px);padding-bottom:clamp(30px,8vw,48px)}
      .s-head__index{font-size:.68rem;letter-spacing:.12em;margin-bottom:18px}
      .s-head__title{font-size:clamp(2.35rem,11vw,4.1rem)!important;line-height:.98!important;letter-spacing:-.035em!important;max-width:11ch}
      .ns-impact-intro{font-size:1.02rem;line-height:1.62;margin-bottom:32px;max-width:34ch}
      .ns-cases{grid-template-columns:1fr;gap:14px}
      .ns-case{min-height:auto;padding:25px 22px 24px;border-radius:18px}
      .ns-case__top{display:grid;grid-template-columns:1fr;gap:6px;margin-bottom:22px;font-size:.64rem}
      .ns-case__risk{text-align:left;max-width:none}
      .ns-case h3{font-size:clamp(1.55rem,7.6vw,2.05rem);line-height:1.06;margin-bottom:17px;max-width:none}
      .ns-case p{font-size:.98rem;line-height:1.58}
      .ns-case__answer{padding-top:21px;margin-top:24px;font-size:.96rem;line-height:1.5}
      .ns-proof{margin-top:18px;padding:18px 17px;font-size:.91rem;line-height:1.55;border-radius:0 14px 14px 0}
      .ns-focus{grid-template-columns:1fr;gap:28px;margin-top:68px}
      .ns-focus__statement{font-size:clamp(2rem,9.5vw,3rem);line-height:1.02}
      .ns-focus__copy p{font-size:.98rem;line-height:1.65}
      .ns-world{grid-template-columns:1fr 1fr;gap:8px;margin-top:26px}
      .ns-world span{font-size:.74rem;padding:10px 8px}
    }

    @media(max-width:390px){
      .nav{padding-inline:12px}
      .ns-language-switcher a{min-width:32px!important;padding-inline:6px!important;font-size:11px!important}
      .shell{padding-inline:17px}
      .s-head__title{font-size:clamp(2.15rem,10.5vw,3rem)!important}
      .ns-case{padding:22px 18px}
      .ns-world{grid-template-columns:1fr}
    }
  `;
  document.head.appendChild(style);

  old.id = 'impatto';
  old.innerHTML = `
    <div class="s-head">
      <div class="s-head__index"><span>03</span> NeuroSuite nei fatti</div>
      <h2 class="s-head__title">Capire cosa sta cambiando. <em>Quando c'è ancora tempo per agire.</em></h2>
    </div>
    <p class="ns-impact-intro reveal">NeuroSuite costruisce la normalità individuale della persona e rende visibili le variazioni che contano. Non mostra una montagna di dati: segnala fatti comprensibili, li collega nel tempo e aiuta operatori e professionisti a concentrare l'attenzione dove serve.</p>
    <div class="ns-cases reveal">
      <article class="ns-case"><div class="ns-case__top"><span>Cammino e postura</span><span class="ns-case__risk">Rischio di caduta</span></div><h3>Negli ultimi quattro giorni il passo è più corto, la velocità diminuisce e il baricentro si sposta.</h3><p>Un cambiamento progressivo può essere quasi invisibile a chi vede la persona ogni giorno.</p><div class="ns-case__answer"><strong>NeuroSuite rileva la deriva dalla baseline</strong> e segnala l'aumento del rischio di caduta.</div></article>
      <article class="ns-case"><div class="ns-case__top"><span>Sonno, cuore e attività</span><span class="ns-case__risk">Rischio cardiovascolare</span></div><h3>Da una settimana il sonno è più frammentato, la frequenza cardiaca a riposo cambia e l'attività si riduce.</h3><p>La letteratura scientifica associa combinazioni persistenti di questo tipo a un possibile aumento del rischio cardiovascolare, compresi infarto e ictus.</p><div class="ns-case__answer"><strong>NeuroSuite collega i cambiamenti</strong> e porta il quadro all'attenzione di chi può verificarlo.</div></article>
      <article class="ns-case"><div class="ns-case__top"><span>Movimento nel tempo</span><span class="ns-case__risk">Parkinson e neurodegenerazione</span></div><h3>Il passo diventa meno fluido, i movimenti rallentano e i tempi di reazione si allungano.</h3><p>La letteratura associa variazioni motorie persistenti a possibili segnali precoci di Parkinson e di altre condizioni neurodegenerative.</p><div class="ns-case__answer"><strong>NeuroSuite rende visibile l'evoluzione</strong>, non soltanto il singolo episodio.</div></article>
      <article class="ns-case"><div class="ns-case__top"><span>Routine e comportamento</span><span class="ns-case__risk">Declino cognitivo</span></div><h3>La persona si muove meno, interrompe abitudini consolidate e mostra crescente disorientamento nella routine.</h3><p>La letteratura collega alterazioni comportamentali persistenti al possibile declino cognitivo, all'Alzheimer e ad altre demenze.</p><div class="ns-case__answer"><strong>NeuroSuite confronta il presente con la storia individuale</strong> e segnala il cambiamento.</div></article>
      <article class="ns-case"><div class="ns-case__top"><span>Cambiamento improvviso</span><span class="ns-case__risk">Delirium e peggioramento acuto</span></div><h3>Durante la notte aumentano agitazione, risvegli, disorientamento e comportamenti insoliti.</h3><p>La letteratura associa cambiamenti rapidi di questo tipo al possibile rischio di delirium o a un peggioramento clinico acuto.</p><div class="ns-case__answer"><strong>NeuroSuite riconosce lo scostamento dalla normalità</strong> e ne aumenta la priorità operativa.</div></article>
      <article class="ns-case"><div class="ns-case__top"><span>Stato generale</span><span class="ns-case__risk">Infezioni e riacutizzazioni</span></div><h3>Cambiano respirazione e riposo, diminuisce l'attività e la frequenza cardiaca si allontana dai valori abituali.</h3><p>La letteratura associa quadri multimodali di questo tipo a possibili infezioni, riacutizzazioni cardiache o respiratorie e peggioramenti dello stato generale.</p><div class="ns-case__answer"><strong>NeuroSuite distingue un dato isolato da un quadro coerente</strong> che merita verifica.</div></article>
    </div>
    <div class="ns-proof reveal"><strong>Il fondamento non è una promessa pubblicitaria.</strong> Il repository scientifico NeuroSuite raccoglie oltre 110 pubblicazioni utilizzate per mappare segnali, variazioni e associazioni descritte dalla letteratura internazionale.</div>
    <div class="ns-focus reveal">
      <h3 class="ns-focus__statement">Partiamo dalle strutture assistenziali perché qui anticipare un problema significa proteggere persone fragili e restituire tempo agli operatori.</h3>
      <div class="ns-focus__copy"><p>In una struttura residenziale ogni operatore segue molte persone, i turni cambiano e le informazioni sono distribuite tra osservazioni, dispositivi e momenti diversi. NeuroSuite ricostruisce la continuità: aiuta a capire chi sta cambiando, come e da quanto tempo.</p><p>Questo è il primo campo di applicazione, non il limite della piattaforma. La stessa architettura può sostenere assistenza domiciliare, ospedali, riabilitazione, ricerca clinica, telemedicina e altri contesti nei quali riconoscere una variazione prima che diventi evidente può fare la differenza.</p><div class="ns-world"><span>Strutture assistenziali</span><span>Domicilio</span><span>Ospedali</span><span>Riabilitazione</span><span>Ricerca clinica</span><span>Telemedicina</span><span>Sicurezza operativa</span><span>Sport e recupero</span></div></div>
    </div>`;

  const nav = document.querySelector('.nav__links');
  if (nav) {
    const origin = nav.querySelector('a[href="#perche"]');
    if (origin) {
      origin.textContent = 'Casi concreti';
      origin.setAttribute('href', '#impatto');
    }
  }
  document.querySelectorAll('a[href="#ecosistema"],a[href="#vita-reale"]').forEach(a => a.setAttribute('href', '#impatto'));
  if (location.hash === '#vita-reale' || location.hash === '#ecosistema') history.replaceState(null, '', '#impatto');
  document.querySelectorAll('#impatto .reveal').forEach(el => el.classList.add('in'));
})();