// Cloudflare Worker template for estensioni operative. Altri ambiti restano possibili estensioni dello stesso motore osservativo, non promesse di prodotto già concluso. Beta
// Secrets needed: GROQ_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY (optional later), TURNSTILE_SECRET (optional later)
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors() });
    if (url.pathname === '/api/adaptron-event' && request.method === 'POST') {
      const event = await request.json().catch(() => ({}));
      // TODO: send to Supabase table adaptron_events
      return json({ ok: true, stored: false, note: 'Supabase not connected yet', event_type: event.type || null });
    }
    if (url.pathname === '/api/adaptron-chat' && request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      if (!env.GROQ_API_KEY) return json({ error: 'GROQ_API_KEY missing' }, 500);
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: 'Sei estensioni operative. Altri ambiti restano possibili estensioni dello stesso motore osservativo, non promesse di prodotto già concluso.: AI guidata, educativa, sicura. Non fornire istruzioni illegali, pericolose o dannose. Guida passo passo, adatta livello e fai una domanda breve alla fine.' },
            { role: 'user', content: String(body.prompt || '') }
          ],
          temperature: 0.5
        })
      });
      const data = await r.json();
      return json(data, r.status);
    }
    return new Response('Not found', { status: 404, headers: cors() });
  }
}
function cors(){ return { 'Access-Control-Allow-Origin':'https://neurosuite.dev', 'Access-Control-Allow-Methods':'POST,OPTIONS', 'Access-Control-Allow-Headers':'Content-Type' }; }
function json(obj, status=200){ return new Response(JSON.stringify(obj), { status, headers: { ...cors(), 'Content-Type':'application/json' } }); }

