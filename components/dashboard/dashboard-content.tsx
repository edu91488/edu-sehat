"use client";

import React from "react"

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { requestNotificationPermission, notifyUser } from "@/lib/notifications";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  HeartPulse,
  LogOut,
  ClipboardCheck,
  BookOpen,
  GraduationCap,
  Lock,
  CheckCircle2,
  ChevronRight,
  User,
  Loader2,
  MessageSquare,
  Settings,
} from "lucide-react";

interface DashboardContentProps {
  user: {
    email: string;
    fullName: string;
  };
}

type StageStatus = "locked" | "available" | "completed";

interface LearningStage {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: StageStatus;
}

export function DashboardContent({ user }: DashboardContentProps) {
  const router = useRouter();
  const supabase = createClient();

  // Progress dari database
  const { toast } = useToast();
  const [completedStages, setCompletedStages] = useState<string[]>([]);
  const [stageProgress, setStageProgress] = useState<Record<string, { completed: boolean; available_at?: string }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const timeoutsRef = useRef<number[]>([]);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | 'unsupported'>('unsupported');
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const formatDuration = (ms: number) => {
    if (ms <= 0) return "00:00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');
    return days > 0 ? `${days} hari ${hh}:${mm}:${ss}` : `${hh}:${mm}:${ss}`;
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const clearTimers = () => {
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      timeoutsRef.current = [];
    };

    const fetchProgress = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: progress } = await supabase
        .from("user_progress")
        .select("stage_id, completed, available_at")
        .eq("user_id", user.id);

      if (progress) {
        const map: Record<string, { completed: boolean; available_at?: string }> = {};
        progress.forEach((p: any) => {
          map[p.stage_id] = { completed: !!p.completed, available_at: p.available_at || undefined };
        });

        if (!cancelled) {
          setStageProgress(map);
          setCompletedStages(Object.entries(map).filter(([, v]) => v.completed).map(([k]) => k));
          setIsLoading(false);
        }

        // schedule notifications for upcoming available_at
        clearTimers();
        for (const [stageId, info] of Object.entries(map)) {
          if (info.available_at) {
            const ms = new Date(info.available_at).getTime() - Date.now();
            if (ms > 0) {
              const t = window.setTimeout(async () => {
                // Also show a system/browser notification if permission granted
                notifyUser("Edukasi Tersedia", {
                  body: `${stageId.replace("-", " ")} sekarang dapat diakses.`,
                });

                toast({
                  title: `Edukasi Tersedia`,
                  description: `${stageId.replace("-", " ")} sekarang dapat diakses.`,
                });

                // refetch to update UI
                await fetchProgress();
              }, ms);
              timeoutsRef.current.push(t);
            }
          }
        }
      }
    };

    // ask permission if not decided yet when we mount (but do it unobtrusively)
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      // don't block - show a small toast prompting user to enable notifications
      toast({
        title: 'Aktifkan Notifikasi',
        description: 'Aktifkan notifikasi untuk menerima pemberitahuan ketika tahap baru tersedia.',
      });
    }

    fetchProgress();

    return () => {
      cancelled = true;
      clearTimers();
    };
  }, [supabase, toast]);

  // Define stage IDs first to avoid initialization issues
  const stageIds = ["pretest", "education-1", "education-2", "education-3", "tanya-ahli", "postest"];

  // For some stages (e.g., postest) the required previous stage is not simply the immediate previous
  const requiredPrev: Record<string, string | null> = {
    pretest: null,
    "education-1": "pretest",
    "education-2": "education-1",
    "education-3": "education-2",
    "tanya-ahli": "education-3",
    postest: "education-3", // allow skipping tanya-ahli (optional)
  };

  const getStageStatus = (stageId: string, index: number): StageStatus => {
    if (completedStages.includes(stageId)) return "completed";
    const reqPrev = requiredPrev[stageId] ?? (index === 0 ? null : stageIds[index - 1]);
    const prevCompleted = reqPrev === null || completedStages.includes(reqPrev);
    if (!prevCompleted) return "locked";
    const info = stageProgress[stageId];
    if (!info || !info.available_at) return "available";
    if (new Date(info.available_at) <= new Date()) return "available";
    return "locked";
  };

  const stages: LearningStage[] = [
    {
      id: "pretest",
      title: "Pre-Test",
      description: "Uji pengetahuan awal Anda sebelum memulai pembelajaran",
      icon: <ClipboardCheck className="h-6 w-6" />,
      status: getStageStatus("pretest", 0),
    },
    {
      id: "education-1",
      title: "Edukasi 1",
      description: "Yuk, Kenali Kepatuhan Minum Obat!",
      icon: <BookOpen className="h-6 w-6" />,
      status: getStageStatus("education-1", 1),
    },
    {
      id: "education-2",
      title: "Edukasi 2",
      description: "Kenali Hambatan Minum Obat dan Cara Mengatasinya",
      icon: <BookOpen className="h-6 w-6" />,
      status: getStageStatus("education-2", 2),
    },
    {
      id: "education-3",
      title: "Edukasi 3",
      description: "PENGUATAN & KOMITMEN",
      icon: <BookOpen className="h-6 w-6" />,
      status: getStageStatus("education-3", 3),
    },
    {
      id: "tanya-ahli",
      title: "Tanya Ahli",
      description: "Ajukan pertanyaan Anda kepada para ahli kesehatan (Opsional)",
      icon: <MessageSquare className="h-6 w-6" />,
      status: getStageStatus("tanya-ahli", 4),
    },

    {
      id: "postest",
      title: "Post-Test",
      description: "Evaluasi pemahaman setelah menyelesaikan semua materi",
      icon: <GraduationCap className="h-6 w-6" />,
      status: getStageStatus("postest", 5),
    },
  ];

  const completedCount = completedStages.length;
  const progressPercentage = (completedCount / stages.length) * 100;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const enableNotifications = async () => {
    const p = await requestNotificationPermission();
    setNotifPermission(p);
    if (p === 'granted') {
      toast({ title: 'Notifikasi Diaktifkan', description: 'Anda akan menerima notifikasi ketika tahap baru tersedia.' });
    } else {
      toast({ title: 'Notifikasi Tidak Diaktifkan', description: 'Izin notifikasi ditolak atau tidak tersedia.', variant: 'destructive' });
    }
  };
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  const handleStageClick = (stage: LearningStage) => {
    if (stage.status === "locked") return;
    
    // Navigate to stage page
    router.push(`/dashboard/${stage.id}`);
  };

  const getStatusIcon = (status: StageStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-primary" />;
      case "locked":
        return <Lock className="h-5 w-5 text-muted-foreground" />;
      default:
        return <ChevronRight className="h-5 w-5 text-primary" />;
    }
  };

  const getCardClasses = (status: StageStatus) => {
    const base = "transition-all duration-200 border";
    switch (status) {
      case "completed":
        return `${base} bg-primary/5 border-primary/20 hover:border-primary/40`;
      case "locked":
        return `${base} bg-muted/50 border-border opacity-60 cursor-not-allowed`;
      default:
        return `${base} bg-card border-border hover:border-primary hover:shadow-md cursor-pointer`;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <style>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fadeInDown {
          animation: fadeInDown 0.5s ease-out;
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }
        
        .animate-slideInLeft {
          animation: slideInLeft 0.6s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.5s ease-out;
        }
        
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
      `}</style>
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm animate-fadeInDown">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <HeartPulse className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">EduSehat</span>
            </div>
          
          <div className="flex items-center gap-4">
            <Link href="/dashboard/edit-profile">
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                <User className="h-4 w-4" />
                <span>{user.fullName}</span>
              </div>
            </Link>
            {/* <Link href="/dashboard/edit-profile">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-transparent"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Edit Profil</span>
              </Button>
            </Link> */}
            {notifPermission !== 'granted' && notifPermission !== 'unsupported' && (
              <Button variant="outline" size="sm" onClick={enableNotifications} className="flex items-center gap-2 bg-transparent">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h11z"/></svg>
                <span className="hidden sm:inline">Aktifkan Notifikasi</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2 bg-transparent"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Keluar</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fadeInUp delay-100">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2 text-balance">
            Selamat Datang, {user.fullName}!
          </h1>
          <p className="text-muted-foreground">
            Lanjutkan perjalanan belajar Anda tentang kesehatan
          </p>
        </div>

        {/* Progress Card */}
        <Card className="mb-8 border-border animate-fadeInUp delay-200 hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-card-foreground">Progres Belajar</CardTitle>
            <CardDescription>
              {completedCount} dari {stages.length} tahap selesai
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progressPercentage} className="h-3" />
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>Mulai</span>
              <span>{Math.round(progressPercentage)}% Selesai</span>
              <span>Selesai</span>
            </div>
          </CardContent>
        </Card>

        {/* Completion Message */}
        {progressPercentage === 100 && (
          <Card className="mb-8 border-green-500 bg-green-500/5 animate-scaleIn delay-300">
            <CardContent className="p-6">
              <div className="text-center space-y-3">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto animate-bounce" />
                <h2 className="text-2xl font-bold text-green-700">Selamat! 🎉</h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Terima kasih telah mengikuti edukasi ini.
                  <br />
                  Kepatuhan minum obat adalah kunci
                  <br />
                  mengontrol hipertensi dan hidup lebih sehat
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Learning Stages */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground mb-4 animate-fadeInUp delay-300">
            Tahap Pembelajaran
          </h2>
          {stages.map((stage, index) => {
            const availAt = stageProgress[stage.id]?.available_at;
            const timeLeft = availAt ? new Date(availAt).getTime() - now : 0;
            return (
            <Card
              key={stage.id}
              className={`${getCardClasses(stage.status)} animate-fadeInUp transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1`}
              style={{ animationDelay: `${0.3 + (index * 0.1)}s` }}
              onClick={() => handleStageClick(stage)}
              role={stage.status !== "locked" ? "button" : undefined}
              tabIndex={stage.status !== "locked" ? 0 : undefined}
              onKeyDown={(e) => {
                if (e.key === "Enter" && stage.status !== "locked") {
                  handleStageClick(stage);
                }
              }}
            >
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      stage.status === "completed"
                        ? "bg-primary/10 text-primary"
                        : stage.status === "available"
                          ? "bg-secondary text-secondary-foreground"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {stage.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        Tahap {index + 1}
                      </span>
                      {stage.status === "completed" && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full animate-fadeInUp">
                          Selesai
                        </span>
                      )}
                      {stage.id === "tanya-ahli" && stage.status !== "completed" && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-xs bg-muted/10 text-muted-foreground px-2 py-0.5 rounded-full animate-fadeInUp ml-2 cursor-help">
                              Opsional
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" align="center">
                            Tanya Ahli bersifat opsional — Anda dapat langsung melanjutkan ke Post-Test setelah Edukasi 3.
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <h3 className="font-semibold text-card-foreground">{stage.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {stage.description}
                    </p>
                    {stage.status === "locked" && availAt && timeLeft > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Tersedia dalam {formatDuration(timeLeft)} (pada {new Date(availAt).toLocaleString()})
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0 transition-transform duration-300">
                    {getStatusIcon(stage.status)}
                  </div>
                </div>
              </CardContent>
            </Card>
          )})}
        </div>
      </main>
    </div>
  );
}
