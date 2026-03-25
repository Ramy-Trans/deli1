import { createServer } from "http";
import app from "./app.js";
import { initWebSocket } from "./websocket.js";
import { logger } from "./lib/logger.js";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const httpServer = createServer(app);
initWebSocket(httpServer);

httpServer.listen(port, () => {
  logger.info({ port }, "Server listening");
});
