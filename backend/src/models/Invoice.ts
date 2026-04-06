import mongoose from "mongoose";

const InvoiceItemSchema = new mongoose.Schema({
  id: String,
  invoice_id: String,
  item_name: String,
  description: String,
  hsn_sac: String,
  gst_rate: Number,
  quantity: Number,
  rate: Number,
  amount: Number,
  cgst_amount: Number,
  sgst_amount: Number,
  igst_amount: Number,
  total: Number,
});

const InvoiceSchema = new mongoose.Schema({
  id: String,
  invoice_number: String,
  invoice_date: String,
  due_date: String,
  client_id: String,
  status: { type: String, enum: ["draft", "unpaid", "paid", "overdue"], default: "unpaid" },
  subtotal: Number,
  cgst: Number,
  sgst: Number,
  igst: Number,
  total: Number,
  notes: String,
  terms_and_conditions: String,
  items: [InvoiceItemSchema],
  created_at: String,
  updated_at: String,
});

export const Invoice = mongoose.models.Invoice || mongoose.model("Invoice", InvoiceSchema);