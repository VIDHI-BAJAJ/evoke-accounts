import { useParams, Link } from "react-router-dom";
import { getClient, getInvoicesForClient } from "@/lib/store";
import { formatCurrency } from "@/lib/constants";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ClientDetail() {
  const { id } = useParams();
  const client = id ? getClient(id) : undefined;

  if (!client) {
    return <div className="text-center py-20 text-muted-foreground">Client not found</div>;
  }

  const invoices = getInvoicesForClient(client.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/clients"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-2xl font-bold">{client.company_name || client.name}</h1>
      </div>

      <Card>
        <CardHeader><CardTitle>Client Details</CardTitle></CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            {client.name && <div><span className="text-muted-foreground">Contact: </span>{client.name}</div>}
            {client.email && <div><span className="text-muted-foreground">Email: </span>{client.email}</div>}
            {client.phone && <div><span className="text-muted-foreground">Phone: </span>{client.phone}</div>}
            <div><span className="text-muted-foreground">State: </span>{client.state_name} ({client.state_code})</div>
            {client.gstin && <div><span className="text-muted-foreground">GSTIN: </span>{client.gstin}</div>}
            {client.address && <div><span className="text-muted-foreground">Address: </span>{[client.address, client.city, client.pin].filter(Boolean).join(", ")}</div>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Invoice History ({invoices.length})</CardTitle></CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice No</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell>
                      <Link to={`/invoices/${inv.id}`} className="font-medium text-primary hover:underline">{inv.invoice_number}</Link>
                    </TableCell>
                    <TableCell>{new Date(inv.invoice_date).toLocaleDateString("en-IN")}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(inv.total)}</TableCell>
                    <TableCell><StatusBadge status={inv.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-sm">No invoices yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
