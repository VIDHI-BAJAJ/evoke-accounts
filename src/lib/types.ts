export interface Client {
  id: string;
  name: string;
  company_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state_name: string;
  state_code: string;
  pin: string;
  gstin: string;
  pan: string;
  country: string;
  is_archived: boolean;
  created_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  item_name: string;
  description: string;
  hsn_sac: string;
  gst_rate: number;
  quantity: number;
  rate: number;
  amount: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  client_id: string;
  status: "draft" | "unpaid" | "paid" | "overdue";
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  notes: string;
  created_at: string;
  updated_at: string;
  items?: InvoiceItem[];
  client?: Client;
}

export interface Payment {
  id: string;
  invoice_id: string;
  payment_date: string;
  amount: number;
  mode: string;
  reference: string;
  notes: string;
  created_at: string;
}
