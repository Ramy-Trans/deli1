export const API_BASE: string = (import.meta.env.VITE_API_URL as string) ?? "";

export async function apiFetch(path: string, options?: RequestInit) {
  const token = localStorage.getItem("user_token");
  const res = await fetch(`${API_BASE}${path}`, {
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
