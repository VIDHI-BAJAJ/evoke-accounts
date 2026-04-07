import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getClients, saveClient, archiveClient, getInvoicesForClient } from "@/lib/store";
import { INDIAN_STATES } from "@/lib/constants";
import { Client } from "@/lib/types";
import { Plus, Search, Eye, Archive, Pencil, Users, Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function ClientList() {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const queryClient = useQueryClient();

  const { data: allClients = [] } = useQuery({ queryKey: ["clients"], queryFn: getClients });
  const clients = allClients.filter((c) => !c.is_archived);

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company_name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleArchive = async (id: string) => {
    await archiveClient(id);
    queryClient.invalidateQueries({ queryKey: ["clients"] });
    toast.success("Client archived");
  };

  const getInitials = (c: Client) => {
    const name = c.company_name || c.name;
    return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  };

  const colors = ["bg-violet-500", "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-cyan-500"];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Clients</h2>
        <ClientFormDialog onSaved={() => queryClient.invalidateQueries({ queryKey: ["clients"] })} />
      </div>

      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search clients..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex border rounded-lg overflow-hidden">
          <button onClick={() => setViewMode("grid")} className={`px-3 py-2 text-xs font-medium transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"}`}>Grid</button>
          <button onClick={() => setViewMode("table")} className={`px-3 py-2 text-xs font-medium transition-colors ${viewMode === "table" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"}`}>Table</button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">No clients yet. Add your first client.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c, i) => (
            <ClientCard
              key={c.id}
              client={c}
              colorClass={colors[i % colors.length]}
              getInitials={getInitials}
              onArchive={handleArchive}
              onSaved={() => queryClient.invalidateQueries({ queryKey: ["clients"] })}
            />
          ))}
        </div>
      ) : (
        <Card className="shadow-sm">
          <CardContent className="pt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-2 px-3 font-medium">Name</th>
                    <th className="text-left py-2 px-3 font-medium">Company</th>
                    <th className="text-left py-2 px-3 font-medium">Email</th>
                    <th className="text-left py-2 px-3 font-medium">Phone</th>
                    <th className="text-left py-2 px-3 font-medium">State</th>
                    <th className="text-right py-2 px-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className="border-b hover:bg-muted/50 group">
                      <td className="py-2 px-3 font-medium">{c.name || "—"}</td>
                      <td className="py-2 px-3">{c.company_name || "—"}</td>
                      <td className="py-2 px-3">{c.email || "—"}</td>
                      <td className="py-2 px-3">{c.phone || "—"}</td>
                      <td className="py-2 px-3">{c.state_name}</td>
                      <td className="py-2 px-3">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                            <Link to={`/clients/${c.id}`}><Eye className="h-3.5 w-3.5" /></Link>
                          </Button>
                          <ClientFormDialog client={c} onSaved={() => queryClient.invalidateQueries({ queryKey: ["clients"] })} />
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleArchive(c.id)}>
                            <Archive className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ClientCard({ client: c, colorClass, getInitials, onArchive, onSaved }: {
  client: Client;
  colorClass: string;
  getInitials: (c: Client) => string;
  onArchive: (id: string) => void;
  onSaved: () => void;
}) {
  const { data: invoices = [] } = useQuery({
    queryKey: ["invoices-for-client", c.id],
    queryFn: () => getInvoicesForClient(c.id),
  });

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow group">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <div className={`h-10 w-10 rounded-full ${colorClass} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
            {getInitials(c)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{c.company_name || c.name}</p>
            {c.name && c.company_name && <p className="text-xs text-muted-foreground truncate">{c.name}</p>}
          </div>
        </div>
        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
          {c.email && <p className="flex items-center gap-1.5 truncate"><Mail className="h-3 w-3 shrink-0" />{c.email}</p>}
          {c.phone && <p className="flex items-center gap-1.5"><Phone className="h-3 w-3 shrink-0" />{c.phone}</p>}
          <p className="flex items-center gap-1.5"><MapPin className="h-3 w-3 shrink-0" />{c.state_name} ({c.state_code})</p>
        </div>
        <div className="flex items-center justify-between mt-4 pt-3 border-t">
          <span className="text-xs text-muted-foreground">{invoices.length} invoice{invoices.length !== 1 ? "s" : ""}</span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
              <Link to={`/clients/${c.id}`}><Eye className="h-3.5 w-3.5" /></Link>
            </Button>
            <ClientFormDialog client={c} onSaved={onSaved} />
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onArchive(c.id)}>
              <Archive className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ClientFormDialog({ client, onSaved }: { client?: Client; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(client?.name || "");
  const [companyName, setCompanyName] = useState(client?.company_name || "");
  const [email, setEmail] = useState(client?.email || "");
  const [phone, setPhone] = useState(client?.phone || "");
  const [address, setAddress] = useState(client?.address || "");
  const [city, setCity] = useState(client?.city || "");
  const [stateCode, setStateCode] = useState(client?.state_code || "07");
  const [pin, setPin] = useState(client?.pin || "");
  const [gstin, setGstin] = useState(client?.gstin || "");
  const [pan, setPan] = useState(client?.pan || "");

  const selectedState = INDIAN_STATES.find((s) => s.code === stateCode);

  async function handleSave() {
    const c: Client = {
      id: client?.id || crypto.randomUUID(),
      name,
      company_name: companyName,
      email,
      phone,
      address,
      city,
      state_name: selectedState?.name || "",
      state_code: stateCode,
      pin,
      gstin,
      pan,
      country: "India",
      is_archived: false,
      created_at: client?.created_at || new Date().toISOString(),
    };
    await saveClient(c);
    toast.success(client ? "Client updated" : "Client added");
    setOpen(false);
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {client ? (
          <Button variant="ghost" size="icon" className="h-7 w-7"><Pencil className="h-3.5 w-3.5" /></Button>
        ) : (
          <Button className="bg-gradient-to-r from-primary to-violet-700 hover:from-violet-700 hover:to-primary text-primary-foreground shadow-md">
            <Plus className="mr-1 h-4 w-4" /> Add Client
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{client ? "Edit Client" : "Add Client"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Contact Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div><Label>Company Name</Label><Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" /></div>
            <div><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          </div>
          <div><Label>Address</Label><Input value={address} onChange={(e) => setAddress(e.target.value)} /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>City</Label><Input value={city} onChange={(e) => setCity(e.target.value)} /></div>
            <div>
              <Label>State</Label>
              <Select value={stateCode} onValueChange={setStateCode}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {INDIAN_STATES.map((s) => <SelectItem key={s.code} value={s.code}>{s.name} ({s.code})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>PIN</Label><Input value={pin} onChange={(e) => setPin(e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>GSTIN</Label><Input value={gstin} onChange={(e) => setGstin(e.target.value)} placeholder="Optional" /></div>
            <div><Label>PAN</Label><Input value={pan} onChange={(e) => setPan(e.target.value)} placeholder="Optional" /></div>
          </div>
          <Button onClick={handleSave} className="w-full bg-gradient-to-r from-primary to-violet-700 hover:from-violet-700 hover:to-primary text-primary-foreground">
            {client ? "Update" : "Add"} Client
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
