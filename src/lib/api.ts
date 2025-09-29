// src/lib/api.ts
// API base URL - empty for Supabase edge functions
export const API = "";

export async function getJSON<T = any>(path: string) {
  const r = await fetch(`${API}${path}`, { cache: "no-store" });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<T>;
}

export async function postJSON<T = any>(path: string, body?: any) {
  const r = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<T>;
}

// Helpers
export const fmtCLP = (n: number) =>
  new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

export const getTel = () =>
  (typeof window !== "undefined" && localStorage.getItem("telefono")) || "";

export const setTel = (raw: string) => {
  const digits = raw.trim().replace(/\D/g, "");
  const tel = digits.startsWith("56") ? digits : "56" + digits;
  localStorage.setItem("telefono", tel);
  return tel;
};
