import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  userId: { type: String, unique: true, sparse: true }, // stable ID for seeding
  email: { type: String, unique: true, required: true, lowercase: true, trim: true },
  name: { type: String, required: true },
  passwordHash: { type: String, required: true },
});

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
