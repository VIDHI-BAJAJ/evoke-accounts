import { Client, Invoice, InvoiceItem, Payment } from "./types";

const STORAGE_KEYS = {
  clients: "aievoked_clients",
  invoices: "aievoked_invoices",
  invoiceItems: "aievoked_invoice_items",
  payments: "aievoked_payments",
};

function load<T>(key: string, fallback: T[]): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

// SEED DATA
const seedClients: Client[] = [
  {
    id: "c1",
    name: "Neha Thakkar",
    company_name: "Soulful Gems",
    email: "369nehathakkar@gmail.com",
    phone: "+91 97666 99988",
    address: "",
    city: "Delhi",
    state_name: "Delhi",
    state_code: "07",
    pin: "",
    gstin: "",
    pan: "",
    country: "India",
    is_archived: false,
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "c2",
    name: "Dr. Mmalvikaa",
    company_name: "Maven Pathways",
    email: "mmalvikaa1@gmail.com",
    phone: "+91 95175 75555",
    address: "",
    city: "Delhi",
    state_name: "Delhi",
    state_code: "07",
    pin: "",
    gstin: "",
    pan: "",
    country: "India",
    is_archived: false,
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "c3",
    name: "Akanksha Bansal",
    company_name: "House of Vaulte",
    email: "thevaulteofficial@gmail.com",
    phone: "+91 81467 59359",
    address: "BUILDING NO.3-A, HOUSE OF VAULTE, RAJPURA-SIRHIND BYE PASS, ROSE AVENUE, OPP. URBAN ESTATE, PH-2",
    city: "Patiala",
    state_name: "Punjab",
    state_code: "03",
    pin: "147002",
    gstin: "03CFXPB3364Q2ZU",
    pan: "CFXPB3364Q",
    country: "India",
    is_archived: false,
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "c4",
    name: "",
    company_name: "Agami Apparels Private Limited",
    email: "",
    phone: "+91 98306 46222",
    address: "",
    city: "",
    state_name: "Gujarat",
    state_code: "24",
    pin: "",
    gstin: "24AAXCA3596K1ZX",
    pan: "",
    country: "India",
    is_archived: false,
    created_at: "2025-01-01T00:00:00Z",
  },
];

const seedInvoiceItems: InvoiceItem[] = [
  {
    id: "ii1", invoice_id: "inv1", item_name: "Website and CRO Setup", description: "", hsn_sac: "998314", gst_rate: 18, quantity: 1, rate: 2550, amount: 2550,
    cgst_amount: 229.5, sgst_amount: 229.5, igst_amount: 0, total: 3009,
  },
  {
    id: "ii2", invoice_id: "inv2", item_name: "Website and CRO", description: "", hsn_sac: "998314", gst_rate: 18, quantity: 1, rate: 2550, amount: 2550,
    cgst_amount: 229.5, sgst_amount: 229.5, igst_amount: 0, total: 3009,
  },
  {
    id: "ii3", invoice_id: "inv3", item_name: "Website and CRO Retainer", description: "", hsn_sac: "998314", gst_rate: 18, quantity: 1, rate: 15330, amount: 15330,
    cgst_amount: 0, sgst_amount: 0, igst_amount: 2759.4, total: 18089.4,
  },
  {
    id: "ii4", invoice_id: "inv4", item_name: "Website and CRO Retainer", description: "", hsn_sac: "998314", gst_rate: 18, quantity: 1, rate: 15000, amount: 15000,
    cgst_amount: 0, sgst_amount: 0, igst_amount: 2700, total: 17700,
  },
];

const seedInvoices: Invoice[] = [
  {
    id: "inv1", invoice_number: "AI/2025-26/01", invoice_date: "2026-02-15", due_date: "", client_id: "c1",
    status: "unpaid", subtotal: 2550, cgst: 229.5, sgst: 229.5, igst: 0, total: 3009, notes: "", created_at: "2026-02-15T00:00:00Z", updated_at: "2026-02-15T00:00:00Z",
  },
  {
    id: "inv2", invoice_number: "AI/2025-26/02", invoice_date: "2026-02-15", due_date: "", client_id: "c2",
    status: "unpaid", subtotal: 2550, cgst: 229.5, sgst: 229.5, igst: 0, total: 3009, notes: "", created_at: "2026-02-15T00:00:00Z", updated_at: "2026-02-15T00:00:00Z",
  },
  {
    id: "inv3", invoice_number: "AI/2025-26/03", invoice_date: "2026-03-04", due_date: "", client_id: "c3",
    status: "unpaid", subtotal: 15330, cgst: 0, sgst: 0, igst: 2759.4, total: 18089.4, notes: "", created_at: "2026-03-04T00:00:00Z", updated_at: "2026-03-04T00:00:00Z",
  },
  {
    id: "inv4", invoice_number: "AI/2025-26/04", invoice_date: "2026-03-09", due_date: "2026-03-24", client_id: "c4",
    status: "unpaid", subtotal: 15000, cgst: 0, sgst: 0, igst: 2700, total: 17700, notes: "", created_at: "2026-03-09T00:00:00Z", updated_at: "2026-03-09T00:00:00Z",
  },
];

