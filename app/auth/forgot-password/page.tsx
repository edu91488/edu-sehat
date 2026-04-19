"use client";

import { useState } from "react";
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
import { HeartPulse, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const supabase = createClient();

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Email harus diisi.");
      return;
    }

    setIsSending(true);

    try {
      const redirectTo = `${window.location.origin}/auth/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim email reset password.");
    } finally {
      setIsSending(false);
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
            Masukkan email untuk menerima tautan reset password.
          </p>
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-card-foreground">Lupa Password</CardTitle>
            <CardDescription className="text-center">
              Kami akan mengirimkan tautan untuk membuat password baru.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSendResetEmail}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert className="border-primary/50 bg-primary/10 text-primary">
                  <AlertDescription>
                    Email reset password telah dikirim. Silakan cek inbox Anda.
                  </AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSending || success}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 mt-8">
              <Button type="submit" className="w-full" disabled={isSending || success}>
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  "Kirim Email Reset"
                )}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Sudah ingat password?{' '}
                <Link href="/auth/login" className="text-primary hover:underline font-medium">
                  Masuk kembali
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
