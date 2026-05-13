import dotenv from "dotenv";
import express from "express";
import pool from "./db.js";
import cors from "cors";
import Adminrouter from "./router/admin.js";
import { creationOfTable } from "./initDb.js";
import client from "prom-client";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
//prometheus
const register = new client.Registry();
client.collectDefaultMetrics({
  register,
});
// 1 . Counter for total requests
const httpRequestsTotal = new client.Counter({
  name: "http_total_requests",
  help: "total number of requests",
  labelNames: ["method", "route", "status_code"],
});
register.registerMetric(httpRequestsTotal);

// 2. Gauge: currently active requests
const activeRequests = new client.Gauge({
  name: "active_requests",
  help: "Number of requests currently being processed",
});
register.registerMetric(activeRequests);

// 3. Histogram: request duration in seconds
const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});
register.registerMetric(httpRequestDuration);

app.use((req, res, next) => {
  res.on("finish", () => {
    httpRequestsTotal.inc({
      method: req.method,
      route: req.path,
      status_code: res.statusCode,
    });
  });

  next();
});

// Middleware 2: track active requests (gauge) and request duration (histogram)
app.use((req, res, next) => {
  // Increase active requests counter
  activeRequests.inc();
  // Start timer for this request
  const endTimer = httpRequestDuration.startTimer();

  res.on("finish", () => {
    // Decrease active requests when response is sent
    activeRequests.dec();
    // Record duration with labels
    endTimer({
      method: req.method,
      route: req.path,
      status_code: res.statusCode,
    });
  });
  next();
});
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);

  res.end(await register.metrics());
});

app.get("/", (req, res) => {
  return res.json({ message: "Hello, World!" });
});

app.use("/api/admin", Adminrouter);

app.listen(process.env.PORT, async () => {
  try {
    await pool.query("SELECT 1");
    await creationOfTable();
    console.log(
      `Db is connected and server is running http://localhost:${process.env.PORT}`,
    );
  } catch (error) {
    console.log("error occured:", error);
    process.exit(1);
  }
});
