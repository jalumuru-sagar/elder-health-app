import mongoose from "mongoose";

const healthSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true, trim: true, index: true },
    heartRate: { type: Number, required: true, min: 0, max: 300 },
    oxygen: { type: Number, required: true, min: 0, max: 100 },
    systolic: { type: Number, required: true, min: 0, max: 300 },
    diastolic: { type: Number, required: true, min: 0, max: 200 },
    alert: { type: String, required: true, enum: ["Normal", "Warning", "Alert", "Critical"], index: true },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

healthSchema.index({ patientId: 1, createdAt: -1 });

export const Health = mongoose.model("Health", healthSchema);

