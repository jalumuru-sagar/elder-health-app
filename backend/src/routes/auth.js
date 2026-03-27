import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env.js";
import { User, USER_ROLES } from "../models/User.js";

const router = express.Router();

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(USER_ROLES),
  patientId: z.string().min(1).max(64).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// ================= REGISTER =================
router.post("/register", async (req, res, next) => {
  try {
    console.log("Request received", req.body);
    console.log("REGISTER:", req.body);

    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const { name, email, password, role, patientId } = parsed.data;

    // ✅ Normalize email
    const normalizedEmail = email.toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail }).lean();
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: normalizedEmail,
      patientId: patientId?.trim() || name.trim(),
      password: hashedPassword,
      role,
    });

    console.log("DB USER CREATED:", user);

    return res.status(201).json({
      success: true,
      message: "Registered successfully",
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

// ================= LOGIN =================
router.post("/login", async (req, res, next) => {
  try {
    console.log("Request received", req.body);
    console.log("LOGIN:", req.body);

    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const { email, password } = parsed.data;

    // ✅ Normalize email
    const normalizedEmail = email.toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });

    console.log("DB USER:", user);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // ✅ Correct password compare
    const isMatch = await bcrypt.compare(password, user.password);

    console.log("PASSWORD MATCH:", isMatch);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // ✅ Generate JWT
    const token = jwt.sign(
      { id: String(user._id), role: user.role },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: String(user._id),
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

export default router;