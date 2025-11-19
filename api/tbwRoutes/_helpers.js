export async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("HTTP " + res.status);
  return await res.json();
}

export function send(res, data) {
  res.status(200).json({ ok: true, data });
}

export function error(res, msg, code = 500) {
  res.status(code).json({ ok: false, error: msg });
}
