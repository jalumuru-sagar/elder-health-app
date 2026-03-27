import express from "express";
import authRoutes from "./auth.js";
import healthRoutes from "./health.js";
import patientRoutes from "./patient.js";
import alertsRoutes from "./alerts.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/api", healthRoutes);
router.use("/api", patientRoutes);
router.use("/api", alertsRoutes);

export default router;

