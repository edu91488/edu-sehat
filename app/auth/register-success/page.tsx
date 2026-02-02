import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HeartPulse, Mail, CheckCircle2 } from "lucide-react";

export default function RegisterSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-2">
            <HeartPulse className="h-10 w-10 text-primary" />
            <span className="text-2xl font-bold text-foreground">EduSehat</span>
          </div>
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-primary/10 p-4">
                <CheckCircle2 className="h-12 w-12 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-card-foreground">Pendaftaran Berhasil!</CardTitle>
            <CardDescription>
              Akun Anda telah berhasil dibuat
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Mail className="h-5 w-5" />
              <span>Cek email Anda untuk verifikasi</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Kami telah mengirimkan link verifikasi ke email Anda. 
              Silakan klik link tersebut untuk mengaktifkan akun Anda.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button asChild className="w-full">
              <Link href="/auth/login">Kembali ke Halaman Login</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
