import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import logoWhite from "@/assets/ai-evoked-logo-white.png";

const DEMO_EMAIL = "admin@aievoked.com";
const DEMO_PASSWORD = "admin123";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
        localStorage.setItem("auth_user", JSON.stringify({ email, name: "Admin" }));
        toast.success("Logged in successfully");
        navigate("/");
      } else {
        toast.error("Invalid credentials. Use admin@aievoked.com / admin123");
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-lg bg-sidebar flex items-center justify-center">
            <img src={logoWhite} alt="AI Evoked" className="h-8 w-8 object-contain" />
          </div>
          <CardTitle className="text-xl">Sign in to AI Evoked</CardTitle>
          <p className="text-sm text-muted-foreground">Demo: admin@aievoked.com / admin123</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="admin@aievoked.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-primary to-violet-700" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
