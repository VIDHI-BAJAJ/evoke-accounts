import { Router } from "express";
import bcrypt from "bcryptjs";
import { connectDB } from "../lib/mongodb";
import { User } from "../models/User";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Missing credentials" });

    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

    return res.status(200).json({ email: user.email, name: user.name });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;