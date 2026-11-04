(function(){const D=window.DEMO_DATA,ORDER=["NONE","INFO","WATCH","REVIEW","URGENT"];
const qs=new URLSearchParams(location.search);let LANG=qs.get("lang")||localStorage.getItem("ns_lang")||"it";if(!["it","en"].includes(LANG))LANG="it";
const T={it:{
lv:{NONE:"Nessuna variazione",INFO:"Nota",WATCH:"Da osservare",REVIEW:"Da rivalutare",URGENT:"Urgente"},
act:{NONE:"Nessuna azione: monitoraggio ordinario.",INFO:"Nessuna azione: monitoraggio ordinario.",WATCH:"Continuare il monitoraggio; nessuna azione immediata.",REVIEW:"Valutazione clinica consigliata nei prossimi giorni.",URGENT:"Valutazione clinica tempestiva consigliata."},
name:{resting_hr:["frequenza cardiaca a riposo","battiti/min"],rmssd:["variabilità cardiaca (HRV)","ms"],resp_rate:["frequenza respiratoria","atti/min"],skin_temp:["temperatura cutanea","°C"],eda_tonic:["sudorazione cutanea (EDA)","µS"],spo2:["saturazione di ossigeno","%"],sleep_tst:["durata del sonno","minuti"],sleep_eff:["efficienza del sonno","%"],activity:["attività fisica","indice"]},
scen:{step:["Cambiamento improvviso di più parametri","Dal giorno di inizio cambiano insieme frequenza cardiaca, variabilità cardiaca, respiro e temperatura cutanea."],drift:["Peggioramento lento","In 4 settimane la frequenza cardiaca sale gradualmente e la variabilità cardiaca scende."],heatwave:["Ondata di calore (falso allarme evitato)","La temperatura dell'ambiente sale di 8 °C per 7 giorni; la persona sta bene. Orion non deve segnalare un problema."],sleep_step:["Peggioramento del sonno","La persona dorme circa 75 minuti in meno e il sonno è meno efficiente."]},
day:n=>n==1?"1 giorno":n+" giorni",up:"aumentata",down:"diminuita",by:"di",from:"da",to:"a",
sentence:(n,dir,d,u,a,b)=>`${n} ${dir} di ${d} ${u} (da ${a} a ${b} ${u})`,
heat:"Solo la temperatura dell'ambiente è aumentata (ondata di calore). Orion l'ha riconosciuta come causa esterna e non ha segnalato un problema di salute.",
none:"Nessun cambiamento persistente rispetto ai valori abituali.",
since:(r,o,d)=>`dal giorno ${r} (cambiamento simulato iniziato il giorno ${o}; segnalato dopo ${d})`,
sumH:"Sintesi clinica",sumP:"<b>Attenzione: persone e dati sono simulati al computer (DATI SIMULATI — NON CLINICI).</b> I valori di partenza vengono da registrazioni reali pubbliche. Prototipo sperimentale: il documento non è una diagnosi e non sostituisce la valutazione del personale sanitario.",
cols:["Persona simulata","Cosa è cambiato (media delle 2 settimane dopo il cambiamento, rispetto al valore abituale)","Da quando","Livello e azione suggerita"],
legend:"Livelli: Nota · Da osservare · Da rivalutare · Urgente. Il livello mostrato è quello finale di Orion. La decisione spetta sempre al personale.",
person:"Persona simulata",final:"Livello finale",meas:"Cosa è stato misurato",inf:"Cosa ne deduce Orion (interpretazione sperimentale)",
infR:(r,d)=>`Cambiamento persistente rispetto ai valori abituali, segnalato dal giorno ${r}, cioè ${d} dopo l'inizio simulato.`,
infH:"Le variazioni coincidono con il caldo ambientale: Orion non le considera un problema di salute.",infN:"Nessun cambiamento persistente.",
pre:d=>`Prima dell'inizio del cambiamento ci sono ${d} "Da osservare": sono normali oscillazioni quotidiane o giorni con contesto particolare (viaggio, alcol, sport intenso). Non richiedono azioni.`,
chartL:'Fascia verde = valori abituali della persona (baseline personale); linea tratteggiata = inizio del cambiamento simulato; bande arancio = giorni "Da rivalutare".',
start:d=>`inizio cambiamento (giorno ${d})`,dayN:d=>`giorno ${d}`,
evH:"Basi scientifiche",evC:["Parametro","Misura consolidata","Ipotesi in studio (allerta precoce)"],evN:"Nessun parametro segnalato",
apH:"Appendice tecnica",apSrc:(n,s)=>`Fonti dati reali aperte (integrità SHA-256 verificata su ${n} file): ${s}. Le serie di 90 giorni sono generate da <code>orion.simulate</code> e ancorate a questi valori; il motore Orion reale le elabora giorno per giorno.`,
apC:["Parametro","Valore reale di ancoraggio","Provenienza"],apL:"Livello finale e secondo controllo",
apLP:"Il livello finale è quello di Orion (regole su baseline personale: z robusto, CUSUM, change-point, persistenza multi-parametro). Un secondo controllo indipendente (window assess, finestra di 14 giorni vs riferimento) è più sensibile e serve solo come verifica tecnica: quando è più alto non cambia il livello finale. Fascia verde = mediana ± 2·MAD dei giorni precedenti l'inizio (solo visualizzazione); attività, EDA e sonno sono limitati a valori ≥ 0 e SpO2 ≤ 100% solo nella visualizzazione.",
apX:["Scenario","evento / seed","Orion","Secondo controllo","Spiegazione tecnica Orion","SHA-256 rapporto"],apF:"Verifica tecnica, non validazione clinica: vedi docs/VALIDATION_PROTOCOL_PRELIMINARY.md."},
en:{
lv:{NONE:"No change",INFO:"Note",WATCH:"Watch",REVIEW:"Review",URGENT:"Urgent"},
act:{NONE:"No action: routine monitoring.",INFO:"No action: routine monitoring.",WATCH:"Keep monitoring; no immediate action.",REVIEW:"Clinical assessment recommended in the next days.",URGENT:"Prompt clinical assessment recommended."},
name:{resting_hr:["resting heart rate","bpm"],rmssd:["heart rate variability (HRV)","ms"],resp_rate:["respiratory rate","breaths/min"],skin_temp:["skin temperature","°C"],eda_tonic:["skin conductance (EDA)","µS"],spo2:["oxygen saturation","%"],sleep_tst:["sleep duration","minutes"],sleep_eff:["sleep efficiency","%"],activity:["physical activity","index"]},
scen:{step:["Sudden multi-parameter change","From the start day heart rate, HRV, breathing and skin temperature change together."],drift:["Slow deterioration","Over 4 weeks heart rate rises gradually and HRV falls."],heatwave:["Heatwave (false alarm avoided)","Ambient temperature rises by 8 °C for 7 days; the person is well. Orion should not flag a health problem."],sleep_step:["Sleep deterioration","The person sleeps about 75 minutes less and sleep is less efficient."]},
day:n=>n==1?"1 day":n+" days",up:"increased",down:"decreased",
sentence:(n,dir,d,u,a,b)=>`${n} ${dir} by ${d} ${u} (from ${a} to ${b} ${u})`,
heat:"Only ambient temperature rose (heatwave). Orion recognised it as an external cause and did not flag a health problem.",
none:"No persistent change from usual values.",
since:(r,o,d)=>`from day ${r} (simulated change started day ${o}; flagged after ${d})`,
sumH:"Clinical summary",sumP:"<b>Warning: people and data are computer-simulated (SIMULATED DATA — NOT CLINICAL).</b> Starting values come from real public recordings. Experimental prototype: this is not a diagnosis and does not replace assessment by healthcare staff.",
cols:["Simulated person","What changed (2-week mean after the change vs usual value)","Since","Level and suggested action"],
legend:"Levels: Note · Watch · Review · Urgent. The level shown is Orion's final level. Staff always decide.",
person:"Simulated person",final:"Final level",meas:"What was measured",inf:"What Orion infers (experimental interpretation)",
infR:(r,d)=>`Persistent change from usual values, flagged from day ${r}, i.e. ${d} after the simulated start.`,
infH:"Changes coincide with ambient heat: Orion does not treat them as a health problem.",infN:"No persistent change.",
pre:d=>`Before the change starts there are ${d} of "Watch": normal day-to-day fluctuation or days with special context (travel, alcohol, intense exercise). No action needed.`,
chartL:'Green band = the person\'s usual values (personal baseline); dashed line = start of simulated change; orange bands = "Review" days.',
start:d=>`change starts (day ${d})`,dayN:d=>`day ${d}`,
evH:"Scientific basis",evC:["Parameter","Established measurement","Research hypothesis (early warning)"],evN:"No parameter flagged",
apH:"Technical appendix",apSrc:(n,s)=>`Open real data sources (SHA-256 integrity verified on ${n} files): ${s}. The 90-day series are generated by <code>orion.simulate</code> anchored on these values; the real Orion engine processes them day by day.`,
apC:["Parameter","Real anchor value","Provenance"],apL:"Final level and second check",
apLP:"The final level is Orion's (personal-baseline rules: robust z, CUSUM, change-point, multi-parameter persistence). An independent second check (window assess, 14-day window vs reference) is more sensitive and is a technical cross-check only: when higher it does not change the final level. Green band = median ± 2·MAD of pre-change days (display only); activity, EDA and sleep clamped ≥ 0 and SpO2 ≤ 100% for display only.",
apX:["Scenario","event / seed","Orion","Second check","Orion technical explanation","Report SHA-256"],apF:"Technical verification, not clinical validation: see docs/VALIDATION_PROTOCOL_PRELIMINARY.md."}};
const L=T[LANG],DEC={resting_hr:0,rmssd:0,resp_rate:1,skin_temp:1,eda_tonic:2,spo2:1,sleep_tst:0,sleep_eff:0,activity:2};
const MAIN={step:["resting_hr","rmssd","resp_rate","skin_temp"],drift:["resting_hr","rmssd"],heatwave:["skin_temp","resting_hr"],sleep_step:["sleep_tst","sleep_eff"]};
const esc=s=>String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const lv=l=>`<span class="lv ${l}">${L.lv[l]}</span>`,num=(x,d)=>LANG=="it"?x.toFixed(d).replace(".",","):x.toFixed(d);
const scale=(f,v)=>v==null?null:(f=="sleep_eff"?v*100:v),fmt=(f,v)=>num(scale(f,v),DEC[f]),nm=f=>(L.name[f]||[f,""]);
const title=sc=>L.scen[sc.event][0],desc=sc=>L.scen[sc.event][1];
function link(r){let o=[];if(r.doi)o.push(`<a href="https://doi.org/${esc(r.doi)}" target="_blank" rel="noopener noreferrer">DOI</a>`);if(r.pmid)o.push(`<a href="https://pubmed.ncbi.nlm.nih.gov/${esc(r.pmid)}/" target="_blank" rel="noopener noreferrer">PubMed</a>`);return `${esc(r.id)} ${o.join(" · ")}`}
function changes(sc){const r0=sc.report.orion.first_day.REVIEW,on=r0!=null&&sc.event=="drift"?r0:sc.onset,end=Math.min(sc.days.length,on+14),out=[];
 for(const f of MAIN[sc.event]){const F=sc.features[f],b=F.band_display[1],v=F.values.slice(on,end).filter(x=>x!=null),m=v.reduce((a,x)=>a+x,0)/v.length,delta=m-b,half=(F.band_display[2]-F.band_display[0])/2;out.push({f,base:b,now:m,delta,sig:Math.abs(delta)>half*0.75})}return out}
const finalLevel=sc=>sc.report.orion.peak_level;
function sentence(c){const[n,u]=nm(c.f);return L.sentence(n,c.delta>0?L.up:L.down,num(Math.abs(scale(c.f,c.delta)),DEC[c.f]),u,fmt(c.f,c.base),fmt(c.f,c.now))}
function summaryRow(sc){const o=sc.report.orion,lvl=finalLevel(sc),ch=changes(sc).filter(c=>c.sig);
 const what=ORDER.indexOf(lvl)>=3&&ch.length?ch.map(sentence).join("; "):sc.event=="heatwave"?L.heat:L.none;
 const since=o.first_day.REVIEW!=null?L.since(o.first_day.REVIEW,sc.onset,L.day(o.delay_review_days)):"—";
 return `<tr><td><b>${esc(sc.id)}. ${esc(title(sc))}</b></td><td>${what}</td><td>${since}</td><td>${lv(lvl)}<br>${L.act[lvl]}</td></tr>`}
function summary(){document.getElementById("summary").innerHTML=`<h2>${L.sumH}</h2><p>${L.sumP}</p><table class="sum"><tr>${L.cols.map(c=>`<th>${c}</th>`).join("")}</tr>${D.scenarios.map(summaryRow).join("")}</table><p><small>${L.legend}</small></p>`}
function chart(f,F,sc){const W=560,H=190,p=44,v=F.values.map(x=>scale(f,x)),n=v.length,ok=v.filter(x=>x!=null),[lo,md,hi]=F.band_display.map(x=>scale(f,x));
 let mn=Math.min(lo,...ok),mx=Math.max(hi,...ok);const pad=(mx-mn)*.08||1;mn-=pad;mx+=pad;if(f=="spo2")mx=Math.min(100,mx);const X=i=>p+i*(W-p-8)/(n-1),Y=y=>H-24-(y-mn)*(H-40)/(mx-mn);
 let path="";v.forEach((y,i)=>{if(y==null)return;path+=(path&&v[i-1]!=null?"L":"M")+X(i).toFixed(1)+","+Y(y).toFixed(1)});
 let marks="";sc.days.forEach((d,i)=>{if(ORDER.indexOf(d.level)>=3)marks+=`<rect x="${X(i)-2}" y="10" width="4" height="${H-34}" fill="#e8590c" opacity=".25"/>`});
 const t=x=>num(x,DEC[f]);
 return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="${esc(nm(f)[0])}"><rect x="${p}" y="${Y(hi)}" width="${W-p-8}" height="${Y(lo)-Y(hi)}" fill="#2b8a3e" opacity=".13"/><line x1="${p}" x2="${W-8}" y1="${Y(md)}" y2="${Y(md)}" stroke="#2b8a3e" stroke-dasharray="4"/>${marks}
<line x1="${X(sc.onset)}" x2="${X(sc.onset)}" y1="8" y2="${H-24}" stroke="#333" stroke-dasharray="2 3"/><text x="${X(sc.onset)+4}" y="18" font-size="12">${L.start(sc.onset)}</text>
<path d="${path}" fill="none" stroke="#1f4e79" stroke-width="2"/><text x="2" y="${Y(hi)+4}" font-size="11">${t(hi)}</text><text x="2" y="${Y(lo)+4}" font-size="11">${t(lo)}</text><text x="${p}" y="${H-6}" font-size="11">${L.dayN(0)}</text><text x="${W-70}" y="${H-6}" font-size="11">${L.dayN(n-1)}</text></svg>`}
function scenario(sc){const r=sc.report,o=r.orion,lvl=finalLevel(sc),ch=changes(sc);
 const charts=MAIN[sc.event].map(f=>`<div><b class="big">${esc(nm(f)[0])}</b> <small>(${esc(nm(f)[1])})</small>${chart(f,sc.features[f],sc)}</div>`).join("");
 const pre=sc.days.slice(0,sc.onset).filter(d=>d.level=="WATCH").length;
 const ev=Object.entries(r.evidence).map(([f,e])=>`<tr><td>${esc(nm(f)[0])}</td><td>${e.consolidated_measurement.map(link).join("<br>")||"—"}</td><td>${e.experimental_early_warning_hypothesis.map(link).join("<br>")||"—"}</td></tr>`).join("");
 const inf=ORDER.indexOf(lvl)>=3?L.infR(o.first_day.REVIEW,L.day(o.delay_review_days)):sc.event=="heatwave"?L.infH:L.infN;
 return `<section class="card scen"><div class="sim" style="position:static;border-radius:6px">DATI SIMULATI — NON CLINICI${LANG=="en"?" · SIMULATED DATA — NOT CLINICAL":""} · ${L.person} ${esc(sc.id)}</div>
<h2>${esc(sc.id)}. ${esc(title(sc))}</h2><p>${esc(desc(sc))}</p><div class="final">${L.final}: ${lv(lvl)} — ${L.act[lvl]}</div>
<div class="grid"><div class="obs"><span class="tag">${L.meas}</span><ul>${ch.map(c=>`<li>${sentence(c)}</li>`).join("")}</ul></div>
<div class="inf"><span class="tag">${L.inf}</span><p>${inf}</p><p>${L.pre(L.day(pre))}</p></div></div>
<p><small>${L.chartL}</small></p><div class="grid2">${charts}</div>
<h3>${L.evH}</h3><table><tr>${L.evC.map(c=>`<th>${c}</th>`).join("")}</tr>${ev||`<tr><td colspan=3>${L.evN}</td></tr>`}</table></section>`}
function appendix(){const ro=D.real_observation;const rows=Object.entries(ro.features).map(([k,v])=>`<tr><td>${esc(nm(k)[0])}</td><td>${esc(v)}</td><td>${esc(Object.values(ro.provenance[k]||{}).join(" · "))}</td></tr>`).join("");
 const cx=D.scenarios.map(sc=>`<tr><td>${esc(sc.id)}</td><td>${esc(sc.event)} / ${sc.seed}</td><td>${lv(sc.report.orion.peak_level)}</td><td>${lv(sc.report.cross_check_window_assess.level)}</td><td><small>${esc(sc.report.orion.peak_explanation||"")}</small></td><td><code>${esc(sc.report_sha256.slice(0,16))}…</code></td></tr>`).join("");
 document.getElementById("acq").innerHTML=`<div class="appx"><h2>${L.apH}</h2><p>${L.apSrc(Object.keys(D.integrity).length,D.sources.map(s=>esc(s.dataset_id+" "+s.name+" ("+s.license+")")).join("; "))}</p>
<table><tr>${L.apC.map(c=>`<th>${c}</th>`).join("")}</tr>${rows}</table><h3>${L.apL}</h3><p>${L.apLP}</p>
<table><tr>${L.apX.map(c=>`<th>${c}</th>`).join("")}</tr>${cx}</table><p><small>${L.apF}</small></p></div>`}
function chrome(){document.documentElement.lang=LANG;document.querySelectorAll("[data-it]").forEach(e=>{e.innerHTML=e.dataset[LANG]||e.dataset.it});
 document.querySelectorAll(".langsw button").forEach(b=>{b.classList.toggle("on",b.dataset.l==LANG);b.onclick=()=>{localStorage.setItem("ns_lang",b.dataset.l);qs.set("lang",b.dataset.l);location.search=qs.toString()}})}
window.NS={dashboard(){chrome();summary();appendix();const t=document.getElementById("tabs"),s=document.getElementById("scenario");
 D.scenarios.forEach(sc=>{const b=document.createElement("button");b.textContent=`${sc.id}. ${title(sc)}`;b.onclick=()=>{[...t.children].forEach(x=>x.classList.remove("on"));b.classList.add("on");s.innerHTML=scenario(sc)};t.appendChild(b)});
 const q=qs.get("s");t.children[Math.max(0,D.scenarios.findIndex(x=>x.id==q))].click()},
 report(){chrome();summary();appendix();document.getElementById("all").innerHTML=D.scenarios.map(scenario).join("")}};})();
