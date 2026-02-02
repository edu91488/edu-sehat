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
import { ArrowLeft, ExternalLink, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function PretestPage() {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();
  const [hasStarted, setHasStarted] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkProgress = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      // Check if user already started pretest
      const { data: progress } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("stage_id", "pretest")
        .single();

      if (progress) {
        setHasStarted(true);
      }

      setIsLoading(false);
    };

    checkProgress();
  }, [supabase, router]);

  const handleStartPretest = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log("[v0] No user found");
      return;
    }

    console.log("[v0] Starting pretest for user:", user.id);

    // Check if progress already exists
    const { data: existing } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("stage_id", "pretest")
      .single();

    if (!existing) {
      // Insert new record
      const { error } = await supabase.from("user_progress").insert({
        user_id: user.id,
        stage_id: "pretest",
        started_at: new Date().toISOString(),
        completed: false,
      });
      console.log("[v0] Insert result:", error ? error.message : "success");
    }

    setHasStarted(true);

    // Open external form
    window.open(
      "https://forms.zohopublic.com/hanfitria1707gm1/form/LembarPersetujuanPenelitian/formperma/G5d2uTfVj2pV3cHnq4Yhb8KtGmrWmU7ptzqN7TDgYPg",
      "_blank"
    );
  };

  const handleComplete = async () => {
    setIsCompleting(true);

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
        setIsCompleting(false);
        return;
      }

      console.log("[DEBUG] Starting completion for user:", user.id);

      // Step 1: Mark pretest as completed
      console.log("[DEBUG] Step 1: Updating pretest to completed...");
      const { data: updateData, error: updateError } = await supabase
        .from("user_progress")
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("stage_id", "pretest")
        .select();

      if (updateError) {
        console.error("[DEBUG] Step 1 Error:", updateError);
        toast({
          title: "Error",
          description: `Gagal menyelesaikan pretest: ${updateError.message}`,
          variant: "destructive",
        });
        setIsCompleting(false);
        return;
      }

      console.log("[DEBUG] Step 1 Success:", updateData);

      // Step 2: Create education-1 stage if not exists
      console.log("[DEBUG] Step 2: Creating/updating education-1...");
      
      const { data: existingEdu } = await supabase
        .from("user_progress")
        .select("id")
        .eq("user_id", user.id)
        .eq("stage_id", "education-1")
        .maybeSingle();

      let edu1Result;
      if (!existingEdu) {
        // Insert new education-1
        const result = await supabase
          .from("user_progress")
          .insert({
            user_id: user.id,
            stage_id: "education-1",
            completed: false,
          })
          .select();
        
        edu1Result = result;
        console.log("[DEBUG] Step 2 Insert Result:", result);
      } else {
        console.log("[DEBUG] Step 2: Education-1 already exists");
      }

      if (edu1Result?.error) {
        console.error("[DEBUG] Step 2 Error:", edu1Result.error);
        toast({
          title: "Warning",
          description: "Pretest selesai tapi ada error saat membuka tahap berikutnya",
          variant: "destructive",
        });
      } else {
        console.log("[DEBUG] Step 2 Success");
        toast({
          title: "Success",
          description: "Pretest selesai! Tahap berikutnya telah dibuka.",
        });
      }

      // Step 3: Redirect
      console.log("[DEBUG] Step 3: Redirecting...");
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
      setIsCompleting(false);
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
            <CardTitle className="text-2xl">Pre-Test</CardTitle>
            <CardDescription>
              Uji pengetahuan awal Anda sebelum memulai pembelajaran
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-2">Petunjuk:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Klik tombol "Mulai Mengerjakan Pre-Test" untuk membuka form soal</li>
                <li>Jawab semua pertanyaan dengan jujur</li>
                <li>Setelah selesai mengerjakan, kembali ke halaman ini</li>
                <li>Klik tombol "Selesai" untuk melanjutkan ke tahap berikutnya</li>
              </ol>
            </div>

            <div className="flex flex-col gap-4">
              <Button
                onClick={handleStartPretest}
                className="w-full h-12 text-base"
                variant={hasStarted ? "outline" : "default"}
              >
                <ExternalLink className="mr-2 h-5 w-5" />
                {hasStarted ? "Buka Kembali Pre-Test" : "Mulai Mengerjakan Pre-Test"}
              </Button>

              <Button
                onClick={handleComplete}
                disabled={!hasStarted || isCompleting}
                className="w-full h-12 text-base"
                variant={hasStarted ? "default" : "secondary"}
              >
                {isCompleting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Selesai
                  </>
                )}
              </Button>

              {!hasStarted && (
                <p className="text-center text-sm text-muted-foreground">
                  Anda harus mengerjakan Pre-Test terlebih dahulu sebelum dapat menyelesaikan tahap ini
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
