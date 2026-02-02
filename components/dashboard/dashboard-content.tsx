"use client";

import React from "react"

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
  const [completedStages, setCompletedStages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: progress } = await supabase
        .from("user_progress")
        .select("stage_id")
        .eq("user_id", user.id)
        .eq("completed", true);

      if (progress) {
        setCompletedStages(progress.map((p) => p.stage_id));
      }
      setIsLoading(false);
    };

    fetchProgress();
  }, [supabase]);

  // Define stage IDs first to avoid initialization issues
  const stageIds = ["pretest", "education-1", "education-2", "education-3", "postest"];

  const getStageStatus = (stageId: string, index: number): StageStatus => {
    if (completedStages.includes(stageId)) return "completed";
    if (index === 0 || completedStages.includes(stageIds[index - 1])) {
      return "available";
    }
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
      id: "postest",
      title: "Post-Test",
      description: "Evaluasi pemahaman setelah menyelesaikan semua materi",
      icon: <GraduationCap className="h-6 w-6" />,
      status: getStageStatus("postest", 4),
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
          <div className="flex items-center gap-2">
            <HeartPulse className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">EduSehat</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{user.fullName}</span>
            </div>
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
          {stages.map((stage, index) => (
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
                    </div>
                    <h3 className="font-semibold text-card-foreground">{stage.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {stage.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0 transition-transform duration-300">
                    {getStatusIcon(stage.status)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
