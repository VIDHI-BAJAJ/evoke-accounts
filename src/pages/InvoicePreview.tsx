import { useParams, Link, useNavigate } from "react-router-dom";
import { getInvoice, getClients, getPayments, savePayment } from "@/lib/store";
import { COMPANY, formatCurrency, PAYMENT_MODES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Download, Pencil, CreditCard, MessageCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Payment } from "@/lib/types";
import { amountInWords } from "@/lib/invoiceUtils";
import logoColor from "@/assets/ai-evoked-logo.png";
import { useQuery, useQueryClient } from "@tanstack/react-query";

function getLogos(): { primary: string; secondary: string | null } {
  const customPrimary = localStorage.getItem("aievoked_primary_logo");
  const customSecondary = localStorage.getItem("aievoked_secondary_logo");
  return {
    primary: customPrimary || logoColor,
    secondary: customSecondary || null,
  };
}

export default function InvoicePreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: invoice, isLoading: invoiceLoading } = useQuery({
    queryKey: ["invoice", id],
    queryFn: () => getInvoice(id!),
    enabled: !!id,
  });

  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: getClients });

  const { data: payments = [] } = useQuery({
    queryKey: ["payments", id],
    queryFn: () => getPayments(id!),
    enabled: !!id,
  });

  if (invoiceLoading) {
    return <div className="text-center py-20 text-muted-foreground">Loading invoice...</div>;
  }

  if (!invoice) {
    return <div className="text-center py-20 text-muted-foreground">Invoice not found</div>;
  }

  const client = clients.find((c) => c.id === invoice.client_id);
  const items = invoice.items || [];
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const balance = invoice.total - totalPaid;
  const isSameState = client?.state_code === COMPANY.stateCode;

  async function handleDownloadPDF() {
    const element = document.getElementById("invoice-print-area");
    if (!element) return;
    toast.info("Generating PDF...");
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#ffffff", width: 794 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${invoice.invoice_number.replace(/\//g, "_")}.pdf`);
      toast.success("PDF downloaded");
    } catch {
      toast.error("Failed to generate PDF");
    }
  }

  function handleWhatsApp() {
    const clientName = client?.company_name || client?.name || "Client";
    const text = `Hi ${clientName}, please find invoice ${invoice.invoice_number} for ${formatCurrency(invoice.total)} dated ${new Date(invoice.invoice_date).toLocaleDateString("en-IN")}. You can view it here: ${window.location.href}. Bank: ${COMPANY.bank.name}, A/C: ${COMPANY.bank.accountNumber}, IFSC: ${COMPANY.bank.ifsc}. Please feel free to reach out at ${COMPANY.email}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  return (
    <div className="space-y-4 max-w-[900px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/invoices")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">{invoice.invoice_number}</h1>
          <StatusBadge status={invoice.status} />
        </div>
        <div className="flex gap-2 flex-wrap">
          <RecordPaymentDialog
            invoiceId={invoice.id}
            balance={balance}
            onSaved={() => {
              queryClient.invalidateQueries({ queryKey: ["payments", id] });
              queryClient.invalidateQueries({ queryKey: ["invoices"] });
              queryClient.invalidateQueries({ queryKey: ["invoice", id] });
            }}
          />
          <Button variant="outline" size="sm" asChild>
            <Link to={`/invoices/${invoice.id}/edit`}><Pencil className="mr-1 h-3 w-3" /> Edit</Link>
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
            <Download className="mr-1 h-3 w-3" /> Download PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handleWhatsApp}>
            <MessageCircle className="mr-1 h-3 w-3" /> WhatsApp
          </Button>
        </div>
      </div>

      {/* Printable Invoice */}
      <div id="invoice-print-area" className="print-area bg-card rounded-xl border shadow-sm p-10 space-y-5" style={{ width: 794, maxWidth: "100%", margin: "0 auto", fontFamily: "'Inter', sans-serif" }}>

        <div className="relative">
          <div className="absolute top-0 left-0 right-0 h-1 rounded-full" style={{ background: "linear-gradient(90deg, hsl(263 70% 50%), hsl(263 55% 72%))" }} />
          <div className="flex justify-between items-start pt-4">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: "hsl(263 70% 50%)" }}>TAX INVOICE</h2>
              <p className="text-sm text-muted-foreground mt-1 font-medium">{invoice.invoice_number}</p>
            </div>
            <div className="flex items-center gap-3">
              {getLogos().secondary && (
                <img src={getLogos().secondary!} alt="Subsidiary" className="h-12 w-12 rounded-lg object-contain" />
              )}
              <img src={getLogos().primary} alt="AI Evoked" className="h-14 w-14 rounded-lg object-contain" />
            </div>
          </div>
        </div>

        <div className="flex gap-8 text-sm">
          <div>
            <span className="text-muted-foreground">Invoice Date: </span>
            <span className="font-semibold">{new Date(invoice.invoice_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
          </div>
          {invoice.due_date && (
            <div>
              <span className="text-muted-foreground">Due Date: </span>
              <span className="font-semibold">{new Date(invoice.due_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-primary/15 p-4" style={{ backgroundColor: "hsl(263 70% 50% / 0.04)" }}>
            <p className="text-xs font-bold uppercase mb-3 tracking-wider" style={{ color: "hsl(263 70% 50%)" }}>Billed By</p>
            <div className="space-y-1 text-xs">
              <p><span className="font-bold text-foreground">Company Name: </span><span className="font-semibold text-sm">{COMPANY.name}</span></p>
              <p><span className="font-bold text-foreground">Address: </span><span className="text-muted-foreground">{COMPANY.address}</span></p>
              <p><span className="font-bold text-foreground">GSTIN: </span><span className="text-muted-foreground">{COMPANY.gstin}</span></p>
              <p><span className="font-bold text-foreground">PAN: </span><span className="text-muted-foreground">{COMPANY.pan}</span></p>
              <p><span className="font-bold text-foreground">Email: </span><span className="text-muted-foreground">{COMPANY.email}</span></p>
              <p><span className="font-bold text-foreground">Phone: </span><span className="text-muted-foreground">{COMPANY.phone}</span></p>
            </div>
          </div>

          <div className="rounded-lg border border-primary/15 p-4" style={{ backgroundColor: "hsl(263 70% 50% / 0.04)" }}>
            <p className="text-xs font-bold uppercase mb-3 tracking-wider" style={{ color: "hsl(263 70% 50%)" }}>Billed To</p>
            {client && (
              <div className="space-y-1 text-xs">
                {client.name && <p><span className="font-bold text-foreground">Name: </span><span className="text-muted-foreground">{client.name.toUpperCase()}</span></p>}
                <p><span className="font-bold text-foreground">Company Name: </span><span className="font-semibold text-sm">{(client.company_name || client.name).toUpperCase()}</span></p>
                {(client.address || client.city || client.state_name) && (
                  <p><span className="font-bold text-foreground">Address: </span><span className="text-muted-foreground">{[client.address, client.city, client.state_name, client.country, client.pin ? `- ${client.pin}` : ""].filter(Boolean).join(", ")}</span></p>
                )}
                {client.gstin && <p><span className="font-bold text-foreground">GSTIN: </span><span className="text-muted-foreground">{client.gstin}</span></p>}
                {client.pan && <p><span className="font-bold text-foreground">PAN: </span><span className="text-muted-foreground">{client.pan}</span></p>}
                {client.email && <p><span className="font-bold text-foreground">Email: </span><span className="text-muted-foreground">{client.email}</span></p>}
                {client.phone && <p><span className="font-bold text-foreground">Phone: </span><span className="text-muted-foreground">{client.phone}</span></p>}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-8 text-xs text-muted-foreground border-t border-b py-2">
          <span><strong className="text-foreground">Country of Supply:</strong> India</span>
          <span><strong className="text-foreground">Place of Supply:</strong> {client?.state_name || "Delhi"} ({client?.state_code || "07"})</span>
        </div>

        <Table>
          <TableHeader>
            <TableRow style={{ backgroundColor: "hsl(263 70% 50% / 0.08)" }}>
              <TableHead className="text-xs font-bold">#</TableHead>
              <TableHead className="text-xs font-bold">Item</TableHead>
              <TableHead className="text-xs font-bold">SAC/HSN</TableHead>
              <TableHead className="text-xs text-right font-bold">Qty</TableHead>
              <TableHead className="text-xs text-right font-bold">Rate</TableHead>
              <TableHead className="text-xs text-right font-bold">Amount</TableHead>
              {isSameState ? (
                <>
                  <TableHead className="text-xs text-right font-bold">CGST</TableHead>
                  <TableHead className="text-xs text-right font-bold">SGST</TableHead>
                </>
              ) : (
                <TableHead className="text-xs text-right font-bold">IGST</TableHead>
              )}
              <TableHead className="text-xs text-right font-bold">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, idx) => (
              <TableRow key={item.id} className={idx % 2 === 0 ? "" : "bg-muted/30"}>
                <TableCell className="text-xs">{idx + 1}</TableCell>
                <TableCell>
                  <p className="text-sm font-medium">{item.item_name}</p>
                  {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{item.hsn_sac || "—"}</TableCell>
                <TableCell className="text-right text-sm">{item.quantity}</TableCell>
                <TableCell className="text-right text-sm">{formatCurrency(item.rate)}</TableCell>
                <TableCell className="text-right text-sm">{formatCurrency(item.amount)}</TableCell>
                {isSameState ? (
                  <>
                    <TableCell className="text-right text-xs">{formatCurrency(item.cgst_amount)}<br /><span className="text-muted-foreground">({item.gst_rate / 2}%)</span></TableCell>
                    <TableCell className="text-right text-xs">{formatCurrency(item.sgst_amount)}<br /><span className="text-muted-foreground">({item.gst_rate / 2}%)</span></TableCell>
                  </>
                ) : (
                  <TableCell className="text-right text-xs">{formatCurrency(item.igst_amount)}<br /><span className="text-muted-foreground">({item.gst_rate}%)</span></TableCell>
                )}
                <TableCell className="text-right font-semibold text-sm">{formatCurrency(item.total)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex justify-between items-start gap-6">
          <div className="flex-1 text-xs">
            <p className="font-bold text-foreground mb-1">Amount in Words:</p>
            <p className="text-muted-foreground italic">{amountInWords(invoice.total)}</p>
          </div>
          <div className="w-72 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatCurrency(invoice.subtotal)}</span></div>
            {invoice.cgst > 0 && <div className="flex justify-between"><span className="text-muted-foreground">CGST</span><span>{formatCurrency(invoice.cgst)}</span></div>}
            {invoice.sgst > 0 && <div className="flex justify-between"><span className="text-muted-foreground">SGST</span><span>{formatCurrency(invoice.sgst)}</span></div>}
            {invoice.igst > 0 && <div className="flex justify-between"><span className="text-muted-foreground">IGST</span><span>{formatCurrency(invoice.igst)}</span></div>}
            <div className="flex justify-between border-t pt-2 text-base font-bold">
              <span>Grand Total</span><span>{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-xs font-bold uppercase mb-2 tracking-wider" style={{ color: "hsl(263 70% 50%)" }}>Bank Details</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <span className="font-bold text-foreground">Bank</span><span className="text-muted-foreground">{COMPANY.bank.name}</span>
            <span className="font-bold text-foreground">Account Name</span><span className="text-muted-foreground">{COMPANY.bank.accountName}</span>
            <span className="font-bold text-foreground">Account Number</span><span className="text-muted-foreground">{COMPANY.bank.accountNumber}</span>
            <span className="font-bold text-foreground">IFSC</span><span className="text-muted-foreground">{COMPANY.bank.ifsc}</span>
            <span className="font-bold text-foreground">Account Type</span><span className="text-muted-foreground">{COMPANY.bank.accountType}</span>
            {(() => {
              const upi = localStorage.getItem("aievoked_upi_id") || COMPANY.bank.upiId;
              return upi ? (
                <>
                  <span className="font-bold text-foreground">UPI ID</span><span className="text-muted-foreground">{upi}</span>
                </>
              ) : null;
            })()}
          </div>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p className="font-bold text-foreground text-xs uppercase tracking-wider mb-1">Terms & Conditions</p>
          {(invoice.terms_and_conditions || "").split("\n").filter(Boolean).map((line, i) => (
            <p key={i}>{line}</p>
          ))}
          {invoice.notes && <p className="mt-2 italic">Note: {invoice.notes}</p>}
        </div>

        <div className="flex justify-between items-end pt-4 border-t">
          <div className="text-xs text-muted-foreground">
            <p>Receiver's Signature</p>
            <div className="mt-8 w-40 border-t border-foreground/30" />
          </div>
          <div className="text-xs text-right">
            <p className="font-bold text-foreground">For {COMPANY.shortName}</p>
            <div className="mt-8 w-40 border-t border-foreground/30 ml-auto" />
            <p className="text-muted-foreground mt-1">Authorised Signatory</p>
          </div>
        </div>

        <div className="text-center text-xs text-muted-foreground space-y-1 pt-3 border-t">
          <p>For any enquiry, reach out via email at <strong>{COMPANY.email}</strong> or call on <strong>{COMPANY.phone}</strong></p>
          <p className="italic">This is a computer-generated invoice and does not require a physical signature.</p>
        </div>
      </div>

      {/* Payment History */}
      {(payments.length > 0 || balance > 0) && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length > 0 ? (
              <div className="space-y-2">
                {payments.map((p) => (
                  <div key={p.id} className="flex justify-between text-sm border-b pb-2">
                    <div>
                      <p className="font-medium">{formatCurrency(p.amount)} via {p.mode}</p>
                      <p className="text-xs text-muted-foreground">{new Date(p.payment_date).toLocaleDateString("en-IN")} {p.reference && `• Ref: ${p.reference}`}</p>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between font-semibold text-sm pt-2">
                  <span>Balance Due</span>
                  <span className={balance > 0 ? "text-warning" : "text-success"}>{formatCurrency(Math.max(0, balance))}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No payments recorded yet. Balance: {formatCurrency(balance)}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function RecordPaymentDialog({ invoiceId, balance, onSaved }: { invoiceId: string; balance: number; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(balance));
  const [mode, setMode] = useState("Bank Transfer");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [reference, setReference] = useState("");

  async function handleSave() {
    if (Number(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    const payment: Payment = {
      id: crypto.randomUUID(),
      invoice_id: invoiceId,
      payment_date: date,
      amount: Number(amount),
      mode,
      reference,
      notes: "",
      created_at: new Date().toISOString(),
    };
    await savePayment(payment);
    toast.success("Payment recorded successfully");
    setOpen(false);
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-primary-foreground">
          <CreditCard className="mr-1 h-3 w-3" /> Record Payment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Amount (₹)</Label>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <Label>Payment Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <Label>Payment Mode</Label>
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAYMENT_MODES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Reference / UTR</Label>
            <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Optional" />
          </div>
          <Button onClick={handleSave} className="w-full bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-primary-foreground">
            Record Payment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
