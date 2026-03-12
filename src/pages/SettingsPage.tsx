import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { COMPANY } from "@/lib/constants";
import { toast } from "sonner";
import { Upload } from "lucide-react";

export default function SettingsPage() {
  const [company, setCompany] = useState({ ...COMPANY });
  const [logoPreview, setLogoPreview] = useState<string | null>(
    localStorage.getItem("aievoked_logo") || null
  );

  const handleSave = () => {
    toast.success("Settings saved");
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      localStorage.setItem("aievoked_logo", base64);
      setLogoPreview(base64);
      toast.success("Logo uploaded");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <Tabs defaultValue="company">
        <TabsList>
          <TabsTrigger value="company">Company Details</TabsTrigger>
          <TabsTrigger value="bank">Bank Details</TabsTrigger>
          <TabsTrigger value="preferences">Invoice Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-4 mt-4">
          <Card className="shadow-sm">
            <CardHeader><CardTitle className="text-base">Company Information</CardTitle></CardHeader>
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
              <Button onClick={handleSave}>Save Company Details</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bank" className="space-y-4 mt-4">
          <Card className="shadow-sm">
            <CardHeader><CardTitle className="text-base">Bank Details</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div><Label>Bank Name</Label><Input value={company.bank.name} onChange={(e) => setCompany({ ...company, bank: { ...company.bank, name: e.target.value } })} /></div>
              <div><Label>Account Name</Label><Input value={company.bank.accountName} onChange={(e) => setCompany({ ...company, bank: { ...company.bank, accountName: e.target.value } })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Account Number</Label><Input value={company.bank.accountNumber} onChange={(e) => setCompany({ ...company, bank: { ...company.bank, accountNumber: e.target.value } })} /></div>
                <div><Label>IFSC</Label><Input value={company.bank.ifsc} onChange={(e) => setCompany({ ...company, bank: { ...company.bank, ifsc: e.target.value } })} /></div>
              </div>
              <div><Label>Account Type</Label><Input value={company.bank.accountType} onChange={(e) => setCompany({ ...company, bank: { ...company.bank, accountType: e.target.value } })} /></div>
              <Button onClick={handleSave}>Save Bank Details</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4 mt-4">
          <Card className="shadow-sm">
            <CardHeader><CardTitle className="text-base">Logo</CardTitle></CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                {logoPreview ? (
                  <div className="space-y-3">
                    <img src={logoPreview} alt="Logo" className="h-16 mx-auto object-contain" />
                    <p className="text-xs text-muted-foreground">Current logo</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Upload your company logo</p>
                  </div>
                )}
                <label className="mt-3 inline-block">
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  <Button variant="outline" size="sm" asChild>
                    <span>Choose File</span>
                  </Button>
                </label>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader><CardTitle className="text-base">Default GST Rate</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Default GST rate: 18%. This can be changed per line item when creating invoices.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
