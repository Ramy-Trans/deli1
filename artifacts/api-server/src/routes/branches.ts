import { Router } from "express";
import { db } from "@workspace/db";
import { branchesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

router.get("/", async (req, res) => {
  try {
    const branches = await db
      .select()
      .from(branchesTable)
      .where(eq(branchesTable.isActive, true));

    res.json(branches);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to fetch branches" });
  }
});

/**
 * GET /api/branches/nearest?userLat=&userLng=
 * Returns the closest active branch to the given coordinates.
 * Mirrors the reference /assign-branch endpoint.
 */
router.get("/nearest", async (req, res) => {
  try {
    const userLat = parseFloat(req.query.userLat as string);
    const userLng = parseFloat(req.query.userLng as string);

    if (isNaN(userLat) || isNaN(userLng)) {
      return res.status(400).json({ error: "userLat and userLng are required" });
    }

    const branches = await db
      .select()
      .from(branchesTable)
      .where(eq(branchesTable.isActive, true));

    if (!branches.length) {
      return res.status(404).json({ error: "No active branches found" });
    }

    let nearest = branches[0];
    let minDist = Infinity;

    for (const branch of branches) {
      if (!branch.latitude || !branch.longitude) continue;
      const d = haversineKm(
        userLat,
        userLng,
        parseFloat(branch.latitude),
        parseFloat(branch.longitude)
      );
      if (d < minDist) {
        minDist = d;
        nearest = branch;
      }
    }

    res.json({ ...nearest, distanceKm: parseFloat(minDist.toFixed(2)) });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Failed to find nearest branch" });
  }
});

export default router;
