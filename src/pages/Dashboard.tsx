import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { getInvoices, getClients } from "@/lib/store";
import { formatCurrency } from "@/lib/constants";
import { Plus, Users, FileText, IndianRupee, AlertCircle } from "lucide-react";
import { useMemo } from "react";

export default function Dashboard() {
  const invoices = getInvoices();
  const clients = getClients();

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const fyStart = now.getMonth() >= 3 ? new Date(thisYear, 3, 1) : new Date(thisYear - 1, 3, 1);

    const fyInvoices = invoices.filter((i) => new Date(i.invoice_date) >= fyStart);
    const monthInvoices = invoices.filter((i) => {
      const d = new Date(i.invoice_date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });

    return {
      totalFY: fyInvoices.reduce((s, i) => s + i.total, 0),
      totalMonth: monthInvoices.reduce((s, i) => s + i.total, 0),
      paid: invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0),
      unpaid: invoices.filter((i) => i.status === "unpaid" || i.status === "overdue").reduce((s, i) => s + i.total, 0),
      overdue: invoices.filter((i) => i.status === "overdue").length,
    };
  }, [invoices]);

  const recentInvoices = invoices
    .sort((a, b) => new Date(b.invoice_date).getTime() - new Date(a.invoice_date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/invoices/new">
              <Plus className="mr-1 h-4 w-4" /> New Invoice
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/clients">
              <Users className="mr-1 h-4 w-4" /> Clients
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalMonth)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This FY</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalFY)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Paid</CardTitle>
            <IndianRupee className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatCurrency(stats.paid)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unpaid</CardTitle>
            <AlertCircle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{formatCurrency(stats.unpaid)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentInvoices.map((inv) => {
              const client = clients.find((c) => c.id === inv.client_id);
              return (
                <Link
                  key={inv.id}
                  to={`/invoices/${inv.id}`}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm">{inv.invoice_number}</p>
                    <p className="text-xs text-muted-foreground">{client?.company_name || client?.name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-sm">{formatCurrency(inv.total)}</span>
                    <StatusBadge status={inv.status} />
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
