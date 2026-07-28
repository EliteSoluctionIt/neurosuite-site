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

function generatePassword() {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZ" +
    "abcdefghijkmnopqrstuvwxyz" +
    "23456789!@#$";

  const bytes =
    crypto.getRandomValues(new Uint8Array(14));

  return Array.from(
    bytes,
    byte => chars[byte % chars.length]
  ).join("");
}

export async function onRequestPost({
  request,
  env,
  params
}) {
  if (!allowed(request, env)) {
    return json({error:"Accesso negato."}, 401);
  }

  if (!env.INVESTOR_REQUESTS) {
    return json({error:"Archivio KV non configurato."}, 503);
  }

  const key = "request:" + params.id;

  const item =
    await env.INVESTOR_REQUESTS.get(key, "json");

  if (!item) {
    return json({error:"Richiesta non trovata."}, 404);
  }

  const body = await request.json();
  const action = body.action;
  const note = String(body.note || "").slice(0, 500);

  if (!["approve", "reject"].includes(action)) {
    return json({error:"Azione non valida."}, 400);
  }

  if (action === "approve") {
    const password = generatePassword();

    item.status = "approved";
    item.generatedPassword = password;
    item.note = note;
    item.reviewedAt = new Date().toISOString();

    await env.INVESTOR_REQUESTS.put(
      key,
      JSON.stringify(item)
    );

    await env.INVESTOR_REQUESTS.put(
      "credential:" + item.email,
      JSON.stringify({
        password,
        requestId:item.id,
        active:true,
        createdAt:new Date().toISOString()
      })
    );

    return json({
      ok:true,
      password
    });
  }

  item.status = "rejected";
  item.note = note;
  item.reviewedAt = new Date().toISOString();

  await env.INVESTOR_REQUESTS.put(
    key,
    JSON.stringify(item)
  );

  return json({ok:true});
}
