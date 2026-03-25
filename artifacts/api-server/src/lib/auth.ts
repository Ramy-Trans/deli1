import type { Request } from "express";

export function getUserIdFromToken(req: Request): number | null {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  try {
    const decoded = JSON.parse(
      Buffer.from(token, "base64url").toString("utf-8")
    );
    if (decoded?.userId) return Number(decoded.userId);
    return null;
  } catch {
    return null;
  }
}
