import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getClients, getInvoices, getInvoice, saveInvoice } from "@/lib/store";
import { GST_RATES, COMPANY, generateInvoiceNumber, formatCurrency } from "@/lib/constants";
import { Invoice, InvoiceItem } from "@/lib/types";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

function newItem(invoiceId: string): InvoiceItem {
  return {
    id: crypto.randomUUID(),
    invoice_id: invoiceId,
    item_name: "",
    description: "",
    gst_rate: 18,
    quantity: 1,
    rate: 0,
    amount: 0,
    cgst_amount: 0,
    sgst_amount: 0,
    igst_amount: 0,
    total: 0,
  };
}

export default function InvoiceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const clients = getClients().filter((c) => !c.is_archived);
  const existingInvoice = id ? getInvoice(id) : undefined;

  const invoiceId = existingInvoice?.id || crypto.randomUUID();

  const [invoiceNumber, setInvoiceNumber] = useState(
    existingInvoice?.invoice_number || generateInvoiceNumber(getInvoices())
  );
  const [invoiceDate, setInvoiceDate] = useState(
    existingInvoice?.invoice_date || format(new Date(), "yyyy-MM-dd")
  );
  const [dueDate, setDueDate] = useState(existingInvoice?.due_date || "");
  const [clientId, setClientId] = useState(existingInvoice?.client_id || "");
  const [notes, setNotes] = useState(existingInvoice?.notes || "");
  const [items, setItems] = useState<InvoiceItem[]>(
    existingInvoice?.items?.length ? existingInvoice.items : [newItem(invoiceId)]
  );

  const selectedClient = clients.find((c) => c.id === clientId);
  const isSameState = selectedClient?.state_code === COMPANY.stateCode;

  function recalcItem(item: InvoiceItem): InvoiceItem {
    const amount = item.quantity * item.rate;
    const gstAmount = (amount * item.gst_rate) / 100;
    const isIntra = selectedClient ? selectedClient.state_code === COMPANY.stateCode : true;
    return {
      ...item,
      amount,
      cgst_amount: isIntra ? gstAmount / 2 : 0,
      sgst_amount: isIntra ? gstAmount / 2 : 0,
      igst_amount: isIntra ? 0 : gstAmount,
      total: amount + gstAmount,
    };
  }

  function updateItem(index: number, field: string, value: string | number) {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, [field]: value };
        return recalcItem(updated);
      })
    );
  }

  function addItem() {
    setItems((prev) => [...prev, newItem(invoiceId)]);
  }

  function removeItem(index: number) {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  const recalcedItems = items.map(recalcItem);

  const totals = useMemo(() => {
    const subtotal = recalcedItems.reduce((s, i) => s + i.amount, 0);
    const cgst = recalcedItems.reduce((s, i) => s + i.cgst_amount, 0);
    const sgst = recalcedItems.reduce((s, i) => s + i.sgst_amount, 0);
    const igst = recalcedItems.reduce((s, i) => s + i.igst_amount, 0);
    const total = subtotal + cgst + sgst + igst;
    return { subtotal, cgst, sgst, igst, total };
  }, [recalcedItems]);

  function handleSave(status: "draft" | "unpaid") {
    if (!clientId) {
      toast.error("Please select a client");
      return;
    }
    if (recalcedItems.some((it) => !it.item_name || it.rate <= 0)) {
      toast.error("Please fill in all line items");
      return;
    }

    const invoice: Invoice = {
      id: invoiceId,
      invoice_number: invoiceNumber,
      invoice_date: invoiceDate,
      due_date: dueDate,
      client_id: clientId,
      status,
      subtotal: totals.subtotal,
      cgst: totals.cgst,
      sgst: totals.sgst,
      igst: totals.igst,
      total: totals.total,
      notes,
      created_at: existingInvoice?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const finalItems = recalcedItems.map((it) => ({ ...it, invoice_id: invoiceId }));
    saveInvoice(invoice, finalItems);
    toast.success(status === "draft" ? "Draft saved" : "Invoice saved");

    if (status === "unpaid") {
      navigate(`/invoices/${invoiceId}`);
    } else {
      navigate("/invoices");
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold">{id ? "Edit Invoice" : "Create Invoice"}</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label>Invoice Number</Label>
          <Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
        </div>
        <div>
          <Label>Invoice Date</Label>
          <Input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
        </div>
        <div>
          <Label>Due Date</Label>
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>
      </div>

      <div>
        <Label>Client</Label>
        <Select value={clientId} onValueChange={setClientId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a client" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.company_name || c.name} {c.state_code ? `(${c.state_name})` : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedClient && (
          <p className="text-xs text-muted-foreground mt-1">
            GST: {isSameState ? "CGST + SGST (Intra-state)" : "IGST (Inter-state)"} • {selectedClient.state_name} ({selectedClient.state_code})
          </p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Line Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((item, idx) => (
            <div key={item.id} className="grid gap-3 sm:grid-cols-12 items-end border-b pb-3 last:border-0">
              <div className="sm:col-span-3">
                <Label className="text-xs">Item Name</Label>
                <Input
                  value={item.item_name}
                  onChange={(e) => updateItem(idx, "item_name", e.target.value)}
                  placeholder="Service name"
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs">Description</Label>
                <Input
                  value={item.description}
                  onChange={(e) => updateItem(idx, "description", e.target.value)}
                  placeholder="Optional"
                />
              </div>
              <div className="sm:col-span-1">
                <Label className="text-xs">GST %</Label>
                <Select value={String(item.gst_rate)} onValueChange={(v) => updateItem(idx, "gst_rate", Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {GST_RATES.map((r) => <SelectItem key={r} value={String(r)}>{r}%</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-1">
                <Label className="text-xs">Qty</Label>
                <Input type="number" min={1} value={item.quantity} onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))} />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs">Rate (₹)</Label>
                <Input type="number" min={0} value={item.rate} onChange={(e) => updateItem(idx, "rate", Number(e.target.value))} />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs">Total</Label>
                <div className="h-10 flex items-center font-semibold text-sm">
                  {formatCurrency(recalcItem(item).total)}
                </div>
              </div>
              <div className="sm:col-span-1">
                <Button variant="ghost" size="icon" onClick={() => removeItem(idx)} disabled={items.length <= 1}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addItem}>
            <Plus className="mr-1 h-4 w-4" /> Add Item
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-end space-y-1 text-sm">
            <div className="flex justify-between w-64">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatCurrency(totals.subtotal)}</span>
            </div>
            {totals.cgst > 0 && (
              <>
                <div className="flex justify-between w-64">
                  <span className="text-muted-foreground">CGST</span>
                  <span>{formatCurrency(totals.cgst)}</span>
                </div>
                <div className="flex justify-between w-64">
                  <span className="text-muted-foreground">SGST</span>
                  <span>{formatCurrency(totals.sgst)}</span>
                </div>
              </>
            )}
            {totals.igst > 0 && (
              <div className="flex justify-between w-64">
                <span className="text-muted-foreground">IGST</span>
                <span>{formatCurrency(totals.igst)}</span>
              </div>
            )}
            <div className="flex justify-between w-64 border-t pt-2 text-base font-bold">
              <span>Grand Total</span>
              <span>{formatCurrency(totals.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <Label>Notes</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes..." />
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => handleSave("draft")}>Save Draft</Button>
        <Button onClick={() => handleSave("unpaid")}>Save & Preview</Button>
      </div>
    </div>
  );
}
