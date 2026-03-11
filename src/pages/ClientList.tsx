import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getClients, saveClient, archiveClient } from "@/lib/store";
import { INDIAN_STATES } from "@/lib/constants";
import { Client } from "@/lib/types";
import { Plus, Search, Eye, Archive, Pencil } from "lucide-react";
import { toast } from "sonner";

export default function ClientList() {
  const [search, setSearch] = useState("");
  const [, setRefresh] = useState(0);

  const clients = getClients().filter((c) => !c.is_archived);

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company_name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleArchive = (id: string) => {
    archiveClient(id);
    setRefresh((r) => r + 1);
    toast.success("Client archived");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clients</h1>
        <ClientFormDialog onSaved={() => setRefresh((r) => r + 1)} />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search clients..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>State</TableHead>
              <TableHead>GSTIN</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name || "—"}</TableCell>
                <TableCell>{c.company_name || "—"}</TableCell>
                <TableCell className="text-sm">{c.email || "—"}</TableCell>
                <TableCell className="text-sm">{c.phone || "—"}</TableCell>
                <TableCell className="text-sm">{c.state_name}</TableCell>
                <TableCell className="text-xs font-mono">{c.gstin || "—"}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/clients/${c.id}`}><Eye className="h-4 w-4" /></Link>
                    </Button>
                    <ClientFormDialog client={c} onSaved={() => setRefresh((r) => r + 1)} />
                    <Button variant="ghost" size="icon" onClick={() => handleArchive(c.id)}>
                      <Archive className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No clients found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
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

  function handleSave() {
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
    saveClient(c);
    toast.success(client ? "Client updated" : "Client added");
    setOpen(false);
    onSaved();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {client ? (
          <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
        ) : (
          <Button><Plus className="mr-1 h-4 w-4" /> Add Client</Button>
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
          <Button onClick={handleSave} className="w-full">{client ? "Update" : "Add"} Client</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
