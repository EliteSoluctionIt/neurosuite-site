const ADP = (() => {
  const state = { mode: 'studio', session: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), events: [] };
  const dangerous = [
    /\b(arma|armi|pistola|fucile|coltello|bomba|esplosiv|molotov)\b/i,
    /\b(ammazzare|uccidere|omicidio|strangolare|avvelenare|fare fuori)\b/i,
    /\b(suicid|autolesion|tagliarmi|impiccarmi)\b/i,
    /\b(droga|cocaina|eroina|metanfetamina|spacciare)\b/i,
    /\b(hackerare|phishing|rubare password|craccare|malware|ransomware)\b/i,
    /\b(truffa|ricattare|estorsione|frode|rubare carta)\b/i,
    /\b(porno minor|minorenne nudo|abuso sessuale)\b/i
  ];
  function log(type, payload={}) {
    const item = { t: new Date().toISOString(), session: state.session, type, mode: state.mode, ...payload };
    state.events.push(item);
    localStorage.setItem('ADAPTRON_EVENTS', JSON.stringify(state.events.slice(-500)));
    fetch('/api/adaptron-event', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(item) }).catch(()=>{});
  }
  function addMsg(text, cls='') {
    const div = document.createElement('div'); div.className = 'msg ' + cls; div.textContent = text;
    document.getElementById('chatLog').appendChild(div); div.scrollIntoView({behavior:'smooth', block:'end'});
  }
  function validCode(code){ return /^ADP-(0[0-9][1-9]|0[1-9][0-9]|100)$/i.test(code.trim()); }
  function safety(text){ return dangerous.some(rx => rx.test(text)); }
  function guidedReply(text, mode, profile){
    const prefix = { studio:'Partiamo in modo guidato.', pratico:'Procediamo in sicurezza e per esclusione.', scrittura:'Costruiamolo in modo chiaro.', capire:'Te lo rendo semplice e progressivo.' }[mode] || 'Procediamo.';
    return `${prefix}\n\nHo capito la richiesta: “${text.slice(0,160)}”.\n\nPrima ti propongo un primo passo, poi ti faccio una domanda breve per adattare il livello.\n\n1) Obiettivo: capire esattamente cosa vuoi ottenere.\n2) Primo passo: dividiamo il problema in parti semplici.\n3) Domanda: vuoi una spiegazione molto semplice, media o tecnica?`;
  }
  function init(){
    document.querySelectorAll('.adp-mode').forEach(b => b.addEventListener('click', () => { document.querySelectorAll('.adp-mode').forEach(x=>x.classList.remove('active')); b.classList.add('active'); state.mode=b.dataset.mode; log('mode_change',{value:state.mode}); }));
    document.getElementById('adpForm').addEventListener('submit', async e => {
      e.preventDefault();
      const code = document.getElementById('inviteCode').value;
      const consent = document.getElementById('consent').checked;
      const profile = document.getElementById('profile').value;
      const text = document.getElementById('prompt').value.trim();
      if(!validCode(code)){ addMsg('Codice invito non valido. Usa un codice nel formato ADP-001 fino ADP-100.', 'blocked'); return; }
      if(!consent){ addMsg('Prima devi confermare l’uso responsabile. Per utenti minorenni serve supervisione/autorizzazione di un genitore o tutore.', 'blocked'); return; }
      if(!text) return;
      addMsg(text, 'user'); document.getElementById('prompt').value=''; log('user_message',{profile, code:code.toUpperCase(), length:text.length});
      if(safety(text)){
        const block = 'Mi dispiace, non posso aiutarti con richieste che potrebbero essere illegali, pericolose o dannose. Posso però aiutarti a riformulare la domanda in modo sicuro, educativo o preventivo.';
        addMsg(block, 'blocked'); log('blocked_request',{profile, code:code.toUpperCase(), sample:text.slice(0,120)}); return;
      }
      addMsg(guidedReply(text, state.mode, profile)); log('assistant_reply',{profile, code:code.toUpperCase(), simulated:true});
    });
    document.getElementById('exportLog').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(state.events,null,2)], {type:'application/json'}); const a=document.createElement('a');
      a.href=URL.createObjectURL(blob); a.download='adaptron-session-log.json'; a.click(); URL.revokeObjectURL(a.href);
    });
    log('session_start');
  }
  return { init };
})();
document.addEventListener('DOMContentLoaded', ADP.init);
