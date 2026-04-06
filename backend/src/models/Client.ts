import mongoose from "mongoose";

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

export const Client = mongoose.models.Client || mongoose.model("Client", ClientSchema);