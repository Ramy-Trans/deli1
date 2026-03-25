import { Router } from "express";
import { logger } from "../lib/logger.js";

const router = Router();

const ORS_URL =
  "https://api.openrouteservice.org/v2/directions/driving-car/geojson";

const OSRM_URL = "https://router.project-osrm.org/route/v1/driving";

async function fetchRouteFromORS(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
  apiKey: string
): Promise<{ coordinates: [number, number][]; distance: number; duration: number } | null> {
  try {
    const res = await fetch(ORS_URL, {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
        Accept: "application/json, application/geo+json",
      },
      body: JSON.stringify({
        coordinates: [
          [fromLng, fromLat],
          [toLng, toLat],
        ],
      }),
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) {
      logger.warn({ status: res.status }, "ORS API non-OK, falling back to OSRM");
      return null;
    }

    const data = await res.json();
    const feature = data.features?.[0];
    if (!feature) return null;

    const rawCoords: [number, number][] = feature.geometry?.coordinates ?? [];
    const coordinates: [number, number][] = rawCoords.map(
      ([lng, lat]) => [lat, lng] as [number, number]
    );
    const distance: number = feature.properties?.summary?.distance ?? 0;
    const duration: number = feature.properties?.summary?.duration ?? 0;

    return { coordinates, distance, duration };
  } catch {
    return null;
  }
}

async function fetchRouteFromOSRM(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): Promise<{ coordinates: [number, number][]; distance: number; duration: number } | null> {
  try {
    const url = `${OSRM_URL}/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });

    if (!res.ok) return null;

    const data = await res.json();
    const route = data.routes?.[0];
    if (!route) return null;

    const rawCoords: [number, number][] =
      route.geometry?.coordinates ?? [];
    const coordinates: [number, number][] = rawCoords.map(
      ([lng, lat]) => [lat, lng] as [number, number]
    );
    const distance: number = route.distance ?? 0;
    const duration: number = route.duration ?? 0;

    return { coordinates, distance, duration };
  } catch {
    return null;
  }
}

router.get("/", async (req, res) => {
  const { fromLat, fromLng, toLat, toLng } = req.query as Record<string, string>;

  if (!fromLat || !fromLng || !toLat || !toLng) {
    return res
      .status(400)
      .json({ error: "fromLat, fromLng, toLat, toLng are required" });
  }

  const fLat = parseFloat(fromLat);
  const fLng = parseFloat(fromLng);
  const tLat = parseFloat(toLat);
  const tLng = parseFloat(toLng);

  const apiKey = process.env.ORS_API_KEY;
  let result = null;

  if (apiKey) {
    result = await fetchRouteFromORS(fLat, fLng, tLat, tLng, apiKey);
  }

  if (!result) {
    logger.info("Falling back to OSRM for route calculation");
    result = await fetchRouteFromOSRM(fLat, fLng, tLat, tLng);
  }

  if (!result) {
    return res.status(502).json({ error: "No route found from any provider" });
  }

  res.json(result);
});

export default router;
