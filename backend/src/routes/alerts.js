import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { Health } from "../models/Health.js";

const router = express.Router();

router.get("/alerts", authMiddleware, async (req, res) => {
  try {
    const patientId = typeof req.query.patientId === "string" ? req.query.patientId.trim() : "";
    const query = {
      alert: { $ne: "Normal" },
      ...(patientId ? { patientId } : {}),
    };

    const alerts = await Health.find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.status(200).json({
      alerts: alerts.map((h) => ({
        id: String(h._id),
        patientId: String(h.patientId),
        heartRate: h.heartRate,
        oxygen: h.oxygen,
        systolic: h.systolic,
        diastolic: h.diastolic,
        alert: h.alert,
        createdAt: h.createdAt,
      })),
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

export default router;

