import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { getInvoices, getClients } from "@/lib/store";
import { formatCurrency } from "@/lib/constants";
import { Plus, Users, FileText, IndianRupee, AlertCircle, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

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
    };
  }, [invoices]);

  const chartData = useMemo(() => {
    const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
    const now = new Date();
    const fyStartYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
    return months.map((name, i) => {
      const monthIdx = (i + 3) % 12;
      const year = monthIdx < 3 ? fyStartYear + 1 : fyStartYear;
      const total = invoices
        .filter((inv) => {
          const d = new Date(inv.invoice_date);
          return d.getMonth() === monthIdx && d.getFullYear() === year;
        })
        .reduce((s, inv) => s + inv.total, 0);
      return { name, total };
    });
  }, [invoices]);

  const recentInvoices = invoices
    .sort((a, b) => new Date(b.invoice_date).getTime() - new Date(a.invoice_date).getTime())
    .slice(0, 5);

  const statCards = [
    { label: "This Month", value: stats.totalMonth, icon: FileText, color: "text-primary" },
    { label: "This FY", value: stats.totalFY, icon: TrendingUp, color: "text-primary" },
    { label: "Paid", value: stats.paid, icon: IndianRupee, color: "text-success" },
    { label: "Unpaid", value: stats.unpaid, icon: AlertCircle, color: "text-warning" },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Overview</h2>
        <div className="flex gap-2">
          <Button asChild className="bg-gradient-to-r from-primary to-violet-700 hover:from-violet-700 hover:to-primary text-primary-foreground shadow-md">
            <Link to="/invoices/new">
              <Plus className="mr-1 h-4 w-4" /> New Invoice
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/clients">
              <Users className="mr-1 h-4 w-4" /> Add Client
            </Link>
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.label} className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${s.color === "text-primary" ? "" : s.color}`}>
                    {formatCurrency(s.value)}
                  </p>
                </div>
                <div className={`p-2.5 rounded-xl bg-muted ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two column layout */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Recent Invoices */}
        <Card className="lg:col-span-3 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Invoices</CardTitle>
              <Button asChild variant="ghost" size="sm" className="text-primary">
                <Link to="/invoices">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentInvoices.length > 0 ? (
              <div className="space-y-2">
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
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">No invoices yet. Create your first invoice.</p>
                <Button asChild variant="outline" size="sm" className="mt-3">
                  <Link to="/invoices/new">Create Invoice</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                  contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", fontSize: 12 }}
                />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
