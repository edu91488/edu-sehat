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
import { ArrowLeft, CheckCircle2, Loader2, Activity, Play } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { MedicationMonitoringDialog1 } from "@/components/dashboard/medication-monitoring-dialog-1";

export default function Education1Page() {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();
  const [isCompleting, setIsCompleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVideoWatched, setIsVideoWatched] = useState(false);
  const [isMonitoringCompleted, setIsMonitoringCompleted] = useState(false);
  const [isMonitoringDialogOpen, setIsMonitoringDialogOpen] = useState(false);

  useEffect(() => {
    const checkProgress = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      setIsLoading(false);
    };

    checkProgress();
  }, [supabase, router]);

  const handleVideoWatched = () => {
    setIsVideoWatched(true);
    toast({
      title: "Video Selesai",
      description: "Video berhasil ditonton. Anda sekarang bisa mengakses monitoring.",
    });
  };

  const handleMonitoringComplete = async (responses?: any) => {
    setIsMonitoringCompleted(true);
    
    // Save monitoring data to database
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from("monitoring_responses")
          .insert({
            user_id: user.id,
            education_stage: "education-1",
            responses: responses || {},
            completed_at: new Date().toISOString(),
          });
      }
    } catch (error) {
      console.error("Error saving monitoring data:", error);
    }

    toast({
      title: "Monitoring Selesai",
      description: "Anda sekarang bisa menyelesaikan tahap ini.",
    });
  };

  const handleComplete = async () => {
    if (!isMonitoringCompleted) {
      toast({
        title: "Monitoring Belum Selesai",
        description: "Silakan selesaikan monitoring terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

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

      console.log("[DEBUG] Completing education-1 for user:", user.id);

      const { error: updateError } = await supabase
        .from("user_progress")
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("stage_id", "education-1")
        .select();

      if (updateError) {
        console.error("[DEBUG] Error:", updateError);
        toast({
          title: "Error",
          description: `Gagal menyelesaikan edukasi: ${updateError.message}`,
          variant: "destructive",
        });
        setIsCompleting(false);
        return;
      }

      const { data: existingEdu2 } = await supabase
        .from("user_progress")
        .select("id")
        .eq("user_id", user.id)
        .eq("stage_id", "education-2")
        .maybeSingle();

      if (!existingEdu2) {
        await supabase
          .from("user_progress")
          .insert({
            user_id: user.id,
            stage_id: "education-2",
            completed: false,
          });
      }

      toast({
        title: "Success",
        description: "Edukasi 1 selesai! Tahap berikutnya telah dibuka.",
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Dashboard
        </Link>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Edukasi 1</CardTitle>
            <CardDescription>
              Yuk, Kenali Kepatuhan Minum Obat!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted rounded-lg overflow-hidden space-y-4">
              <div className="aspect-video flex items-center justify-center relative bg-black/5">
                <video
                  width="100%"
                  height="400"
                  controls
                  onPlay={handleVideoWatched}
                  className="rounded-lg w-full h-full object-cover"
                >
                  <source src="https://ofspsbgrglzongrcmtpg.supabase.co/storage/v1/object/public/education-videos/edukasi1.mp4" type="video/mp4" />
                  Browser Anda tidak mendukung video element.
                </video>
              </div>
              
              <div className="px-4 pb-4">
                <Button
                  onClick={handleVideoWatched}
                  variant={isVideoWatched ? "secondary" : "outline"}
                  className="w-full"
                  disabled={isVideoWatched}
                >
                  <Play className="mr-2 h-4 w-4" />
                  {isVideoWatched ? "✓ Video Sudah Ditonton" : "Tandai Video Sudah Ditonton"}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Materi Pembelajaran:</h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Apa itu Kepatuhan Minum Obat?</li>
                  <li>Mengapa Harus Patuh Minum Obat?</li>
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`rounded-lg p-4 text-center ${isVideoWatched ? 'bg-green-500/10' : 'bg-muted/50'}`}>
                <p className="text-sm font-semibold mb-1">Step 1: Video</p>
                <p className="text-2xl">{isVideoWatched ? '✓' : '○'}</p>
              </div>
              <div className={`rounded-lg p-4 text-center ${isMonitoringCompleted ? 'bg-green-500/10' : 'bg-muted/50'}`}>
                <p className="text-sm font-semibold mb-1">Step 2: Monitoring</p>
                <p className="text-2xl">{isMonitoringCompleted ? '✓' : '○'}</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-4">
              <Button
                onClick={() => setIsMonitoringDialogOpen(true)}
                disabled={!isVideoWatched || isMonitoringCompleted}
                variant={isMonitoringCompleted ? "secondary" : "default"}
                className="w-full h-12 text-base"
              >
                <Activity className="mr-2 h-5 w-5" />
                {isMonitoringCompleted ? "✓ Monitoring Selesai" : "Monitoring Kepatuhan Minum Obat"}
              </Button>

              <Button
                onClick={handleComplete}
                disabled={!isMonitoringCompleted || isCompleting}
                className="w-full h-12 text-base"
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
            </div>
          </CardContent>
        </Card>
      </div>

      <MedicationMonitoringDialog1
        isOpen={isMonitoringDialogOpen}
        onClose={() => setIsMonitoringDialogOpen(false)}
        onComplete={handleMonitoringComplete}
      />
    </div>
  );
}
