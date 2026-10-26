import seed from "./seed.json";

export async function getContent() {
  try {
    const r = await fetch("/api/content", { cache: "no-store" });
    if (!r.ok) throw new Error();
    const j = await r.json();
    return Array.isArray(j.projects) && Array.isArray(j.experience) ? j : seed;
  } catch {
    return seed; // local dev or API unavailable
  }
}

async function post(body, pw) {
  const r = await fetch("/api/content", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-password": pw },
    body: JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || "Request failed");
  return j;
}
export const verify = (pw) => post({ verify: true }, pw);
export const saveContent = (data, pw) => post(data, pw);
