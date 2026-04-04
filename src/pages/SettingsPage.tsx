import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { COMPANY } from "@/lib/constants";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";

export default function SettingsPage() {
  const [company, setCompany] = useState({ ...COMPANY });
  const [primaryLogo, setPrimaryLogo] = useState<string | null>(
    localStorage.getItem("aievoked_primary_logo") || null
  );
  const [secondaryLogo, setSecondaryLogo] = useState<string | null>(
    localStorage.getItem("aievoked_secondary_logo") || null
  );
  const [upiId, setUpiId] = useState(
    localStorage.getItem("aievoked_upi_id") || COMPANY.bank.upiId || ""
  );

  const handleSave = () => {
    toast.success("Settings saved");
  };

  const handleLogoUpload = (key: "primary" | "secondary") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const storageKey = key === "primary" ? "aievoked_primary_logo" : "aievoked_secondary_logo";
      localStorage.setItem(storageKey, base64);
      if (key === "primary") setPrimaryLogo(base64);
      else setSecondaryLogo(base64);
      toast.success(`${key === "primary" ? "Primary" : "Subsidiary"} logo uploaded`);
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = (key: "primary" | "secondary") => {
    const storageKey = key === "primary" ? "aievoked_primary_logo" : "aievoked_secondary_logo";
    localStorage.removeItem(storageKey);
    if (key === "primary") setPrimaryLogo(null);
    else setSecondaryLogo(null);
    toast.success("Logo removed");
  };

  const handleSaveUpi = () => {
    localStorage.setItem("aievoked_upi_id", upiId);
    toast.success("UPI ID saved");
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
              <div>
                <Label>UPI ID</Label>
                <Input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="e.g. aievoked@kotak" />
              </div>
              <Button onClick={() => { handleSave(); handleSaveUpi(); }}>Save Bank Details</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4 mt-4">
          <Card className="shadow-sm">
            <CardHeader><CardTitle className="text-base">Primary Logo (AI Evoked)</CardTitle></CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                {primaryLogo ? (
                  <div className="space-y-3">
                    <img src={primaryLogo} alt="Primary Logo" className="h-16 mx-auto object-contain" />
                    <p className="text-xs text-muted-foreground">Current primary logo</p>
                    <Button variant="ghost" size="sm" onClick={() => removeLogo("primary")} className="text-destructive">
                      <X className="mr-1 h-3 w-3" /> Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Upload your AI Evoked logo</p>
                    <p className="text-xs text-muted-foreground">Using default logo if not set</p>
                  </div>
                )}
                <label className="mt-3 inline-block">
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload("primary")} />
                  <Button variant="outline" size="sm" asChild>
                    <span>{primaryLogo ? "Change Logo" : "Choose File"}</span>
                  </Button>
                </label>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Subsidiary Logo (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">Add a second logo for your subsidiary company. It will appear alongside the primary logo on invoices.</p>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                {secondaryLogo ? (
                  <div className="space-y-3">
                    <img src={secondaryLogo} alt="Subsidiary Logo" className="h-16 mx-auto object-contain" />
                    <p className="text-xs text-muted-foreground">Current subsidiary logo</p>
                    <Button variant="ghost" size="sm" onClick={() => removeLogo("secondary")} className="text-destructive">
                      <X className="mr-1 h-3 w-3" /> Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Upload subsidiary company logo</p>
                  </div>
                )}
                <label className="mt-3 inline-block">
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload("secondary")} />
                  <Button variant="outline" size="sm" asChild>
                    <span>{secondaryLogo ? "Change Logo" : "Choose File"}</span>
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
