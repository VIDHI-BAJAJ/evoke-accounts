import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

let cached = (global as any).mongoose || { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;
  cached.promise = mongoose.connect(process.env.MONGO_URI!);
  cached.conn = await cached.promise;
  (global as any).mongoose = cached;
  return cached.conn;
}