function initStore() {
  if (!localStorage.getItem(STORAGE_KEYS.clients)) {
    save(STORAGE_KEYS.clients, seedClients);
  }
  if (!localStorage.getItem(STORAGE_KEYS.invoices)) {
    save(STORAGE_KEYS.invoices, seedInvoices);
  }
  if (!localStorage.getItem(STORAGE_KEYS.invoiceItems)) {
    save(STORAGE_KEYS.invoiceItems, seedInvoiceItems);
  }
  if (!localStorage.getItem(STORAGE_KEYS.payments)) {
    save(STORAGE_KEYS.payments, []);
  }
}
initStore();

// Client operations
export function getClients(): Client[] {
  return load<Client>(STORAGE_KEYS.clients, seedClients);
}

export function getClient(id: string): Client | undefined {
  return getClients().find((c) => c.id === id);
}

export function saveClient(client: Client): Client {
  const clients = getClients();
  const idx = clients.findIndex((c) => c.id === client.id);
  if (idx >= 0) {
    clients[idx] = client;
  } else {
    clients.push(client);
  }
  save(STORAGE_KEYS.clients, clients);
  return client;
}

export function archiveClient(id: string) {
  const clients = getClients();
  const client = clients.find((c) => c.id === id);
  if (client) {
    client.is_archived = true;
    save(STORAGE_KEYS.clients, clients);
  }
}

// Invoice operations
export function getInvoices(): Invoice[] {
  return load<Invoice>(STORAGE_KEYS.invoices, seedInvoices);
}

export function getInvoice(id: string): Invoice | undefined {
  const inv = getInvoices().find((i) => i.id === id);
  if (inv) {
    inv.items = getInvoiceItems(id);
    inv.client = getClient(inv.client_id);
  }
  return inv;
}

export function saveInvoice(invoice: Invoice, items: InvoiceItem[]): Invoice {
  const invoices = getInvoices();
  const idx = invoices.findIndex((i) => i.id === invoice.id);
  if (idx >= 0) {
    invoices[idx] = invoice;
  } else {
    invoices.push(invoice);
  }
  save(STORAGE_KEYS.invoices, invoices);

  // Save items
  const allItems = load<InvoiceItem>(STORAGE_KEYS.invoiceItems, seedInvoiceItems);
  const otherItems = allItems.filter((it) => it.invoice_id !== invoice.id);
  save(STORAGE_KEYS.invoiceItems, [...otherItems, ...items]);

  return invoice;
}

export function deleteInvoice(id: string) {
  const invoices = getInvoices().filter((i) => i.id !== id);
  save(STORAGE_KEYS.invoices, invoices);
  const items = load<InvoiceItem>(STORAGE_KEYS.invoiceItems, []).filter((it) => it.invoice_id !== id);
  save(STORAGE_KEYS.invoiceItems, items);
}

export function getInvoiceItems(invoiceId: string): InvoiceItem[] {
  return load<InvoiceItem>(STORAGE_KEYS.invoiceItems, seedInvoiceItems).filter(
    (it) => it.invoice_id === invoiceId
  );
}

export function getInvoicesForClient(clientId: string): Invoice[] {
  return getInvoices().filter((i) => i.client_id === clientId);
}

// Payment operations
export function getPayments(invoiceId: string): Payment[] {
  return load<Payment>(STORAGE_KEYS.payments, []).filter((p) => p.invoice_id === invoiceId);
}

export function savePayment(payment: Payment) {
  const payments = load<Payment>(STORAGE_KEYS.payments, []);
  payments.push(payment);
  save(STORAGE_KEYS.payments, payments);

  // Update invoice status
  const invoice = getInvoices().find((i) => i.id === payment.invoice_id);
  if (invoice) {
    const totalPaid = payments
      .filter((p) => p.invoice_id === payment.invoice_id)
      .reduce((sum, p) => sum + p.amount, 0);
    if (totalPaid >= invoice.total) {
      invoice.status = "paid";
      const invoices = getInvoices();
      const idx = invoices.findIndex((i) => i.id === invoice.id);
      if (idx >= 0) {
        invoices[idx] = invoice;
        save(STORAGE_KEYS.invoices, invoices);
      }
    }
  }
}

export function getTotalPaid(invoiceId: string): number {
  return load<Payment>(STORAGE_KEYS.payments, [])
    .filter((p) => p.invoice_id === invoiceId)
    .reduce((sum, p) => sum + p.amount, 0);
}
