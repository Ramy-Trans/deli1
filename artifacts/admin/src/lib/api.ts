export function getToken() {
  return localStorage.getItem("admin_token") ?? "";
}

export async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...(options?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? "Request failed");
  }
  return res.json();
}

export function getRiderToken() {
  return localStorage.getItem("rider_token") ?? "";
}

export function setRiderToken(token: string, riderData: any) {
  localStorage.setItem("rider_token", token);
  localStorage.setItem("rider_data", JSON.stringify(riderData));
}

export function getRiderData() {
  try { return JSON.parse(localStorage.getItem("rider_data") ?? "null"); } catch { return null; }
}

export function logoutRider() {
  localStorage.removeItem("rider_token");
  localStorage.removeItem("rider_data");
}

export async function riderFetch(path: string, options?: RequestInit) {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getRiderToken()}`,
      ...(options?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? "Request failed");
  }
  return res.json();
}

export function getRiderDashboardUrl() {
  return `${window.location.origin}/rider`;
}
