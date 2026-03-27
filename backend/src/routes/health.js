import express from "express";
import { z } from "zod";
import { Health } from "../models/Health.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";
import { computeAlert } from "../utils/healthLogic.js";

const router = express.Router();

const healthSchema = z.object({
  patientId: z.string().min(1),
  heartRate: z.number().finite(),
  oxygen: z.number().finite(),
  systolic: z.number().finite(),
  diastolic: z.number().finite(),
});

function validateHealthInput(input) {
  const { patientId, heartRate, oxygen, systolic, diastolic } = input;
  if (
    !patientId ||
    heartRate === undefined ||
    oxygen === undefined ||
    systolic === undefined ||
    diastolic === undefined
  ) {
    return "All fields are required";
  }

  if (heartRate < 30 || heartRate > 200) {
    return "Heart rate out of valid range";
  }
  if (oxygen < 50 || oxygen > 100) {
    return "Oxygen level must be between 50 and 100";
  }
  if (systolic < 50 || systolic > 250 || diastolic < 30 || diastolic > 150) {
    return "Invalid blood pressure values";
  }

  return null;
}

function serializeHealth(doc) {
  return {
    id: String(doc._id),
    patientId: doc.patientId,
    heartRate: doc.heartRate,
    oxygen: doc.oxygen,
    systolic: doc.systolic,
    diastolic: doc.diastolic,
    alert: doc.alert,
    createdAt: doc.createdAt,
  };
}

router.post("/health", authMiddleware, roleMiddleware(["care_manager"]), async (req, res) => {
  try {
    const parsed = healthSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid input" });

    const { patientId, heartRate, oxygen, systolic, diastolic } = parsed.data;
    const normalizedPatientId = patientId.trim();
    const validationError = validateHealthInput({
      patientId: normalizedPatientId,
      heartRate,
      oxygen,
      systolic,
      diastolic,
    });
    if (validationError) return res.status(400).json({ message: validationError });

    const alert = computeAlert({ heartRate, oxygen, systolic, diastolic });
    const doc = await Health.create({
      patientId: normalizedPatientId,
      heartRate,
      oxygen,
      systolic,
      diastolic,
      alert,
      createdAt: new Date(),
    });

    return res.status(201).json({ health: serializeHealth(doc) });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
});

router.put("/health/:id", authMiddleware, roleMiddleware(["care_manager"]), async (req, res) => {
  try {
    const parsed = healthSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid input" });

    const { patientId, heartRate, oxygen, systolic, diastolic } = parsed.data;
    const normalizedPatientId = patientId.trim();
    const validationError = validateHealthInput({
      patientId: normalizedPatientId,
      heartRate,
      oxygen,
      systolic,
      diastolic,
    });
    if (validationError) return res.status(400).json({ message: validationError });

    const alert = computeAlert({ heartRate, oxygen, systolic, diastolic });
    const updated = await Health.findByIdAndUpdate(
      req.params.id,
      {
        patientId: normalizedPatientId,
        heartRate,
        oxygen,
        systolic,
        diastolic,
        alert,
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Health record not found" });
    return res.status(200).json({ health: serializeHealth(updated) });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
    return res.status(500).json({ message: "Update failed" });
  }
});

export default router;

