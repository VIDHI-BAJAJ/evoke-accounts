import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getInvoices, getClients, deleteInvoice } from "@/lib/store";
import { formatCurrency } from "@/lib/constants";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  FileText,
  IndianRupee,
  Clock,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import { toast } from "sonner";
import { Invoice } from "@/lib/types";

type StatusFilter = "all" | "draft" | "unpaid" | "paid" | "overdue";
type SortField = "invoice_number" | "invoice_date" | "due_date" | "client" | "total" | "status";
type SortDir = "asc" | "desc";

export default function InvoiceList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: invoices = [], isLoading } = useQuery({ queryKey: ["invoices"], queryFn: getInvoices });
  const { data: clients = [] } = useQuery({ queryKey: ["clients"], queryFn: getClients });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortField, setSortField] = useState<SortField>("invoice_date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const clientMap = useMemo(
    () => Object.fromEntries(clients.map((c) => [c.id, c.company_name || c.name])),
    [clients]
  );

  const stats = useMemo(() => {
    const paid = invoices.filter((i) => i.status === "paid");
    const unpaid = invoices.filter((i) => i.status === "unpaid");
    const overdue = invoices.filter((i) => i.status === "overdue");
    const draft = invoices.filter((i) => i.status === "draft");
    return {
      total: invoices.length,
      paid: { count: paid.length, amount: paid.reduce((s, i) => s + i.total, 0) },
      unpaid: { count: unpaid.length, amount: unpaid.reduce((s, i) => s + i.total, 0) },
      overdue: { count: overdue.length, amount: overdue.reduce((s, i) => s + i.total, 0) },
      draft: { count: draft.length },
    };
  }, [invoices]);

  const filtered = useMemo(() => {
    let list = [...invoices];

    if (statusFilter !== "all") {
      list = list.filter((i) => i.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.invoice_number.toLowerCase().includes(q) ||
          (clientMap[i.client_id] || "").toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      let aVal: string | number = "";
      let bVal: string | number = "";

      if (sortField === "client") {
        aVal = clientMap[a.client_id] || "";
        bVal = clientMap[b.client_id] || "";
      } else if (sortField === "total") {
        aVal = a.total;
        bVal = b.total;
      } else if (sortField === "status") {
        aVal = a.status;
        bVal = b.status;
      } else {
        aVal = (a as Record<string, string | number>)[sortField] || "";
        bVal = (b as Record<string, string | number>)[sortField] || "";
      }

      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [invoices, statusFilter, search, sortField, sortDir, clientMap]);

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    await deleteInvoice(deleteId);
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
    toast.success("Invoice deleted");
    setDeleteId(null);
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground/50" />;
    return sortDir === "asc" ? (
      <ChevronUp className="h-3.5 w-3.5 text-primary" />
    ) : (
      <ChevronDown className="h-3.5 w-3.5 text-primary" />
    );
  }

  const statusTabs: { value: StatusFilter; label: string; count: number }[] = [
    { value: "all", label: "All", count: stats.total },
    { value: "unpaid", label: "Unpaid", count: stats.unpaid.count },
    { value: "overdue", label: "Overdue", count: stats.overdue.count },
    { value: "paid", label: "Paid", count: stats.paid.count },
    { value: "draft", label: "Draft", count: stats.draft.count },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {stats.total} invoice{stats.total !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button
          onClick={() => navigate("/invoices/new")}
          className="bg-gradient-to-r from-primary to-violet-700 hover:from-violet-700 hover:to-primary text-primary-foreground shadow-md"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Invoice
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="shadow-sm">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Billed</p>
                <p className="text-lg font-bold mt-0.5">
                  {formatCurrency(invoices.reduce((s, i) => s + i.total, 0))}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Paid</p>
                <p className="text-lg font-bold mt-0.5 text-green-600">
                  {formatCurrency(stats.paid.amount)}
                </p>
                <p className="text-xs text-muted-foreground">{stats.paid.count} invoice{stats.paid.count !== 1 ? "s" : ""}</p>
              </div>
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Outstanding</p>
                <p className="text-lg font-bold mt-0.5 text-amber-600">
                  {formatCurrency(stats.unpaid.amount)}
                </p>
                <p className="text-xs text-muted-foreground">{stats.unpaid.count} invoice{stats.unpaid.count !== 1 ? "s" : ""}</p>
              </div>
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <IndianRupee className="h-4 w-4 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Overdue</p>
                <p className="text-lg font-bold mt-0.5 text-red-600">
                  {formatCurrency(stats.overdue.amount)}
                </p>
                <p className="text-xs text-muted-foreground">{stats.overdue.count} invoice{stats.overdue.count !== 1 ? "s" : ""}</p>
              </div>
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <Clock className="h-4 w-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Status Tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg flex-wrap">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                statusFilter === tab.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              <span
                className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  statusFilter === tab.value
                    ? "bg-primary/10 text-primary"
                    : "bg-muted-foreground/20 text-muted-foreground"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative sm:ml-auto w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoice # or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <Card className="shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  <button
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                    onClick={() => handleSort("invoice_number")}
                  >
                    Invoice # <SortIcon field="invoice_number" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  <button
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                    onClick={() => handleSort("client")}
                  >
                    Client <SortIcon field="client" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">
                  <button
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                    onClick={() => handleSort("invoice_date")}
                  >
                    Date <SortIcon field="invoice_date" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">
                  <button
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                    onClick={() => handleSort("due_date")}
                  >
                    Due Date <SortIcon field="due_date" />
                  </button>
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  <button
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                    onClick={() => handleSort("status")}
                  >
                    Status <SortIcon field="status" />
                  </button>
                </th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                  <button
                    className="flex items-center gap-1 hover:text-foreground transition-colors ml-auto"
                    onClick={() => handleSort("total")}
                  >
                    Amount <SortIcon field="total" />
                  </button>
                </th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-muted animate-pulse rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <FileText className="h-10 w-10 opacity-30" />
                      <p className="font-medium">No invoices found</p>
                      <p className="text-sm">
                        {search || statusFilter !== "all"
                          ? "Try adjusting your filters"
                          : "Create your first invoice to get started"}
                      </p>
                      {!search && statusFilter === "all" && (
                        <Button size="sm" className="mt-2" onClick={() => navigate("/invoices/new")}>
                          <Plus className="mr-1.5 h-3.5 w-3.5" /> New Invoice
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((invoice) => (
                  <InvoiceRow
                    key={invoice.id}
                    invoice={invoice}
                    clientName={clientMap[invoice.client_id] || "—"}
                    onView={() => navigate(`/invoices/${invoice.id}`)}
                    onEdit={() => navigate(`/invoices/${invoice.id}/edit`)}
                    onDelete={() => setDeleteId(invoice.id)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Showing {filtered.length} of {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
            </span>
            <span className="font-medium text-foreground">
              Filtered total: {formatCurrency(filtered.reduce((s, i) => s + i.total, 0))}
            </span>
          </div>
        )}
      </Card>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the invoice. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function InvoiceRow({
  invoice,
  clientName,
  onView,
  onEdit,
  onDelete,
}: {
  invoice: Invoice;
  clientName: string;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isOverdue =
    invoice.status === "unpaid" &&
    invoice.due_date &&
    new Date(invoice.due_date) < new Date();

  const displayStatus = isOverdue ? "overdue" : invoice.status;

  return (
    <tr
      className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
      onClick={onView}
    >
      <td className="px-4 py-3 font-medium text-primary">{invoice.invoice_number}</td>
      <td className="px-4 py-3 text-foreground">{clientName}</td>
      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
        {invoice.invoice_date
          ? new Date(invoice.invoice_date).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "—"}
      </td>
      <td className="px-4 py-3 hidden lg:table-cell">
        {invoice.due_date ? (
          <span className={isOverdue ? "text-red-600 font-medium" : "text-muted-foreground"}>
            {new Date(invoice.due_date).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={displayStatus} />
      </td>
      <td className="px-4 py-3 text-right font-semibold tabular-nums">
        {formatCurrency(invoice.total)}
      </td>
      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onView}>
              <Eye className="mr-2 h-4 w-4" /> View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}
