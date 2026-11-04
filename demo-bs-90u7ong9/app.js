(function(){const D=window.DEMO_DATA,ORDER=["NONE","INFO","WATCH","REVIEW","URGENT"];
const IT={NONE:"Nessuna variazione",INFO:"Nota",WATCH:"Da osservare",REVIEW:"Da rivalutare",URGENT:"Urgente"};
const ACT={NONE:"Nessuna azione: monitoraggio ordinario.",INFO:"Nessuna azione: monitoraggio ordinario.",WATCH:"Continuare il monitoraggio; nessuna azione immediata.",REVIEW:"Valutazione clinica consigliata nei prossimi giorni.",URGENT:"Valutazione clinica tempestiva consigliata."};
const NAME={resting_hr:["frequenza cardiaca a riposo","battiti/min",0],rmssd:["variabilità cardiaca (HRV)","ms",0],resp_rate:["frequenza respiratoria","atti/min",1],skin_temp:["temperatura cutanea","°C",1],eda_tonic:["sudorazione cutanea (EDA)","µS",2],spo2:["saturazione di ossigeno","%",1],sleep_tst:["durata del sonno","minuti",0],sleep_eff:["efficienza del sonno","%",0],activity:["attività fisica","indice",2]};
const MAIN={step:["resting_hr","rmssd","resp_rate","skin_temp"],drift:["resting_hr","rmssd"],heatwave:["skin_temp","resting_hr"],sleep_step:["sleep_tst","sleep_eff"]};
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const lv=l=>`<span class="lv ${l}">${IT[l]}</span>`,gg=n=>n==1?"1 giorno":n+" giorni";
const scale=(f,v)=>v==null?null:(f=="sleep_eff"?v*100:v);
function fmt(f,v){const d=NAME[f][2];return scale(f,v).toFixed(d).replace(".",",")}
function link(r){let o=[];if(r.doi)o.push(`<a href="https://doi.org/${esc(r.doi)}" target="_blank" rel="noopener noreferrer">DOI</a>`);if(r.pmid)o.push(`<a href="https://pubmed.ncbi.nlm.nih.gov/${esc(r.pmid)}/" target="_blank" rel="noopener noreferrer">PubMed</a>`);return `${esc(r.id)} ${o.join(" · ")}`}
function changes(sc){const r0=sc.report.orion.first_day.REVIEW,on=r0!=null&&sc.event=="drift"?r0:sc.onset,end=Math.min(sc.days.length,on+14),out=[];
 for(const f of MAIN[sc.event]){const F=sc.features[f],b=F.band_display[1],v=F.values.slice(on,end).filter(x=>x!=null),m=v.reduce((a,x)=>a+x,0)/v.length,delta=m-b,
  half=(F.band_display[2]-F.band_display[0])/2;out.push({f,base:b,now:m,delta,sig:Math.abs(delta)>half*0.75})}return out}
function finalLevel(sc){const o=sc.report.orion;return o.peak_level}
function sentence(c){const[n,u]=NAME[c.f];const dir=c.delta>0?"aumentata":"diminuita";const d=Math.abs(scale(c.f,c.delta)).toFixed(NAME[c.f][2]).replace(".",",");return `${n} ${dir} di ${d} ${u} (da ${fmt(c.f,c.base)} a ${fmt(c.f,c.now)} ${u})`}
function summaryRow(sc){const o=sc.report.orion,L=finalLevel(sc),ch=changes(sc).filter(c=>c.sig);
 const what=ORDER.indexOf(L)>=3&&ch.length?ch.map(sentence).join("; "):sc.event=="heatwave"?"Solo la temperatura dell'ambiente è aumentata (ondata di calore). Orion l'ha riconosciuta come causa esterna e non ha segnalato un problema di salute.":"Nessun cambiamento persistente rispetto ai valori abituali.";
 const since=o.first_day.REVIEW!=null?`dal giorno ${o.first_day.REVIEW} (cambiamento simulato iniziato il giorno ${sc.onset}; segnalato dopo ${gg(o.delay_review_days)})`:"—";
 return `<tr><td><b>${esc(sc.id)}. ${esc(sc.title)}</b></td><td>${what}</td><td>${since}</td><td>${lv(L)}<br>${ACT[L]}</td></tr>`}
function summary(){document.getElementById("summary").innerHTML=`<h2>Sintesi clinica</h2><p><b>Attenzione: persone e dati sono simulati al computer (DATI SIMULATI — NON CLINICI).</b> I valori di partenza vengono da registrazioni reali pubbliche. Il documento non è una diagnosi e non sostituisce la valutazione del personale sanitario.</p>
<table class="sum"><tr><th>Persona simulata</th><th>Cosa è cambiato (media delle 2 settimane dopo il cambiamento, rispetto al valore abituale)</th><th>Da quando</th><th>Livello e azione suggerita</th></tr>${D.scenarios.map(summaryRow).join("")}</table>
<p><small>Livelli: Nota · Da osservare · Da rivalutare · Urgente. Il livello mostrato è quello finale di Orion. La decisione spetta sempre al personale.</small></p>`}
function chart(f,F,sc){const W=560,H=190,p=44,v=F.values.map(x=>scale(f,x)),n=v.length,ok=v.filter(x=>x!=null),[lo,md,hi]=F.band_display.map(x=>scale(f,x));
 let mn=Math.min(lo,...ok),mx=Math.max(hi,...ok);const pad=(mx-mn)*.08||1;mn-=pad;mx+=pad;if(f=="spo2")mx=Math.min(100,mx);const X=i=>p+i*(W-p-8)/(n-1),Y=y=>H-24-(y-mn)*(H-40)/(mx-mn);
 let path="";v.forEach((y,i)=>{if(y==null)return;path+=(path&&v[i-1]!=null?"L":"M")+X(i).toFixed(1)+","+Y(y).toFixed(1)});
 let marks="";sc.days.forEach((d,i)=>{if(ORDER.indexOf(d.level)>=3)marks+=`<rect x="${X(i)-2}" y="10" width="4" height="${H-34}" fill="#e8590c" opacity=".25"/>`});
 const t=x=>x.toFixed(NAME[f][2]).replace(".",",");
 return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${esc(NAME[f][0])}"><rect x="${p}" y="${Y(hi)}" width="${W-p-8}" height="${Y(lo)-Y(hi)}" fill="#2b8a3e" opacity=".13"/><line x1="${p}" x2="${W-8}" y1="${Y(md)}" y2="${Y(md)}" stroke="#2b8a3e" stroke-dasharray="4"/>${marks}
<line x1="${X(sc.onset)}" x2="${X(sc.onset)}" y1="8" y2="${H-24}" stroke="#333" stroke-dasharray="2 3"/><text x="${X(sc.onset)+4}" y="18" font-size="12">inizio cambiamento (giorno ${sc.onset})</text>
<path d="${path}" fill="none" stroke="#1f4e79" stroke-width="2"/><text x="2" y="${Y(hi)+4}" font-size="11">${t(hi)}</text><text x="2" y="${Y(lo)+4}" font-size="11">${t(lo)}</text><text x="${p}" y="${H-6}" font-size="11">giorno 0</text><text x="${W-70}" y="${H-6}" font-size="11">giorno ${n-1}</text></svg>`}
function scenario(sc){const r=sc.report,o=r.orion,L=finalLevel(sc),ch=changes(sc);
 const charts=MAIN[sc.event].map(f=>`<div><b class="big">${esc(NAME[f][0])}</b> <small>(${esc(NAME[f][1])})</small>${chart(f,sc.features[f],sc)}</div>`).join("");
 const pre=sc.days.slice(0,sc.onset).filter(d=>d.level=="WATCH").length;
 const ev=Object.entries(r.evidence).map(([f,e])=>`<tr><td>${esc(NAME[f]?NAME[f][0]:f)}</td><td>${e.consolidated_measurement.map(link).join("<br>")||"—"}</td><td>${e.experimental_early_warning_hypothesis.map(link).join("<br>")||"—"}</td></tr>`).join("");
 return `<section class="card scen"><div class="sim" style="position:static;border-radius:6px">DATI SIMULATI — NON CLINICI · Persona simulata ${esc(sc.id)}</div>
<h2>${esc(sc.id)}. ${esc(sc.title)}</h2><p>${esc(sc.description)}</p>
<div class="final">Livello finale: ${lv(L)} — ${ACT[L]}</div>
<div class="grid"><div class="obs"><span class="tag">Cosa è stato misurato</span><ul>${ch.map(c=>`<li>${sentence(c)}</li>`).join("")}</ul></div>
<div class="inf"><span class="tag">Cosa ne deduce Orion</span><p>${ORDER.indexOf(L)>=3?`Cambiamento persistente rispetto ai valori abituali, segnalato dal giorno ${o.first_day.REVIEW}, cioè ${gg(o.delay_review_days)} dopo l'inizio simulato.`:sc.event=="heatwave"?"Le variazioni coincidono con il caldo ambientale: Orion non le considera un problema di salute.":"Nessun cambiamento persistente."}</p>
<p>Prima dell'inizio del cambiamento ci sono ${gg(pre)} "Da osservare": sono normali oscillazioni quotidiane o giorni con contesto particolare (viaggio, alcol, sport intenso). Non richiedono azioni.</p></div></div>
<p><small>Fascia verde = valori abituali della persona; linea tratteggiata = inizio del cambiamento simulato; bande arancio = giorni "Da rivalutare".</small></p><div class="grid2">${charts}</div>
<h3>Basi scientifiche</h3><table><tr><th>Parametro</th><th>Misura consolidata</th><th>Ipotesi in studio (allerta precoce)</th></tr>${ev||"<tr><td colspan=3>Nessun parametro segnalato</td></tr>"}</table></section>`}
function appendix(){const ro=D.real_observation;const rows=Object.entries(ro.features).map(([k,v])=>`<tr><td>${esc(NAME[k]?NAME[k][0]:k)}</td><td>${esc(v)}</td><td>${esc(Object.values(ro.provenance[k]||{}).join(" · "))}</td></tr>`).join("");
 const cx=D.scenarios.map(sc=>`<tr><td>${esc(sc.id)}</td><td>${esc(sc.event)} / ${sc.seed}</td><td>${lv(sc.report.orion.peak_level)}</td><td>${lv(sc.report.cross_check_window_assess.level)}</td><td><small>${esc(sc.report.orion.peak_explanation||"")}</small></td><td><code>${esc(sc.report_sha256.slice(0,16))}…</code></td></tr>`).join("");
 document.getElementById("acq").innerHTML=`<div class="appx"><h2>Appendice tecnica</h2><p>Fonti dati reali aperte (integrità SHA-256 verificata su ${Object.keys(D.integrity).length} file): ${D.sources.map(s=>esc(s.dataset_id+" "+s.name+" ("+s.license+")")).join("; ")}. Le serie di 90 giorni sono generate da <code>orion.simulate</code> e ancorate a questi valori.</p>
<table><tr><th>Parametro</th><th>Valore reale di ancoraggio</th><th>Provenienza</th></tr>${rows}</table>
<h3>Livello finale e secondo controllo</h3><p>Il livello finale è quello di Orion (regole su baseline personale: z robusto, CUSUM, change-point, persistenza multi-parametro). Un secondo controllo indipendente (window assess, confronto finestra di 14 giorni vs riferimento) è più sensibile e serve solo come verifica tecnica: quando è più alto non cambia il livello finale. Fascia verde = mediana ± 2·MAD dei giorni precedenti l'inizio (solo visualizzazione).</p>
<table><tr><th>Scenario</th><th>evento / seed</th><th>Orion</th><th>Secondo controllo</th><th>Spiegazione tecnica Orion</th><th>SHA-256 rapporto</th></tr>${cx}</table>
<p><small>Verifica tecnica, non validazione clinica: vedi docs/VALIDATION_PROTOCOL_PRELIMINARY.md.</small></p></div>`}
window.NS={dashboard(){summary();appendix();const t=document.getElementById("tabs"),s=document.getElementById("scenario");
 D.scenarios.forEach(sc=>{const b=document.createElement("button");b.textContent=`${sc.id}. ${sc.title}`;b.onclick=()=>{[...t.children].forEach(x=>x.classList.remove("on"));b.classList.add("on");s.innerHTML=scenario(sc)};t.appendChild(b)});
 const q=new URLSearchParams(location.search).get("s");t.children[Math.max(0,D.scenarios.findIndex(x=>x.id==q))].click()},
 report(){summary();appendix();document.getElementById("all").innerHTML=D.scenarios.map(scenario).join("")}};})();
