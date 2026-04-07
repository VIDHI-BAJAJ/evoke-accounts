import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import clientRoutes from "./routes/clients";
import invoiceRoutes from "./routes/invoices";

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    "https://evoke-accounts.vercel.app",
    "https://www.aievoked.com",
    "https://aievoked.com"
  ],
  credentials: true
}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/invoices", invoiceRoutes);

app.get("/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
