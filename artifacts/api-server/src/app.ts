import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes";
import { logger } from "./lib/logger";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/healthz", (_req, res) => res.json({ status: "ok" }));

app.use("/api", router);

const publicDir = path.resolve(__dirname, "../public");
app.use("/api", express.static(publicDir));
app.use(express.static(publicDir));

app.get("/rider", (_req, res) => {
  res.sendFile(path.join(publicDir, "rider.html"));
});

export default app;
