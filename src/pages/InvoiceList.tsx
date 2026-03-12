import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { getInvoices, getClients, deleteInvoice } from "@/lib/store";
import { formatCurrency } from "@/lib/constants";
import { Plus, Search, Eye, Pencil, Trash2, FileText } from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function InvoiceList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [, setRefresh] = useState(0);

  const invoices = getInvoices();
  const clients = getClients();

  const filtered = invoices
    .filter((inv) => {
      const client = clients.find((c) => c.id === inv.client_id);
      const matchSearch =
        inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
        client?.company_name?.toLowerCase().includes(search.toLowerCase()) ||
        client?.name?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || inv.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      // Sort by invoice number numerically
      const numA = parseInt(a.invoice_number.split("/").pop() || "0", 10);
      const numB = parseInt(b.invoice_number.split("/").pop() || "0", 10);
      return numA - numB;
    });

  const handleDelete = (id: string) => {
    if (confirm("Delete this invoice?")) {
      deleteInvoice(id);
      setRefresh((r) => r + 1);
      toast.success("Invoice deleted");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">All Invoices</h2>
        <Button asChild className="bg-gradient-to-r from-primary to-violet-700 hover:from-violet-700 hover:to-primary text-primary-foreground shadow-md">
          <Link to="/invoices/new"><Plus className="mr-1 h-4 w-4" /> New Invoice</Link>
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardContent className="pt-4">
          <div className="flex gap-3 flex-wrap mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search invoices..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice No</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((inv) => {
                  const client = clients.find((c) => c.id === inv.client_id);
                  return (
                    <TableRow key={inv.id} className="group hover:bg-muted/50">
                      <TableCell className="font-medium">{inv.invoice_number}</TableCell>
                      <TableCell>{client?.company_name || client?.name || "—"}</TableCell>
                      <TableCell>{new Date(inv.invoice_date).toLocaleDateString("en-IN")}</TableCell>
                      <TableCell>{inv.due_date ? new Date(inv.due_date).toLocaleDateString("en-IN") : "—"}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(inv.total)}</TableCell>
                      <TableCell><StatusBadge status={inv.status} /></TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/invoices/${inv.id}`}><Eye className="h-4 w-4" /></Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/invoices/${inv.id}/edit`}><Pencil className="h-4 w-4" /></Link>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(inv.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-muted-foreground">No invoices yet. Create your first invoice.</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile card list */}
          <div className="md:hidden space-y-3">
            {filtered.map((inv) => {
              const client = clients.find((c) => c.id === inv.client_id);
              return (
                <Link
                  key={inv.id}
                  to={`/invoices/${inv.id}`}
                  className="block rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{inv.invoice_number}</span>
                    <StatusBadge status={inv.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">{client?.company_name || client?.name}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">{new Date(inv.invoice_date).toLocaleDateString("en-IN")}</span>
                    <span className="font-semibold text-sm">{formatCurrency(inv.total)}</span>
                  </div>
                </Link>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">No invoices yet. Create your first invoice.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
