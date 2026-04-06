import { Router } from "express";
import { connectDB } from "../lib/mongodb";
import { Invoice } from "../models/Invoice";
import { Payment } from "../models/Payment";

const router = Router();

router.get("/", async (req, res) => {
  await connectDB();
  const invoices = await Invoice.find({});
  res.json(invoices);
});

router.get("/:id", async (req, res) => {
  await connectDB();
  const invoice = await Invoice.findOne({ id: req.params.id });
  res.json(invoice);
});

router.post("/", async (req, res) => {
  await connectDB();
  const { invoice, items } = req.body;
  invoice.items = items;
  const doc = new Invoice(invoice);
  await doc.save();
  res.json(doc);
});

router.put("/:id", async (req, res) => {
  await connectDB();
  const { invoice, items } = req.body;
  invoice.items = items;
  const doc = await Invoice.findOneAndUpdate({ id: req.params.id }, invoice, { new: true });
  res.json(doc);
});

router.delete("/:id", async (req, res) => {
  await connectDB();
  await Invoice.findOneAndDelete({ id: req.params.id });
  res.json({ success: true });
});

// Payments
router.get("/:id/payments", async (req, res) => {
  await connectDB();
  const payments = await Payment.find({ invoice_id: req.params.id });
  res.json(payments);
});

router.post("/:id/payments", async (req, res) => {
  await connectDB();
  const payment = new Payment(req.body);
  await payment.save();

  // Check if fully paid
  const allPayments = await Payment.find({ invoice_id: req.params.id });
  const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);
  const invoice = await Invoice.findOne({ id: req.params.id });
  if (invoice && totalPaid >= invoice.total) {
    await Invoice.findOneAndUpdate({ id: req.params.id }, { status: "paid" });
  }

  res.json(payment);
});

export default router;