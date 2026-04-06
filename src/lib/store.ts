import { Client, Invoice, InvoiceItem, Payment } from "./types";

const API = import.meta.env.VITE_API_URL;

// ─── Clients ────────────────────────────────────────────
export async function getClients(): Promise<Client[]> {
  const res = await fetch(`${API}/api/clients`);
  return res.json();
}

export async function getClient(id: string): Promise<Client | undefined> {
  const clients = await getClients();
  return clients.find((c) => c.id === id);
}

export async function saveClient(client: Client): Promise<Client> {
  const existing = await getClient(client.id);
  const res = await fetch(`${API}/api/clients${existing ? `/${client.id}` : ""}`, {
    method: existing ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(client),
  });
  return res.json();
}

export async function archiveClient(id: string): Promise<void> {
  await fetch(`${API}/api/clients/${id}`, { method: "DELETE" });
}

// ─── Invoices ───────────────────────────────────────────
export async function getInvoices(): Promise<Invoice[]> {
  const res = await fetch(`${API}/api/invoices`);
  return res.json();
}

export async function getInvoice(id: string): Promise<Invoice | undefined> {
  const res = await fetch(`${API}/api/invoices/${id}`);
  return res.json();
}

export async function saveInvoice(invoice: Invoice, items: InvoiceItem[]): Promise<Invoice> {
  const existing = await getInvoice(invoice.id);
  const res = await fetch(`${API}/api/invoices${existing ? `/${invoice.id}` : ""}`, {
    method: existing ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ invoice, items }),
  });
  return res.json();
}

export async function deleteInvoice(id: string): Promise<void> {
  await fetch(`${API}/api/invoices/${id}`, { method: "DELETE" });
}

export async function getInvoicesForClient(clientId: string): Promise<Invoice[]> {
  const invoices = await getInvoices();
  return invoices.filter((i) => i.client_id === clientId);
}

// ─── Payments ───────────────────────────────────────────
export async function getPayments(invoiceId: string): Promise<Payment[]> {
  const res = await fetch(`${API}/api/invoices/${invoiceId}/payments`);
  return res.json();
}

export async function savePayment(payment: Payment): Promise<void> {
  await fetch(`${API}/api/invoices/${payment.invoice_id}/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payment),
  });
}

export async function getTotalPaid(invoiceId: string): Promise<number> {
  const payments = await getPayments(invoiceId);
  return payments.reduce((sum, p) => sum + p.amount, 0);
}