import { Router } from "express";
import { connectDB } from "../lib/mongodb";
import { Client } from "../models/Client";

const router = Router();

router.get("/", async (req, res) => {
  await connectDB();
  const clients = await Client.find({});
  res.json(clients);
});

router.post("/", async (req, res) => {
  await connectDB();
  const client = new Client(req.body);
  await client.save();
  res.json(client);
});

router.put("/:id", async (req, res) => {
  await connectDB();
  const client = await Client.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
  res.json(client);
});

router.delete("/:id", async (req, res) => {
  await connectDB();
  await Client.findOneAndUpdate({ id: req.params.id }, { is_archived: true });
  res.json({ success: true });
});

export default router;