"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function PostestPage() {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [isFormOpened, setIsFormOpened] = useState(false);

  useEffect(() => {
    const checkAndCompletePosest = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      // Check if user already completed postest
      const { data: progress } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("stage_id", "postest")
        .single();

      if (progress && progress.completed) {
        // Already completed, redirect to dashboard
        router.push("/dashboard");
        return;
      }

      setIsLoading(false);
    };

    checkAndCompletePosest();
  }, [supabase, router]);

  const handleOpenPosest = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log("[v0] No user found");
      return;
    }

    console.log("[v0] Starting postest for user:", user.id);

    // Check if progress already exists
    const { data: existing } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("stage_id", "postest")
        .single();

    if (!existing) {
      // Insert new record
      const { error } = await supabase.from("user_progress").insert({
        user_id: user.id,
        stage_id: "postest",
        started_at: new Date().toISOString(),
        completed: false,
      });
      console.log("[v0] Insert result:", error ? error.message : "success");
    }

    // Set completed flag to enable Selesai button
    setHasCompleted(true);
    setIsFormOpened(true);

    // Open external form
    window.open(
      "https://forms.zohopublic.com/hanfitria1707gm1/form/Postest/formperma/JLXNdP5wYPDr1bnd1nXRKf6OCOoozO-xGN5V7Yf6t84",
      "_blank"
    );
  };

  const handleMarkComplete = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Error",
          description: "User tidak ditemukan",
          variant: "destructive",
        });
        return;
      }

      console.log("[DEBUG] Marking postest as completed for user:", user.id);

      const { error: updateError } = await supabase
        .from("user_progress")
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("stage_id", "postest")
        .select();

      if (updateError) {
        console.error("[DEBUG] Update Error:", updateError);
        toast({
          title: "Error",
          description: `Gagal menyelesaikan postest: ${updateError.message}`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Pos-Test selesai! Terima kasih telah menyelesaikan program pembelajaran.",
      });

      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("[DEBUG] Unexpected error:", error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan yang tidak terduga",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Dashboard
        </Link>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Pos-Test</CardTitle>
            <CardDescription>
              Evaluasi pemahaman Anda setelah menyelesaikan semua materi pembelajaran
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-2">Petunjuk:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Klik tombol di bawah untuk membuka form Pos-Test</li>
                <li>Jawab semua pertanyaan dengan jujur sesuai pemahaman Anda</li>
                <li>Setelah selesai mengerjakan, klik tombol "Selesai" di halaman ini</li>
              </ol>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={handleOpenPosest}
                size="lg"
                className={`w-full h-12 text-base ${
                  isFormOpened
                    ? "bg-white border border-gray-300 text-black hover:bg-gray-50"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                <ExternalLink className="mr-2 h-5 w-5" />
                Mulai Mengerjakan Pos Test
              </Button>

              <Button
                onClick={handleMarkComplete}
                disabled={!hasCompleted}
                size="lg"
                className="w-full h-12 text-base bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                Selesai
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
