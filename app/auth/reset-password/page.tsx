"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { HeartPulse, Loader2, Lock } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isLinkValid, setIsLinkValid] = useState(false);

  useEffect(() => {
    const checkRecoveryLink = async () => {
      try {
        if (typeof window === "undefined") return;

        const parseParams = (source: string) => new URLSearchParams(source.replace(/^#/, ""));
        const hashParams = parseParams(window.location.hash);
        const queryParams = new URLSearchParams(window.location.search);

        const accessToken = hashParams.get("access_token") || queryParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token") || queryParams.get("refresh_token");
        const type = hashParams.get("type") || queryParams.get("type");

        if (accessToken && type === "recovery") {
          const sessionData: Record<string, string> = {
            access_token: accessToken,
          };

          if (refreshToken) {
            sessionData.refresh_token = refreshToken;
          }

          await supabase.auth.setSession(sessionData as any);
          window.history.replaceState({}, document.title, window.location.origin + window.location.pathname);
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          setIsLinkValid(true);
        } else {
          setError("Link reset password tidak valid atau sudah kadaluarsa.");
        }
      } catch (e) {
        setError("Link reset password tidak valid atau sudah kadaluarsa.");
      } finally {
        setIsChecking(false);
      }
    };

    checkRecoveryLink();
  }, [supabase]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError("Semua kolom harus diisi.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Password baru dan konfirmasi tidak cocok.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password baru minimal 6 karakter.");
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      await supabase.auth.signOut();
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memperbarui password.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <HeartPulse className="h-10 w-10 text-primary" />
            <span className="text-2xl font-bold text-foreground">EduSehat</span>
          </div>
          <p className="text-muted-foreground text-center">
            Gunakan form ini untuk membuat password baru setelah menerima email reset.
          </p>
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-card-foreground">Reset Password</CardTitle>
            <CardDescription className="text-center">
              Masukkan password baru untuk mengaktifkan kembali akun Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isChecking ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : !isLinkValid ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="border-primary/50 bg-primary/10 text-primary">
                    <AlertDescription>Password berhasil diperbarui. Silakan masuk kembali dengan password baru.</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Password Baru</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Minimal 6 karakter"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isSaving || success}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Ulangi password baru"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isSaving || success}
                    required
                  />
                </div>
                <CardFooter className="flex flex-col gap-3 pt-4">
                  <Button type="submit" className="w-full" disabled={isSaving || success}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      "Simpan Password Baru"
                    )}
                  </Button>
                  <Link href="/auth/login">
                    <Button variant="outline" className="w-full" type="button">
                      Kembali ke Login
                    </Button>
                  </Link>
                </CardFooter>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
