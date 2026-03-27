import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
// Backend only serves API; no frontend static assets are served here.

import { env } from "./config/env.js";
import { connectDb } from "./config/db.js";
import routes from "./routes/index.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const app = express();

app.set("trust proxy", 1);

// Middlewares
app.use(helmet());
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

// ✅ Health check (Render uses this)
app.get("/healthz", (req, res) => res.status(200).json({ ok: true }));

// ✅ API routes only (no frontend serving)
app.use(routes);

// -----------------------------

// Error handlers (keep at end)
app.use(notFound);
app.use(errorHandler);

// -----------------------------
// 🚀 START SERVER (FINAL FIX)
// -----------------------------

async function start() {
  await connectDb();

  const PORT = Number(process.env.PORT ?? env.PORT ?? 5000);

  app.listen(PORT, "0.0.0.0", () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error("❌ Server failed to start:", err);
  process.exit(1);
});