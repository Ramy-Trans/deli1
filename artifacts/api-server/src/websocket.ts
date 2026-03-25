import { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import { db } from "@workspace/db";
import {
  ordersTable,
  ridersTable,
  orderStatusHistoryTable,
} from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "./lib/logger.js";

export interface DriverLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
  heading?: number;
  speed?: number;
}

export interface RiderUpdate {
  riderId: number;
  orderId: number;
  location: DriverLocation;
}

const orderRooms = new Map<number, DriverLocation>();

let io: SocketServer | null = null;

const ORS_URL =
  "https://api.openrouteservice.org/v2/directions/driving-car/geojson";
const OSRM_URL = "https://router.project-osrm.org/route/v1/driving";

async function getDurationSeconds(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): Promise<number | null> {
  const apiKey = process.env.ORS_API_KEY;

  if (apiKey) {
    try {
      const res = await fetch(ORS_URL, {
        method: "POST",
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
          Accept: "application/json, application/geo+json",
        },
        body: JSON.stringify({
          coordinates: [[fromLng, fromLat], [toLng, toLat]],
        }),
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const data = await res.json();
        const dur = data.features?.[0]?.properties?.summary?.duration;
        if (dur) return dur;
      }
    } catch {}
  }

  try {
    const url = `${OSRM_URL}/${fromLng},${fromLat};${toLng},${toLat}?overview=false`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const data = await res.json();
      const dur = data.routes?.[0]?.duration;
      if (dur) return dur;
    }
  } catch {}

  return null;
}

async function calculateETAFromORS(
  location: DriverLocation,
  orderId: number
): Promise<number> {
  try {
    const [order] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, orderId))
      .limit(1);

    if (!order?.deliveryLatitude || !order?.deliveryLongitude) {
      return fallbackETA(location, null, null);
    }

    const customerLat = parseFloat(order.deliveryLatitude);
    const customerLng = parseFloat(order.deliveryLongitude);

    const duration = await getDurationSeconds(
      location.latitude,
      location.longitude,
      customerLat,
      customerLng
    );

    if (duration !== null) return Math.max(1, Math.ceil(duration / 60));
    return fallbackETA(location, customerLat, customerLng);
  } catch {
    return 10;
  }
}

function fallbackETA(
  location: DriverLocation,
  customerLat: number | null,
  customerLng: number | null
): number {
  if (customerLat === null || customerLng === null) return 10;
  const dist = getDistanceKm(
    location.latitude,
    location.longitude,
    customerLat,
    customerLng
  );
  return Math.max(1, Math.ceil((dist / 30) * 60));
}

export function initWebSocket(server: HttpServer): SocketServer {
  io = new SocketServer(server, {
    path: "/api/socket.io",
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    logger.info({ socketId: socket.id }, "Client connected");

    socket.on("join-order", (orderId: number) => {
      const room = `order:${orderId}`;
      socket.join(room);
      logger.info({ socketId: socket.id, orderId }, "Client joined order room");

      const lastLocation = orderRooms.get(orderId);
      if (lastLocation) {
        socket.emit("driver-location", lastLocation);
      }
    });

    socket.on("leave-order", (orderId: number) => {
      socket.leave(`order:${orderId}`);
    });

    socket.on("rider-location-update", async (data: RiderUpdate) => {
      const { riderId, orderId, location } = data;

      orderRooms.set(orderId, location);

      try {
        await db
          .update(ridersTable)
          .set({
            currentLatitude: location.latitude.toString(),
            currentLongitude: location.longitude.toString(),
          })
          .where(eq(ridersTable.id, riderId));
      } catch (err) {
        logger.error(err, "Failed to update rider location");
      }

      io?.to(`order:${orderId}`).emit("driver-location", location);

      calculateETAFromORS(location, orderId)
        .then((eta) => {
          io?.to(`order:${orderId}`).emit("eta-update", { eta, orderId });
        })
        .catch(() => {});

      await checkProximity(orderId, location);
    });

    socket.on("disconnect", () => {
      logger.info({ socketId: socket.id }, "Client disconnected");
    });
  });

  logger.info("WebSocket server initialized");
  return io;
}

export function emitOrderStatusUpdate(
  orderId: number,
  status: string,
  extra?: Record<string, unknown>
) {
  if (!io) return;
  io.to(`order:${orderId}`).emit("order-status", { orderId, status, ...extra });
}

export function emitDriverAssigned(
  orderId: number,
  riderInfo: Record<string, unknown>
) {
  if (!io) return;
  io.to(`order:${orderId}`).emit("driver-assigned", { orderId, ...riderInfo });
}

export function emitRiderLocation(orderId: number, location: DriverLocation) {
  if (!io) return;
  orderRooms.set(orderId, location);
  io.to(`order:${orderId}`).emit("driver-location", location);

  calculateETAFromORS(location, orderId)
    .then((eta) => {
      io?.to(`order:${orderId}`).emit("eta-update", { eta, orderId });
    })
    .catch(() => {});

  checkProximity(orderId, location);
}

export function emitChatMessage(
  orderId: number,
  message: Record<string, unknown>
) {
  if (!io) return;
  io.to(`order:${orderId}`).emit("chat-message", message);
}

async function checkProximity(orderId: number, location: DriverLocation) {
  try {
    const [order] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, orderId))
      .limit(1);

    if (!order || !order.deliveryLatitude || !order.deliveryLongitude) return;

    const customerLat = parseFloat(order.deliveryLatitude);
    const customerLng = parseFloat(order.deliveryLongitude);

    const distanceKm = getDistanceKm(
      location.latitude,
      location.longitude,
      customerLat,
      customerLng
    );

    if (distanceKm <= 0.3 && order.status === "on_the_way") {
      await db
        .update(ordersTable)
        .set({ status: "near_customer" })
        .where(eq(ordersTable.id, orderId));

      await db.insert(orderStatusHistoryTable).values({
        orderId,
        status: "near_customer",
        note: "Driver is near your location",
      });

      emitOrderStatusUpdate(orderId, "near_customer", {
        message: "Your rider is almost there!",
      });
    }
  } catch (err) {
    logger.error(err, "Proximity check failed");
  }
}

function getDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
