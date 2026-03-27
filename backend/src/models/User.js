import mongoose from "mongoose";

const roles = ["care_manager", "parent", "child"];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    patientId: { type: String, trim: true, index: true, sparse: true },
    password: { type: String, required: true, minlength: 8 },
    role: { type: String, required: true, enum: roles },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
export const USER_ROLES = roles;

