"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, HeartPulse, Shield } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Kredensial admin (bisa diganti dengan logic yang lebih kompleks)
  const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@eduseat.com";
  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin123";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Set admin session in localStorage
        localStorage.setItem("adminToken", "true");
        localStorage.setItem("adminEmail", email);
        
        toast({
          title: "Login Berhasil",
          description: "Selamat datang Admin!",
        });

        setTimeout(() => {
          router.push("/admin/dashboard");
          router.refresh();
        }, 1000);
      } else {
        toast({
          title: "Login Gagal",
          description: "Email atau password salah",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {/* Maintenance Message */}
        <div className="space-y-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <HeartPulse className="h-12 w-12 text-primary" />
          </div>
          
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Website Sedang Maintenance
            </h1>
            <p className="text-lg text-muted-foreground mb-4">
              Kami sedang melakukan pembaruan sistem. Silakan coba kembali nanti.
            </p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              ⏳ Perkiraan waktu selesai: Segera
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  /* 
  // === LOGIN FORM CODE - COMMENTED OUT DURING MAINTENANCE ===
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo *//*}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <HeartPulse className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">EduSehat</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Portal Admin</span>
          </div>
        </div>

        {/* Login Card *//*}
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center pb-3">
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>
              Masukkan kredensial admin Anda untuk melanjutkan
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@eduseat.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 mt-6"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>

            {/* Demo Info *//*}
            <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800 font-semibold mb-2">📝 Demo Credentials:</p>
              <p className="text-xs text-blue-700">
                Email: <code className="bg-white px-1 rounded">admin@eduseat.com</code>
              </p>
              <p className="text-xs text-blue-700">
                Password: <code className="bg-white px-1 rounded">admin123</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
  */
}
