function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {"Content-Type":"application/json"}
  });
}

function clean(value, max = 500) {
  return String(value || "").trim().slice(0, max);
}

export async function onRequestPost({request, env}) {
  try {
    if (!env.INVESTOR_REQUESTS) {
      return json(
        {error:"Archivio richieste non configurato."},
        503
      );
    }

    const body = await request.json();

    if (body.website) {
      return json({ok:true});
    }

    const item = {
      id: crypto.randomUUID(),
      name: clean(body.name, 120),
      email: clean(body.email, 180).toLowerCase(),
      company: clean(body.company, 160),
      role: clean(body.role, 160),
      reason: clean(body.reason, 200),
      details: clean(body.details, 1200),
      status: "pending",
      country: request.cf?.country || "N/D",
      createdAt: new Date().toISOString()
    };

    if (
      !item.name ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.email) ||
      !item.reason
    ) {
      return json(
        {error:"Compila nome, email e motivo."},
        400
      );
    }

    await env.INVESTOR_REQUESTS.put(
      "request:" + item.id,
      JSON.stringify(item)
    );

    return json({
      ok:true,
      id:item.id
    });

  } catch {
    return json(
      {error:"Impossibile inviare la richiesta."},
      500
    );
  }
}
