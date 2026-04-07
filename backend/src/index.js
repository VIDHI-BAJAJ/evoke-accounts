const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
}));
app.use(express.json());

// ─── MongoDB Connection ────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected!"))
  .catch((err) => console.error("MongoDB error:", err));

// ─── Models ───────────────────────────────────────────
const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true, lowercase: true, trim: true },
  name: String,
  passwordHash: String,
});
const User = mongoose.model("User", UserSchema);

const ClientSchema = new mongoose.Schema({
  id: String,
  name: String,
  company_name: String,
  email: String,
  phone: String,
  address: String,
  city: String,
  state_name: String,
  state_code: String,
  pin: String,
  gstin: String,
  pan: String,
  country: String,
  is_archived: { type: Boolean, default: false },
  created_at: String,
});
const Client = mongoose.model("Client", ClientSchema);

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
  status: { type: String, default: "unpaid" },
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
const Invoice = mongoose.model("Invoice", InvoiceSchema);

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
const Payment = mongoose.model("Payment", PaymentSchema);

// ─── Health Check ─────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ─── Auth Routes ──────────────────────────────────────
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Missing credentials" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user)
      return res.status(401).json({ error: "Invalid credentials" });

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid)
      return res.status(401).json({ error: "Invalid credentials" });

    return res.status(200).json({ email: user.email, name: user.name });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
});

// ─── Client Routes ────────────────────────────────────
app.get("/api/clients", async (req, res) => {
  try {
    const clients = await Client.find({});
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/clients", async (req, res) => {
  try {
    const client = new Client(req.body);
    await client.save();
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/clients/:id", async (req, res) => {
  try {
    const client = await Client.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/clients/:id", async (req, res) => {
  try {
    await Client.findOneAndUpdate({ id: req.params.id }, { is_archived: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ─── Invoice Routes ───────────────────────────────────
app.get("/api/invoices", async (req, res) => {
  try {
    const invoices = await Invoice.find({});
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/invoices/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ id: req.params.id });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/invoices", async (req, res) => {
  try {
    const { invoice, items } = req.body;
    invoice.items = items;
    const doc = new Invoice(invoice);
    await doc.save();
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/invoices/:id", async (req, res) => {
  try {
    const { invoice, items } = req.body;
    invoice.items = items;
    const doc = await Invoice.findOneAndUpdate(
      { id: req.params.id },
      invoice,
      { new: true }
    );
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/invoices/:id", async (req, res) => {
  try {
    await Invoice.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ─── Payment Routes ───────────────────────────────────
app.get("/api/invoices/:id/payments", async (req, res) => {
  try {
    const payments = await Payment.find({ invoice_id: req.params.id });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/invoices/:id/payments", async (req, res) => {
  try {
    const payment = new Payment(req.body);
    await payment.save();

    const allPayments = await Payment.find({ invoice_id: req.params.id });
    const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);
    const invoice = await Invoice.findOne({ id: req.params.id });
    if (invoice && totalPaid >= invoice.total) {
      await Invoice.findOneAndUpdate({ id: req.params.id }, { status: "paid" });
    }

    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ─── Start Server ─────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));