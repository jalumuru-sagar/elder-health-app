import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import { env } from "./config/env.js";
import { connectDb } from "./config/db.js";
import routes from "./routes/index.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const app = express();

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

// ✅ Health check
app.get("/healthz", (req, res) => res.status(200).json({ ok: true }));

// ✅ API routes
app.use("/api", routes);

// -----------------------------
// 🔥 SERVE FRONTEND (FINAL FIX)
// -----------------------------

const frontendPath = path.join(__dirname, "../../frontend/out");

// Serve static files
app.use(express.static(frontendPath));

// ✅ FINAL UNIVERSAL ROUTE (NO ERRORS)
app.use((req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// -----------------------------

// ⚠️ IMPORTANT: keep these AFTER frontend serving
app.use(notFound);
app.use(errorHandler);

async function start() {
  await connectDb();
  app.listen(env.PORT, () => {
    console.log(`🚀 Server running on port ${env.PORT}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});