// NeuroSuite — last-night local-sky replay.
// The viewer stays at their own latitude and longitude while the most recent
// completed night, from evening civil twilight to dawn, unfolds in three minutes.

const NeuroPlanetarium = (() => {
  const cycleMs = 180000;
  const dayMs = 86400000;
  const minuteMs = 60000;
  const civilTwilight = -6;
  const rad = Math.PI / 180;
  const startPerformance = performance.now();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const zoneLocations = {
    'Europe/Rome': ['Milano', 45.4642, 9.19],
    'Europe/London': ['London', 51.5072, -.1276],
    'Europe/Paris': ['Paris', 48.8566, 2.3522],
    'Europe/Berlin': ['Berlin', 52.52, 13.405],
    'Europe/Madrid': ['Madrid', 40.4168, -3.7038],
    'Europe/Lisbon': ['Lisbon', 38.7223, -9.1393],
    'Europe/Athens': ['Athens', 37.9838, 23.7275],
    'Europe/Moscow': ['Moscow', 55.7558, 37.6173],
    'America/Los_Angeles': ['Los Angeles', 34.0522, -118.2437],
    'America/Vancouver': ['Vancouver', 49.2827, -123.1207],
    'America/Denver': ['Denver', 39.7392, -104.9903],
    'America/Chicago': ['Chicago', 41.8781, -87.6298],
    'America/New_York': ['New York', 40.7128, -74.006],
    'America/Toronto': ['Toronto', 43.6532, -79.3832],
    'America/Mexico_City': ['Ciudad de México', 19.4326, -99.1332],
    'America/Sao_Paulo': ['São Paulo', -23.5505, -46.6333],
    'America/Argentina/Buenos_Aires': ['Buenos Aires', -34.6037, -58.3816],
    'Asia/Tokyo': ['Tokyo', 35.6762, 139.6503],
    'Asia/Hong_Kong': ['Hong Kong', 22.3193, 114.1694],
    'Asia/Shanghai': ['Shanghai', 31.2304, 121.4737],
    'Asia/Seoul': ['Seoul', 37.5665, 126.978],
    'Asia/Singapore': ['Singapore', 1.3521, 103.8198],
    'Asia/Kolkata': ['Kolkata', 22.5726, 88.3639],
    'Asia/Bangkok': ['Bangkok', 13.7563, 100.5018],
    'Asia/Dubai': ['Dubai', 25.2048, 55.2708],
    'Australia/Sydney': ['Sydney', -33.8688, 151.2093],
    'Australia/Melbourne': ['Melbourne', -37.8136, 144.9631],
    'Australia/Perth': ['Perth', -31.9523, 115.8613],
    'Pacific/Auckland': ['Auckland', -36.8509, 174.7645],
    'Africa/Cairo': ['Cairo', 30.0444, 31.2357],
    'Africa/Nairobi': ['Nairobi', -1.2921, 36.8219],
    'Africa/Johannesburg': ['Johannesburg', -26.2041, 28.0473]
  };

  const estimated = zoneLocations[timeZone] || [
    timeZone.split('/').pop().replaceAll('_', ' '),
    0,
    Math.max(-180, Math.min(180, -new Date().getTimezoneOffset() / 4))
  ];
  let observer = {
    label: estimated[0], latitude: estimated[1], longitude: estimated[2],
    precise: false, timeZone
  };
  let nightCache = null;

  const constellations = [
    { name: 'Ursa Major', stars: [[165.93,61.75,1.8],[165.46,56.38,2.4],[178.46,53.69,2.4],[183.86,57.03,3.3],[193.51,55.96,1.8],[200.98,54.93,2.2],[206.89,49.31,1.9]], edges: [[0,1],[1,2],[2,3],[3,0],[3,4],[4,5],[5,6]] },
    { name: 'Cassiopeia', stars: [[2.29,59.15,2.3],[10.13,56.54,2.2],[14.18,60.72,2.5],[21.45,60.24,2.7],[28.6,63.67,3.3]], edges: [[0,1],[1,2],[2,3],[3,4]] },
    { name: 'Orion', stars: [[88.79,7.41,.5],[81.28,6.35,1.6],[85.19,-1.94,1.8],[84.05,-1.2,1.7],[83,-.3,2.2],[86.94,-9.67,2.1],[78.63,-8.2,.1]], edges: [[0,2],[1,4],[2,3],[3,4],[2,5],[4,6]] },
    { name: 'Taurus', stars: [[68.98,16.51,.9],[81.57,28.61,1.7],[56.87,24.11,2.9],[64.95,15.63,3.5],[67.15,15.87,3.4]], edges: [[2,3],[3,0],[0,4],[0,1]] },
    { name: 'Leo', stars: [[152.09,11.97,1.4],[154.99,19.84,2.0],[168.53,20.52,2.6],[177.26,14.57,2.1],[168.56,15.43,3.3]], edges: [[0,1],[1,2],[2,3],[3,4],[4,0]] },
    { name: 'Cygnus', stars: [[310.36,45.28,1.3],[305.56,40.26,2.2],[292.68,27.96,3.1],[296.24,45.13,2.9],[311.55,33.97,2.5]], edges: [[0,1],[1,2],[3,1],[1,4]] },
    { name: 'Scorpius', stars: [[241.36,-19.81,2.6],[240.08,-22.62,2.3],[247.35,-26.43,1.1],[252.54,-34.29,2.3],[263.4,-37.1,1.6],[262.69,-37.3,2.7]], edges: [[0,1],[1,2],[2,3],[3,4],[4,5]] },
    { name: 'Crux', stars: [[186.65,-63.1,.8],[191.93,-59.69,1.3],[187.79,-57.11,1.6],[183.79,-58.75,2.8]], edges: [[0,2],[1,3]] },
    { name: 'Sagittarius', stars: [[276.04,-34.38,1.8],[275.25,-29.83,2.7],[276.99,-25.42,2.8],[283.82,-26.3,2.1],[285.65,-29.88,2.6]], edges: [[0,1],[1,2],[2,3],[3,4],[4,0]] }
  ];
  const constellationNamesIt = {
    'Ursa Major': 'Orsa Maggiore', Cassiopeia: 'Cassiopea', Orion: 'Orione',
    Taurus: 'Toro', Leo: 'Leone', Cygnus: 'Cigno', Scorpius: 'Scorpione',
    Crux: 'Croce del Sud', Sagittarius: 'Sagittario'
  };

  const brightStars = [
    [101.29,-16.72,-1.46],[95.99,-52.7,-.74],[213.92,19.18,-.05],[279.23,38.78,.03],
    [79.17,45.99,.08],[78.63,-8.2,.13],[114.83,5.23,.34],[24.43,-57.24,.46],
    [88.79,7.41,.5],[297.7,8.87,.76],[186.65,-63.1,.77],[68.98,16.51,.86],
    [247.35,-26.43,1.06],[201.3,-11.16,.98],[116.33,28.03,1.14],[310.36,45.28,1.25],
    [152.09,11.97,1.35],[344.41,-29.62,1.16],[104.66,-28.97,1.5],[263.4,-37.1,1.62]
  ];

  const normalise = value => ((value % 360) + 360) % 360;
  const julianDate = date => date.getTime() / dayMs + 2440587.5;

  function sunEquatorial(date) {
    const days = julianDate(date) - 2451545;
    const meanLongitude = normalise(280.46 + .9856474 * days);
    const anomaly = normalise(357.528 + .9856003 * days) * rad;
    const longitude = (meanLongitude + 1.915 * Math.sin(anomaly) + .02 * Math.sin(2 * anomaly)) * rad;
    const obliquity = (23.439 - .0000004 * days) * rad;
    return {
      ra: normalise(Math.atan2(Math.cos(obliquity) * Math.sin(longitude), Math.cos(longitude)) / rad),
      dec: Math.asin(Math.sin(obliquity) * Math.sin(longitude)) / rad
    };
  }

  function siderealTime(date, longitude) {
    const jd = julianDate(date);
    const centuries = (jd - 2451545) / 36525;
    const greenwich = 280.46061837 + 360.98564736629 * (jd - 2451545)
      + .000387933 * centuries * centuries - centuries * centuries * centuries / 38710000;
    return normalise(greenwich + longitude);
  }

  function horizontal(ra, dec, latitude, lst) {
    const hour = normalise(lst - ra + 180) - 180;
    const h = hour * rad;
    const d = dec * rad;
    const lat = latitude * rad;
    const sinAltitude = Math.sin(d) * Math.sin(lat) + Math.cos(d) * Math.cos(lat) * Math.cos(h);
    const altitude = Math.asin(Math.max(-1, Math.min(1, sinAltitude)));
    const cosAltitude = Math.max(.000001, Math.cos(altitude));
    const sinAzimuth = -Math.sin(h) * Math.cos(d) / cosAltitude;
    const cosAzimuth = (Math.sin(d) - Math.sin(altitude) * Math.sin(lat))
      / Math.max(.000001, cosAltitude * Math.cos(lat));
    return { altitude, azimuth: normalise(Math.atan2(sinAzimuth, cosAzimuth) / rad) * rad };
  }

  function sunAltitudeAt(epoch, latitude = observer.latitude, longitude = observer.longitude) {
    const date = new Date(epoch);
    const sun = sunEquatorial(date);
    return horizontal(sun.ra, sun.dec, latitude, siderealTime(date, longitude)).altitude / rad;
  }

  function refineCrossing(earlier, later) {
    let low = earlier;
    let high = later;
    const lowIsAbove = sunAltitudeAt(low) >= civilTwilight;
    for (let index = 0; index < 18; index++) {
      const middle = (low + high) / 2;
      if ((sunAltitudeAt(middle) >= civilTwilight) === lowIsAbove) low = middle;
      else high = middle;
    }
    return (low + high) / 2;
  }

  function findPreviousCrossing(before, direction) {
    const step = 30 * minuteMs;
    const limit = before - 370 * dayMs;
    let later = before;
    let laterAltitude = sunAltitudeAt(later);

    for (let earlier = later - step; earlier >= limit; earlier -= step) {
      const earlierAltitude = sunAltitudeAt(earlier);
      const rising = earlierAltitude < civilTwilight && laterAltitude >= civilTwilight;
      const falling = earlierAltitude >= civilTwilight && laterAltitude < civilTwilight;
      if ((direction === 'rising' && rising) || (direction === 'falling' && falling)) {
        return refineCrossing(earlier, later);
      }
      later = earlier;
      laterAltitude = earlierAltitude;
    }
    return null;
  }

  function lastCompletedNight(now) {
    const key = `${observer.latitude.toFixed(4)}:${observer.longitude.toFixed(4)}`;
    // Keep one immutable night window for the page session. This prevents a
    // long-open page from changing sky in the middle of a replay.
    if (nightCache && nightCache.key === key) return nightCache;

    const dawn = findPreviousCrossing(now, 'rising');
    const dusk = dawn === null ? null : findPreviousCrossing(dawn - minuteMs, 'falling');
    const valid = dusk !== null && dawn !== null && dawn > dusk + 30 * minuteMs;
    const start = valid ? dusk : now - 18 * 60 * minuteMs;
    const end = valid ? dawn : now - 6 * 60 * minuteMs;

    nightCache = {
      key,
      start,
      end,
      duration: end - start,
      fallback: !valid
    };
    return nightCache;
  }

  function state(time) {
    const clock = Number.isFinite(time) ? time : performance.now();
    const elapsed = Math.max(0, clock - startPerformance);
    const phase = (elapsed % cycleMs) / cycleMs;
    const night = lastCompletedNight(Date.now());
    const date = new Date(night.start + night.duration * phase);
    const lst = siderealTime(date, observer.longitude);
    const sun = sunEquatorial(date);
    const sunHorizontal = horizontal(sun.ra, sun.dec, observer.latitude, lst);
    const future = new Date(date.getTime() + 10 * minuteMs);
    const futureSun = sunEquatorial(future);
    const futureAltitude = horizontal(
      futureSun.ra, futureSun.dec, observer.latitude,
      siderealTime(future, observer.longitude)
    ).altitude;
    return {
      phase,
      date,
      latitude: observer.latitude,
      longitude: observer.longitude,
      label: observer.label,
      precise: observer.precise,
      timeZone: observer.timeZone,
      hemisphere: observer.latitude < 0 ? -1 : 1,
      lst,
      sun: sunHorizontal,
      sunAltitude: night.fallback
        ? Math.min(civilTwilight, sunHorizontal.altitude / rad)
        : sunHorizontal.altitude / rad,
      sunRising: futureAltitude > sunHorizontal.altitude,
      nightStart: new Date(night.start),
      nightEnd: new Date(night.end),
      nightDuration: night.duration,
      nightFallback: night.fallback
    };
  }

  function coordinate(value, positive, negative) {
    return `${Math.abs(value).toFixed(2)}° ${value < 0 ? negative : positive}`;
  }

  let hud = null;
  let hudName = null;
  let hudCoords = null;
  let hudNow = null;
  let hudTime = null;
  let hudSource = null;
  let hudProgress = null;
  let hudLocate = null;
  let lastHudTick = -1;
  let locating = false;

  function mountHud() {
    if (hud || !document.body) return;
    const style = document.createElement('style');
    style.id = 'ns-planetarium-hud-style';
    style.textContent = `
      .planetarium-hud {
        position: relative;
        z-index: 3;
        display: grid;
        grid-template-columns: minmax(150px,.72fr) minmax(260px,1.28fr) auto;
        align-items: center;
        gap: 7px 20px;
        width: min(100%, 760px);
        padding: 11px 0 10px;
        border-top: 1px solid rgba(231,191,111,.23);
        border-bottom: 1px solid rgba(145,196,241,.12);
        color: var(--fg-3);
        background: linear-gradient(90deg, rgba(8,28,57,.28), rgba(8,28,57,.08) 58%, transparent);
        pointer-events: auto;
        transition: opacity .4s ease, visibility .4s ease;
      }
      .planetarium-hud__identity,
      .planetarium-hud__reading { min-width: 0; }
      .planetarium-hud__eyebrow,
      .planetarium-hud__coords,
      .planetarium-hud__time,
      .planetarium-hud__source,
      .planetarium-hud__locate {
        font-family: var(--mono);
        text-transform: uppercase;
        letter-spacing: .12em;
      }
      .planetarium-hud__eyebrow { font-size: 9px; color: var(--accent); }
      .planetarium-hud__name {
        margin-top: 3px;
        font-family: var(--serif);
        font-size: 17px;
        line-height: 1.1;
        color: var(--fg);
      }
      .planetarium-hud__coords { margin-top: 3px; font-size: 8px; line-height: 1.35; opacity: .72; }
      .planetarium-hud__now,
      .planetarium-hud__time {
        font-family: var(--mono);
        font-size: 9px;
        line-height: 1.45;
        letter-spacing: .09em;
        text-transform: uppercase;
        white-space: nowrap;
      }
      .planetarium-hud__now { color: var(--fg-2); }
      .planetarium-hud__time { margin-top: 2px; opacity: .82; }
      .planetarium-hud__track {
        grid-column: 1 / -1;
        height: 1px;
        margin-top: 2px;
        background: rgba(215,188,128,.18);
        overflow: hidden;
      }
      .planetarium-hud__progress {
        display: block;
        width: 100%;
        height: 100%;
        transform: scaleX(0);
        transform-origin: left center;
        background: linear-gradient(90deg, #9acbfa, var(--accent));
      }
      .planetarium-hud__source { display: none; }
      .planetarium-hud__locate {
        justify-self: end;
        padding: 7px 10px;
        border: 1px solid rgba(231,191,111,.28);
        border-radius: 999px;
        color: var(--fg-2);
        background: rgba(5,18,40,.18);
        font-size: 8px;
        line-height: 1.2;
        cursor: pointer;
      }
      .planetarium-hud__locate:hover,
      .planetarium-hud__locate:focus-visible { color: var(--fg); border-color: var(--accent-line); }
      html[data-mode="light"] .planetarium-hud { display: none; }
      @media (max-width: 620px) {
        .planetarium-hud {
          grid-template-columns: minmax(0,1fr) auto;
          gap: 5px 10px;
          width: 100%;
          padding: 10px 0 9px;
          background: linear-gradient(90deg, rgba(8,28,57,.2), transparent);
        }
        .planetarium-hud__identity { grid-column: 1; grid-row: 1; }
        .planetarium-hud__reading { grid-column: 1; grid-row: 2; }
        .planetarium-hud__name { font-size: 15px; }
        .planetarium-hud__coords { display: none; }
        .planetarium-hud__locate {
          grid-column: 2;
          grid-row: 1 / span 2;
          max-width: 108px;
          padding: 7px 9px;
          white-space: normal;
        }
        .planetarium-hud__track { grid-row: 3; }
        .planetarium-hud__now,
        .planetarium-hud__time { font-size: 8px; white-space: normal; }
      }
      @media (prefers-reduced-motion: reduce) {
        .planetarium-hud__progress { transform: scaleX(0) !important; }
      }
    `;
    document.head.appendChild(style);

    hud = document.createElement('aside');
    hud.className = 'planetarium-hud';
    hud.setAttribute('aria-label', 'Local sky status');
    hud.innerHTML = `
      <div class="planetarium-hud__identity">
        <div class="planetarium-hud__eyebrow">Ultima notte locale · 03:00</div>
        <div class="planetarium-hud__name"></div>
        <div class="planetarium-hud__coords"></div>
      </div>
      <div class="planetarium-hud__reading">
        <div class="planetarium-hud__now"></div>
        <div class="planetarium-hud__time" aria-live="polite"></div>
      </div>
      <div class="planetarium-hud__source"></div>
      <button class="planetarium-hud__locate" type="button">Usa posizione precisa</button>
      <div class="planetarium-hud__track"><span class="planetarium-hud__progress"></span></div>
    `;
    const heroContent = document.querySelector('.hero__content');
    const heroButtons = heroContent?.querySelector('.hero__buttons');
    if (heroContent && heroButtons) heroContent.insertBefore(hud, heroButtons);
    else if (heroContent) heroContent.appendChild(hud);
    else document.body.appendChild(hud);
    hudName = hud.querySelector('.planetarium-hud__name');
    hudCoords = hud.querySelector('.planetarium-hud__coords');
    hudNow = hud.querySelector('.planetarium-hud__now');
    hudTime = hud.querySelector('.planetarium-hud__time');
    hudSource = hud.querySelector('.planetarium-hud__source');
    hudProgress = hud.querySelector('.planetarium-hud__progress');
    hudLocate = hud.querySelector('.planetarium-hud__locate');
    hudLocate.addEventListener('click', () => requestPreciseLocation(false));

    if (navigator.permissions?.query && navigator.geolocation) {
      navigator.permissions.query({ name: 'geolocation' }).then(permission => {
        if (permission.state === 'granted') requestPreciseLocation(true);
      }).catch(() => {});
    }
  }

  function requestPreciseLocation(silent) {
    if (!navigator.geolocation) return;
    const language = document.documentElement.lang?.toLowerCase().startsWith('it') ? 'it' : 'en';
    locating = true;
    if (!silent && hudLocate) hudLocate.textContent = language === 'it' ? 'Richiesta posizione…' : 'Requesting location…';
    navigator.geolocation.getCurrentPosition(position => {
      observer = {
        ...observer,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        label: '',
        precise: true
      };
      nightCache = null;
      locating = false;
      lastHudTick = -1;
      if (hudLocate) hudLocate.textContent = language === 'it' ? 'Posizione precisa attiva' : 'Precise location active';
    }, () => {
      locating = false;
      if (hudLocate) hudLocate.textContent = language === 'it' ? 'Usa posizione precisa' : 'Use precise location';
    }, { enableHighAccuracy: false, timeout: 9000, maximumAge: 3600000 });
  }

  function skyMoment(current, language) {
    const altitude = current.sunAltitude;
    if (altitude > -8) {
      if (current.sunRising) return language === 'it' ? 'ALBA' : 'DAWN';
      return language === 'it' ? 'CREPUSCOLO' : 'TWILIGHT';
    }
    if (altitude > -18) return language === 'it' ? 'ORA BLU' : 'BLUE HOUR';
    return language === 'it' ? 'NOTTE' : 'NIGHT';
  }

  function updateHud(time, current) {
    mountHud();
    if (!hud) return;
    const tick = Math.floor(Date.now() / 250);
    if (tick === lastHudTick) return;
    lastHudTick = tick;
    const language = document.documentElement.lang?.toLowerCase().startsWith('it') ? 'it' : 'en';
    const eyebrow = hud.querySelector('.planetarium-hud__eyebrow');
    if (eyebrow) eyebrow.textContent = language === 'it'
      ? 'Ultima notte locale · 03:00'
      : 'Last local night · 03:00';
    hud.setAttribute('aria-label', language === 'it' ? 'Replay dell’ultima notte locale' : 'Last local night replay');
    hudName.textContent = current.precise
      ? (language === 'it' ? 'La tua posizione' : 'Your location')
      : `${current.label} · ${language === 'it' ? 'stima' : 'estimate'}`;
    hudCoords.textContent = `${coordinate(current.latitude, 'N', 'S')} · ${coordinate(current.longitude, 'E', 'W')}`;
    let clock = '';
    try {
      clock = new Intl.DateTimeFormat(language === 'it' ? 'it-IT' : 'en-GB', {
        hour: '2-digit', minute: '2-digit', hour12: false, timeZone: current.timeZone
      }).format(current.date);
    } catch {
      clock = current.date.toISOString().slice(11, 16);
    }
    const formatNightTime = date => {
      try {
        return new Intl.DateTimeFormat(language === 'it' ? 'it-IT' : 'en-GB', {
          hour: '2-digit', minute: '2-digit', hour12: false, timeZone: current.timeZone
        }).format(date);
      } catch {
        return date.toISOString().slice(11, 16);
      }
    };
    const start = formatNightTime(current.nightStart);
    const end = formatNightTime(current.nightEnd);
    const speed = Math.max(1, Math.round(current.nightDuration / cycleMs));
    hudNow.textContent = `${language === 'it' ? 'Ultima notte' : 'Last night'} · ${start}—${end}`;
    hudTime.textContent = `Replay · ${skyMoment(current, language)} · ${clock} · ×${speed}`;
    hudSource.textContent = current.precise
      ? (language === 'it' ? 'Posizione precisa · solo su questo dispositivo' : 'Precise location · this device only')
      : (language === 'it' ? `Stima automatica · ${current.timeZone}` : `Automatic estimate · ${current.timeZone}`);
    hudLocate.textContent = locating
      ? (language === 'it' ? 'Richiesta posizione…' : 'Requesting location…')
      : current.precise
        ? (language === 'it' ? 'Posizione precisa attiva' : 'Precise location active')
        : (language === 'it' ? 'Usa posizione precisa' : 'Use precise location');
    hudProgress.style.transform = `scaleX(${current.phase})`;
  }

  const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
  const smoothstep = (minimum, maximum, value) => {
    const amount = clamp((value - minimum) / (maximum - minimum), 0, 1);
    return amount * amount * (3 - 2 * amount);
  };

  function projectHorizontal(position, centerX, centerY, radiusX, radiusY) {
    const altitude = position.altitude;
    const altitudeDegrees = altitude / rad;
    if (altitudeDegrees < -8) return null;
    const distance = 1 - clamp(altitude / (Math.PI / 2), -.09, 1);
    return {
      x: centerX + Math.sin(position.azimuth) * radiusX * distance,
      y: centerY - Math.cos(position.azimuth) * radiusY * distance,
      alpha: smoothstep(-8, 2, altitudeDegrees),
      altitude: altitudeDegrees
    };
  }

  function project(ra, dec, current, centerX, centerY, radiusX, radiusY) {
    return projectHorizontal(
      horizontal(ra, dec, current.latitude, current.lst),
      centerX, centerY, radiusX, radiusY
    );
  }

  function drawAtmosphere(ctx, width, top, stageHeight, current, isLight) {
    const altitude = current.sunAltitude;
    const day = smoothstep(-6, 9, altitude);
    const twilight = clamp(1 - Math.abs(altitude + 4) / 15, 0, 1);
    const night = 1 - smoothstep(-15, 1, altitude);
    const centerX = width * .5;
    const centerY = top + stageHeight * .56;
    const radiusX = width * (width < 620 ? .61 : .52);
    const radiusY = stageHeight * .43;
    const sunX = centerX + Math.sin(current.sun.azimuth) * radiusX * .88;
    const sunY = centerY - Math.cos(current.sun.azimuth) * radiusY * .88;
    const opacity = isLight ? .42 : 1;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    const sky = ctx.createLinearGradient(0, top, 0, top + stageHeight);
    sky.addColorStop(0, `rgba(35,102,166,${day * .16 * opacity + twilight * .035})`);
    sky.addColorStop(.56, `rgba(48,119,177,${day * .12 * opacity + twilight * .05})`);
    sky.addColorStop(1, `rgba(92,142,174,${day * .075 * opacity})`);
    ctx.fillStyle = sky;
    ctx.fillRect(0, top, width, stageHeight);

    if (twilight > .015) {
      const dawn = current.sunRising;
      const glow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, Math.max(width, stageHeight) * .58);
      glow.addColorStop(0, dawn
        ? `rgba(255,190,128,${twilight * .32 * opacity})`
        : `rgba(255,139,82,${twilight * .36 * opacity})`);
      glow.addColorStop(.28, dawn
        ? `rgba(222,139,170,${twilight * .18 * opacity})`
        : `rgba(211,91,137,${twilight * .2 * opacity})`);
      glow.addColorStop(.64, `rgba(87,78,153,${twilight * .105 * opacity})`);
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, top, width, stageHeight);
    }
    ctx.restore();
    return night;
  }

  function drawGrid(ctx, width, top, stageHeight, current, isLight) {
    if (!width || !stageHeight) return;
    const centerX = width * .5;
    const centerY = top + stageHeight * .56;
    const radiusX = width * (width < 620 ? .61 : .52);
    const radiusY = stageHeight * .43;
    const night = drawAtmosphere(ctx, width, top, stageHeight, current, isLight);
    const visibility = .035 + night * .965;
    const grid = isLight ? 'rgba(40,50,64,.1)' : `rgba(144,199,249,${.045 + night * .08})`;
    const horizon = isLight ? 'rgba(130,92,42,.14)' : `rgba(231,193,113,${.095 + night * .09})`;

    ctx.save();
    ctx.lineWidth = .55;
    ctx.setLineDash([3, 13]);
    ctx.strokeStyle = grid;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX * .5, radiusY, current.lst * rad * .025, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY * .5, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.strokeStyle = horizon;
    ctx.lineWidth = .72;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.globalCompositeOperation = 'screen';

    const projectedConstellations = constellations.map(constellation => ({
      ...constellation,
      projected: constellation.stars.map(star => project(
        star[0], star[1], current, centerX, centerY, radiusX, radiusY
      ))
    }));

    for (const constellation of projectedConstellations) {
      ctx.lineWidth = .68;
      for (const edge of constellation.edges) {
        const a = constellation.projected[edge[0]];
        const b = constellation.projected[edge[1]];
        if (!a || !b) continue;
        const alpha = Math.min(a.alpha, b.alpha) * visibility * .36;
        if (alpha < .012) continue;
        const line = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        line.addColorStop(0, `rgba(140,203,255,${alpha})`);
        line.addColorStop(1, `rgba(242,199,111,${alpha * .9})`);
        ctx.strokeStyle = line;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      let labelX = 0;
      let labelY = 0;
      let visiblePoints = 0;
      constellation.projected.forEach((point, index) => {
        if (!point) return;
        const magnitude = constellation.stars[index][2];
        const alpha = point.alpha * visibility * clamp(1.05 - magnitude * .08, .42, 1);
        const radius = clamp(2.35 - magnitude * .34, .58, 2.2);
        ctx.shadowColor = index % 3 === 0 ? 'rgba(244,202,118,.72)' : 'rgba(154,211,255,.68)';
        ctx.shadowBlur = 4 + radius * 3;
        ctx.fillStyle = index % 3 === 0
          ? `rgba(255,222,151,${alpha})`
          : `rgba(208,235,255,${alpha})`;
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
        ctx.fill();
        labelX += point.x;
        labelY += point.y;
        visiblePoints++;
      });
      if (visiblePoints >= 3 && visibility > .28) {
        ctx.shadowBlur = 0;
        ctx.font = `8px ${getComputedStyle(document.documentElement).getPropertyValue('--mono') || 'monospace'}`;
        ctx.textAlign = 'center';
        ctx.fillStyle = `rgba(171,198,224,${visibility * .24})`;
        const label = document.documentElement.lang?.toLowerCase().startsWith('it')
          ? constellationNamesIt[constellation.name] || constellation.name
          : constellation.name;
        ctx.fillText(label.toUpperCase(), labelX / visiblePoints, labelY / visiblePoints + 14);
      }
    }

    for (const star of brightStars) {
      const point = project(star[0], star[1], current, centerX, centerY, radiusX, radiusY);
      if (!point) continue;
      const alpha = point.alpha * visibility * clamp(1.12 - star[2] * .08, .5, 1);
      const radius = clamp(2.45 - star[2] * .42, .7, 3.2);
      ctx.shadowColor = 'rgba(177,218,255,.72)';
      ctx.shadowBlur = 5 + radius * 3;
      ctx.fillStyle = `rgba(222,240,255,${alpha})`;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    const sunPoint = projectHorizontal(current.sun, centerX, centerY, radiusX, radiusY);
    if (sunPoint && current.sunAltitude > -.83) {
      const sunVisibility = smoothstep(-.83, 1, current.sunAltitude);
      ctx.shadowColor = 'rgba(255,199,102,.9)';
      ctx.shadowBlur = 24;
      ctx.fillStyle = `rgba(255,218,145,${.38 + sunVisibility * .5})`;
      ctx.beginPath();
      ctx.arc(sunPoint.x, sunPoint.y, 3 + sunVisibility * 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    ctx.save();
    ctx.font = `9px ${getComputedStyle(document.documentElement).getPropertyValue('--mono') || 'monospace'}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = horizon;
    ctx.fillText('N', centerX, centerY - radiusY * .96);
    ctx.fillText('E', centerX + radiusX * .94, centerY);
    ctx.fillText('S', centerX, centerY + radiusY * .96);
    ctx.fillText('W', centerX - radiusX * .94, centerY);
    ctx.restore();
  }

  return { cycleMs, state, updateHud, drawGrid };
})();

// Stable single-viewport sky: one canvas, one clock, no scroll-driven rebuilds.
(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true })
    || canvas.getContext('2d');
  if (!ctx) return;

  const style = document.createElement('style');
  style.id = 'ns-stable-sky-style';
  style.textContent = `
    .sky-stage {
      position: fixed;
      inset: 0;
      z-index: 0;
      width: 100vw;
      height: 100vh;
      height: 100lvh;
      max-width: none;
      pointer-events: none;
      opacity: .94;
      mix-blend-mode: screen;
      transition: opacity .45s ease;
    }
    body > .hero,
    body > main,
    body > footer {
      position: relative;
      z-index: 1;
    }
    html[data-mode="light"] .sky-stage { opacity: 0; }
    @media (max-width: 620px) {
      .sky-stage { opacity: .88; }
    }
    @media (prefers-reduced-motion: reduce) {
      .sky-stage { opacity: .78; }
    }
  `;
  document.head.appendChild(style);

  canvas.className = 'sky-stage';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reduceMotion = motionQuery.matches;
  let mode = document.documentElement.getAttribute('data-mode') || 'dark';
  let width = 0;
  let height = 0;
  let dpr = 1;
  let stars = [];
  let raf = null;
  let lastFrame = -Infinity;
  let resizeTimer = null;

  function hash(value) {
    const x = Math.sin(value * 127.1 + 311.7) * 43758.5453123;
    return x - Math.floor(x);
  }

  function buildScene() {
    const count = width < 620 ? 128 : Math.min(230, Math.round(width * height / 7600));
    stars = Array.from({ length: count }, (_, index) => ({
      x: hash(index + 1.17) * width,
      y: hash(index + 19.83) * height,
      radius: .3 + hash(index + 37.41) * 1.15,
      alpha: .15 + hash(index + 53.09) * .48,
      phase: hash(index + 71.77) * Math.PI * 2,
      speed: .00008 + hash(index + 89.31) * .00018,
      gold: hash(index + 113.49) > .8
    }));
  }

  function resize(force = false) {
    const rect = canvas.getBoundingClientRect();
    const nextWidth = Math.max(1, Math.round(rect.width || window.innerWidth));
    const nextHeight = Math.max(1, Math.round(rect.height || window.innerHeight));
    const widthChanged = Math.abs(nextWidth - width) > 2;
    const heightChanged = Math.abs(nextHeight - height) > 2;

    // Mobile browser chrome changes viewport height during scroll. The large-viewport
    // canvas already covers that movement, so a height-only micro-resize is ignored.
    if (!force && !widthChanged && (!heightChanged || Math.abs(nextHeight - height) < 160)) return;

    width = nextWidth;
    height = nextHeight;
    const preferred = Math.min(window.devicePixelRatio || 1, width < 620 ? 1.2 : 1.55);
    const maxPixels = width < 620 ? 2300000 : 4200000;
    dpr = Math.max(.8, Math.min(preferred, Math.sqrt(maxPixels / (width * height))));
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildScene();
    draw(performance.now());
  }

  function drawAmbient(time, visibility) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    for (const star of stars) {
      const shimmer = reduceMotion ? .78 : .68 + .32 * Math.sin(time * star.speed + star.phase);
      const alpha = star.alpha * shimmer * visibility;
      ctx.fillStyle = star.gold
        ? `rgba(248,214,139,${alpha})`
        : `rgba(177,218,255,${alpha})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius * (.82 + shimmer * .24), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.lineWidth = .55;
    for (let index = 0; index + 7 < stars.length; index += 19) {
      const a = stars[index];
      const b = stars[index + 7];
      const alpha = Math.min(a.alpha, b.alpha) * .16 * visibility;
      ctx.strokeStyle = `rgba(160,207,245,${alpha})`;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function draw(time) {
    if (!width || !height || mode !== 'dark') return;
    const sky = NeuroPlanetarium.state(time);
    const visibility = Math.max(.04, Math.min(1, (-sky.sunAltitude + 6) / 18));
    const seamAmount = Math.max(0, Math.min(1, (sky.phase - .95) / .05));
    const seamBlend = seamAmount * seamAmount * (3 - 2 * seamAmount);

    ctx.clearRect(0, 0, width, height);
    if (seamBlend > 0) {
      ctx.save();
      ctx.globalAlpha = 1 - seamBlend;
      NeuroPlanetarium.drawGrid(ctx, width, 0, height, sky, false);
      ctx.restore();

      const nextSky = NeuroPlanetarium.state(time + (1 - sky.phase) * NeuroPlanetarium.cycleMs);
      ctx.save();
      ctx.globalAlpha = seamBlend;
      NeuroPlanetarium.drawGrid(ctx, width, 0, height, nextSky, false);
      ctx.restore();
    } else {
      NeuroPlanetarium.drawGrid(ctx, width, 0, height, sky, false);
    }
    drawAmbient(time, visibility);

    const vignette = ctx.createRadialGradient(
      width * .52, height * .46, Math.min(width, height) * .18,
      width * .52, height * .46, Math.max(width, height) * .78
    );
    vignette.addColorStop(0, 'rgba(2,7,18,0)');
    vignette.addColorStop(1, 'rgba(2,7,18,.28)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    NeuroPlanetarium.updateHud(time, sky);
  }

  function loop(time) {
    raf = null;
    if (document.hidden || mode !== 'dark') return;
    const frameInterval = width < 620 ? 48 : 34;
    if (time - lastFrame >= frameInterval) {
      draw(time);
      lastFrame = time;
    }
    if (!reduceMotion) raf = requestAnimationFrame(loop);
  }

  function start() {
    if (raf || document.hidden || mode !== 'dark' || reduceMotion) return;
    raf = requestAnimationFrame(loop);
  }

  function stop() {
    if (!raf) return;
    cancelAnimationFrame(raf);
    raf = null;
  }

  function requestResize(force = false) {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => resize(force), 160);
  }

  const themeObserver = new MutationObserver(() => {
    mode = document.documentElement.getAttribute('data-mode') || 'dark';
    if (mode === 'dark') {
      draw(performance.now());
      start();
    } else {
      stop();
      ctx.clearRect(0, 0, width, height);
    }
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode'] });

  window.addEventListener('resize', () => requestResize(false), { passive: true });
  window.addEventListener('orientationchange', () => requestResize(true), { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else {
      draw(performance.now());
      start();
    }
  });
  if (motionQuery.addEventListener) {
    motionQuery.addEventListener('change', event => {
      reduceMotion = event.matches;
      stop();
      draw(performance.now());
      start();
    });
  }

  requestAnimationFrame(() => {
    resize(true);
    start();
  });
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
