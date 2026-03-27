import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { Health } from "../models/Health.js";

const router = express.Router();

router.get("/patient/:patientId", authMiddleware, async (req, res) => {
  try {
    const rawPatientId = req.params.patientId ?? "";
    const patientId = rawPatientId.trim();
    if (!patientId) return res.status(400).json({ message: "Invalid input" });

    const items = await Health.find({ patientId })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      patientId,
      health: items.map((h) => ({
        id: String(h._id),
        patientId: h.patientId,
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

