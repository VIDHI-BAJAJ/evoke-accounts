import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  id: String,
  invoice_id: String,
  payment_date: String,
  amount: Number,
  mode: String,
  reference: String,
  notes: String,
  created_at: String,
});

export const Payment = mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);