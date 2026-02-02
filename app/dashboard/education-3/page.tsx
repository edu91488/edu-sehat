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
import { MedicationMonitoringDialog3 } from "@/components/dashboard/medication-monitoring-dialog-3";

export default function Education3Page() {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();
  const [isCompleting, setIsCompleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVideoWatched, setIsVideoWatched] = useState(false);
  const [isMonitoringCompleted, setIsMonitoringCompleted] = useState(false);
  const [isMonitoringDialogOpen, setIsMonitoringDialogOpen] = useState(false);
  const [isCommitmentConfirmed, setIsCommitmentConfirmed] = useState(false);

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
            education_stage: "education-3",
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

    if (!isCommitmentConfirmed) {
      toast({
        title: "Komitmen Belum Dikonfirmasi",
        description: "Silakan konfirmasi komitmen Anda terlebih dahulu",
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

      console.log("[DEBUG] Completing education-3 for user:", user.id);

      // Mark education-3 as completed
      const { error: updateError } = await supabase
        .from("user_progress")
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .eq("stage_id", "education-3")
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

      // Create postest stage if not exists
      const { data: existingPosest } = await supabase
        .from("user_progress")
        .select("id")
        .eq("user_id", user.id)
        .eq("stage_id", "postest")
        .maybeSingle();

      if (!existingPosest) {
        await supabase
          .from("user_progress")
          .insert({
            user_id: user.id,
            stage_id: "postest",
            completed: false,
          });
      }

      toast({
        title: "Success",
        description: "Edukasi 3 selesai! Tahap berikutnya telah dibuka.",
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
            <CardTitle className="text-2xl">Edukasi 3</CardTitle>
            <CardDescription>
              PENGUATAN & KOMITMEN
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Video Section */}
            <div className="bg-muted rounded-lg overflow-hidden space-y-4">
              <div className="aspect-video flex items-center justify-center relative bg-black/5">
                <video
                  width="100%"
                  height="400"
                  controls
                  onPlay={handleVideoWatched}
                  className="rounded-lg w-full h-full object-cover"
                >
                  <source src="https://ofspsbgrglzongrcmtpg.supabase.co/storage/v1/object/public/education-videos/edukasi3.mp4" type="video/mp4" />
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

            {/* Content */}
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Materi Pembelajaran:</h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Ringkasan Edukasi</li>
                  <li>Tips Agar Patuh Minum Obat</li>
                  <li>Kesehatan mental dan stress management</li>
                </ul>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="grid grid-cols-3 gap-4">
              <div className={`rounded-lg p-4 text-center ${isVideoWatched ? 'bg-green-500/10' : 'bg-muted/50'}`}>
                <p className="text-sm font-semibold mb-1">Step 1: Video</p>
                <p className="text-2xl">{isVideoWatched ? '✓' : '○'}</p>
              </div>
              <div className={`rounded-lg p-4 text-center ${isMonitoringCompleted ? 'bg-green-500/10' : 'bg-muted/50'}`}>
                <p className="text-sm font-semibold mb-1">Step 2: Monitoring</p>
                <p className="text-2xl">{isMonitoringCompleted ? '✓' : '○'}</p>
              </div>
              <div className={`rounded-lg p-4 text-center ${isCommitmentConfirmed ? 'bg-green-500/10' : 'bg-muted/50'}`}>
                <p className="text-sm font-semibold mb-1">Step 3: Komitmen</p>
                <p className="text-2xl">{isCommitmentConfirmed ? '✓' : '○'}</p>
              </div>
            </div>

            {/* Action Buttons */}
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
            </div>

            {/* Komitmen Pasien */}
            <div className={`rounded-lg p-6 border-2 transition-all ${isCommitmentConfirmed ? 'border-green-500 bg-green-500/5' : 'border-blue-300 bg-blue-500/5'}`}>
              <div className="space-y-4">
                <p className="text-center text-lg font-semibold text-gray-700">
                  Saya berkomitmen untuk minum obat secara teratur<br />
                  demi kesehatan saya 💙
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={async () => {
                      if (!isMonitoringCompleted) {
                        toast({
                          title: "Monitoring Belum Selesai",
                          description: "Silakan selesaikan monitoring terlebih dahulu",
                          variant: "destructive",
                        });
                        return;
                      }
                      
                      // Save commitment to database
                      try {
                        const {
                          data: { user },
                        } = await supabase.auth.getUser();

                        if (user) {
                          await supabase
                            .from("commitment_records")
                            .insert({
                              user_id: user.id,
                              commitment_status: true,
                              confirmed_at: new Date().toISOString(),
                              education_stage: "education-3",
                            });
                        }
                      } catch (error) {
                        console.error("Error saving commitment:", error);
                      }

                      setIsCommitmentConfirmed(true);
                      toast({
                        title: "Komitmen Dikonfirmasi",
                        description: "Terima kasih atas komitmen Anda!",
                      });
                    }}
                    disabled={!isMonitoringCompleted || isCommitmentConfirmed}
                    variant={isCommitmentConfirmed ? "secondary" : "default"}
                    className={`flex-1 h-12 text-base font-bold ${isCommitmentConfirmed ? 'bg-green-500 hover:bg-green-600' : ''}`}
                  >
                    👉 YA, SAYA SIAP!
                  </Button>
                  <Button
                    onClick={() => {
                      toast({
                        title: "Informasi",
                        description: "Anda harus berkomitmen untuk melanjutkan",
                        variant: "destructive",
                      });
                    }}
                    disabled={isCommitmentConfirmed}
                    variant="outline"
                    className="flex-1 h-12 text-base font-bold"
                  >
                    Tidak Siap
                  </Button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 pt-4">
              <Button
                onClick={handleComplete}
                disabled={!isMonitoringCompleted || !isCommitmentConfirmed || isCompleting}
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

      <MedicationMonitoringDialog3
        isOpen={isMonitoringDialogOpen}
        onClose={() => setIsMonitoringDialogOpen(false)}
        onComplete={handleMonitoringComplete}
      />
    </div>
  );
}
