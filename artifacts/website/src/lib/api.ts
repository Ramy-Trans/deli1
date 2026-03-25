export const API_BASE = "";

export async function apiFetch(path: string, options?: RequestInit) {
  const token = localStorage.getItem("user_token");
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? err.message ?? "Request failed");
  }
  return res.json();
}
