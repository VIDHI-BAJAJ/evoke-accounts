export const COMPANY = {
  name: "AI Evoked (OPC) Private Limited",
  shortName: "AI Evoked",
  address: "12-E, PKT-1, Second Floor, Mayur Vihar Phase-I, East Delhi, New Delhi, Delhi - 110091",
  gstin: "07ABDCA1424H1Z3",
  pan: "ABDCA1424H",
  email: "contact@aievoked.com",
  phone: "+91 92661 01567",
  stateCode: "07",
  stateName: "Delhi",
  bank: {
    name: "Kotak Mahindra Bank Limited",
    accountName: "AI Evoked (OPC) Private Limited",
    accountNumber: "8750530938",
    ifsc: "KKBK0000203",
    accountType: "Current",
    upiId: "aievoked@kotak",
  },
};

export const GST_RATES = [0, 5, 12, 18, 28] as const;

export const INDIAN_STATES = [
  { code: "01", name: "Jammu & Kashmir" },
  { code: "02", name: "Himachal Pradesh" },
  { code: "03", name: "Punjab" },
  { code: "04", name: "Chandigarh" },
  { code: "05", name: "Uttarakhand" },
  { code: "06", name: "Haryana" },
  { code: "07", name: "Delhi" },
  { code: "08", name: "Rajasthan" },
  { code: "09", name: "Uttar Pradesh" },
  { code: "10", name: "Bihar" },
  { code: "11", name: "Sikkim" },
  { code: "12", name: "Arunachal Pradesh" },
  { code: "13", name: "Nagaland" },
  { code: "14", name: "Manipur" },
  { code: "15", name: "Mizoram" },
  { code: "16", name: "Tripura" },
  { code: "17", name: "Meghalaya" },
  { code: "18", name: "Assam" },
  { code: "19", name: "West Bengal" },
  { code: "20", name: "Jharkhand" },
  { code: "21", name: "Odisha" },
  { code: "22", name: "Chhattisgarh" },
  { code: "23", name: "Madhya Pradesh" },
  { code: "24", name: "Gujarat" },
  { code: "25", name: "Daman & Diu" },
  { code: "26", name: "Dadra & Nagar Haveli" },
  { code: "27", name: "Maharashtra" },
  { code: "29", name: "Karnataka" },
  { code: "30", name: "Goa" },
  { code: "31", name: "Lakshadweep" },
  { code: "32", name: "Kerala" },
  { code: "33", name: "Tamil Nadu" },
  { code: "34", name: "Puducherry" },
  { code: "35", name: "Andaman & Nicobar Islands" },
  { code: "36", name: "Telangana" },
  { code: "37", name: "Andhra Pradesh" },
];

export const PAYMENT_MODES = ["Bank Transfer", "UPI", "Cash", "Cheque"] as const;

export function getFinancialYear(date: Date = new Date()): string {
  const month = date.getMonth();
  const year = date.getFullYear();
  if (month >= 3) {
    return `${year}-${(year + 1).toString().slice(2)}`;
  }
  return `${year - 1}-${year.toString().slice(2)}`;
}

export function generateInvoiceNumber(existingInvoices: { invoice_number: string }[]): string {
  const fy = getFinancialYear();
  const prefix = `AI/${fy}/`;
  const existing = existingInvoices
    .filter((inv) => inv.invoice_number.startsWith(prefix))
    .map((inv) => {
      const num = parseInt(inv.invoice_number.replace(prefix, ""), 10);
      return isNaN(num) ? 0 : num;
    });
  const next = existing.length > 0 ? Math.max(...existing) + 1 : 1;
  return `${prefix}${next.toString().padStart(2, "0")}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
}
