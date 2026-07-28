function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {"Content-Type":"application/json"}
  });
}

function allowed(request, env) {
  const authorization =
    request.headers.get("Authorization") || "";

  return (
    env.CONTROL_CENTER_ADMIN_TOKEN &&
    authorization ===
      "Bearer " + env.CONTROL_CENTER_ADMIN_TOKEN
  );
}

export async function onRequestGet({request, env}) {
  if (!allowed(request, env)) {
    return json({error:"Accesso negato."}, 401);
  }

  if (!env.INVESTOR_REQUESTS) {
    return json({error:"Archivio KV non configurato."}, 503);
  }

  const list =
    await env.INVESTOR_REQUESTS.list({
      prefix:"request:"
    });

  const requests = [];

  for (const key of list.keys) {
    const value =
      await env.INVESTOR_REQUESTS.get(
        key.name,
        "json"
      );

    if (value) {
      requests.push(value);
    }
  }

  requests.sort((a, b) =>
    String(b.createdAt)
      .localeCompare(String(a.createdAt))
  );

  return json({requests});
}
