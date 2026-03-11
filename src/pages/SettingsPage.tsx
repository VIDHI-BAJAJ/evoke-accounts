import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { COMPANY } from "@/lib/constants";
import { toast } from "sonner";

export default function SettingsPage() {
  const [company, setCompany] = useState({ ...COMPANY });

  const handleSave = () => {
    toast.success("Settings saved (changes are session-only in demo mode)");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Card>
        <CardHeader><CardTitle>Company Details</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><Label>Company Name</Label><Input value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} /></div>
          <div><Label>Address</Label><Input value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>GSTIN</Label><Input value={company.gstin} onChange={(e) => setCompany({ ...company, gstin: e.target.value })} /></div>
            <div><Label>PAN</Label><Input value={company.pan} onChange={(e) => setCompany({ ...company, pan: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Email</Label><Input value={company.email} onChange={(e) => setCompany({ ...company, email: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={company.phone} onChange={(e) => setCompany({ ...company, phone: e.target.value })} /></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Bank Details</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><Label>Bank Name</Label><Input value={company.bank.name} onChange={(e) => setCompany({ ...company, bank: { ...company.bank, name: e.target.value } })} /></div>
          <div><Label>Account Name</Label><Input value={company.bank.accountName} onChange={(e) => setCompany({ ...company, bank: { ...company.bank, accountName: e.target.value } })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Account Number</Label><Input value={company.bank.accountNumber} onChange={(e) => setCompany({ ...company, bank: { ...company.bank, accountNumber: e.target.value } })} /></div>
            <div><Label>IFSC</Label><Input value={company.bank.ifsc} onChange={(e) => setCompany({ ...company, bank: { ...company.bank, ifsc: e.target.value } })} /></div>
          </div>
          <div><Label>Account Type</Label><Input value={company.bank.accountType} onChange={(e) => setCompany({ ...company, bank: { ...company.bank, accountType: e.target.value } })} /></div>
        </CardContent>
      </Card>

      <Button onClick={handleSave}>Save Settings</Button>
    </div>
  );
}
