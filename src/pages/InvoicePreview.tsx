import { useParams, Link, useNavigate } from "react-router-dom";
import { getInvoice, getPayments, savePayment, getTotalPaid } from "@/lib/store";
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
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Payment } from "@/lib/types";
import logoColor from "@/assets/ai-evoked-logo.png";

export default function InvoicePreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [, setRefresh] = useState(0);

  const invoice = id ? getInvoice(id) : undefined;
  if (!invoice) {
    return <div className="text-center py-20 text-muted-foreground">Invoice not found</div>;
  }

  const client = invoice.client;
  const items = invoice.items || [];
  const payments = getPayments(invoice.id);
  const totalPaid = getTotalPaid(invoice.id);
  const balance = invoice.total - totalPaid;
  const isSameState = client?.state_code === COMPANY.stateCode;

  async function handleDownloadPDF() {
    const element = document.getElementById("invoice-print-area");
    if (!element) return;
    
    toast.info("Generating PDF...");
    
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        width: 794,
      });
      
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
    const text = `Hi ${clientName}, please find invoice ${invoice.invoice_number} for ${formatCurrency(invoice.total)} dated ${new Date(invoice.invoice_date).toLocaleDateString("en-IN")}. You can view it here: ${window.location.href}. Bank: Kotak Mahindra, A/C: ${COMPANY.bank.accountNumber}, IFSC: ${COMPANY.bank.ifsc}. Please feel free to reach out at ${COMPANY.email}`;
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
          <RecordPaymentDialog invoiceId={invoice.id} balance={balance} onSaved={() => setRefresh((r) => r + 1)} />
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
      <div id="invoice-print-area" className="print-area bg-card rounded-xl border shadow-sm p-10 space-y-6" style={{ width: 794, maxWidth: "100%", margin: "0 auto" }}>
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-primary">Invoice</h2>
            <p className="text-sm text-muted-foreground mt-1">{invoice.invoice_number}</p>
          </div>
          <img src={logoColor} alt="AI Evoked" className="h-14 w-14 rounded-lg" />
        </div>

        {/* Dates */}
        <div className="flex gap-8 text-sm">
          <div>
            <span className="text-muted-foreground">Invoice Date: </span>
            <span className="font-medium">{new Date(invoice.invoice_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
          </div>
          {invoice.due_date && (
            <div>
              <span className="text-muted-foreground">Due Date: </span>
              <span className="font-medium">{new Date(invoice.due_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
            </div>
          )}
        </div>

        {/* Billed By / To */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-primary/5 border border-primary/10 p-4">
            <p className="text-xs font-semibold text-primary uppercase mb-2">Billed By</p>
            <p className="font-semibold text-sm">{COMPANY.name}</p>
            <p className="text-xs text-muted-foreground mt-1">{COMPANY.address}</p>
            <p className="text-xs text-muted-foreground">GSTIN: {COMPANY.gstin}</p>
            <p className="text-xs text-muted-foreground">PAN: {COMPANY.pan}</p>
          </div>
          <div className="rounded-lg bg-muted p-4">
            <p className="text-xs font-semibold text-foreground uppercase mb-2">Billed To</p>
            {client && (
              <>
                <p className="font-semibold text-sm">
                  {client.name && client.company_name
                    ? `${client.name.toUpperCase()} - ${client.company_name.toUpperCase()}`
                    : (client.company_name || client.name).toUpperCase()}
                </p>
                {client.address && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Address: {[client.address, client.city, client.state_name, client.country, client.pin ? `- ${client.pin}` : ""].filter(Boolean).join(", ")}
                  </p>
                )}
                {client.gstin && <p className="text-xs text-muted-foreground">GSTIN: {client.gstin}</p>}
                {client.pan && <p className="text-xs text-muted-foreground">PAN: {client.pan}</p>}
                {client.email && <p className="text-xs text-muted-foreground">Email: {client.email}</p>}
                {client.phone && <p className="text-xs text-muted-foreground">Phone: {client.phone}</p>}
              </>
            )}
          </div>
        </div>

        {/* Supply info */}
        <div className="flex gap-8 text-xs text-muted-foreground border-t border-b py-2">
          <span>Country of Supply: India</span>
          <span>Place of Supply: {client?.state_name || "Delhi"} ({client?.state_code || "07"})</span>
        </div>

        {/* Items Table */}
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-xs">#</TableHead>
              <TableHead className="text-xs">Item</TableHead>
              <TableHead className="text-xs text-right">Qty</TableHead>
              <TableHead className="text-xs text-right">Rate</TableHead>
              <TableHead className="text-xs text-right">Amount</TableHead>
              {isSameState ? (
                <>
                  <TableHead className="text-xs text-right">CGST</TableHead>
                  <TableHead className="text-xs text-right">SGST</TableHead>
                </>
              ) : (
                <TableHead className="text-xs text-right">IGST</TableHead>
              )}
              <TableHead className="text-xs text-right">Total</TableHead>
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

        {/* Totals */}
        <div className="flex justify-end">
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

        {/* Bank Details */}
        <div className="rounded-lg border p-4">
          <p className="text-xs font-semibold uppercase mb-2 text-primary">Bank Details</p>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <span className="text-muted-foreground">Bank</span><span>{COMPANY.bank.name}</span>
            <span className="text-muted-foreground">Account Name</span><span>{COMPANY.bank.accountName}</span>
            <span className="text-muted-foreground">Account Number</span><span>{COMPANY.bank.accountNumber}</span>
            <span className="text-muted-foreground">IFSC</span><span>{COMPANY.bank.ifsc}</span>
            <span className="text-muted-foreground">Account Type</span><span>{COMPANY.bank.accountType}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground space-y-1 pt-4 border-t">
          <p>For any enquiry, reach out via email at {COMPANY.email}, call on {COMPANY.phone}</p>
          <p className="italic">This is an electronically generated document, no signature is required.</p>
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

  function handleSave() {
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
    savePayment(payment);
    toast.success("Payment recorded successfully");
    setOpen(false);
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-gradient-to-r from-primary to-violet-700 hover:from-violet-700 hover:to-primary text-primary-foreground">
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
          <Button onClick={handleSave} className="w-full bg-gradient-to-r from-primary to-violet-700 hover:from-violet-700 hover:to-primary text-primary-foreground">
            Record Payment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
