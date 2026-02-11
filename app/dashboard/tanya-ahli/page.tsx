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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Send,
  Users,
  Mail,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

interface Expert {
  id: string;
  name: string;
  specialty: string;
  email?: string;
  phone_number?: string;
  bio?: string;
}

export default function TanyaAhliPage() {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [userFullName, setUserFullName] = useState<string>("");
  const [isStageCompleted, setIsStageCompleted] = useState(false);
  const [hasAskedQuestion, setHasAskedQuestion] = useState(false);
  const [experts, setExperts] = useState<Expert[]>([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const checkProgress = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      setUserId(user.id);
      // Get user's full name from auth metadata
      const fullName = user.user_metadata?.full_name || "Pengguna";
      setUserFullName(fullName);

      // Check if this stage is already completed
      const { data: progress } = await supabase
        .from("user_progress")
        .select("completed")
        .eq("user_id", user.id)
        .eq("stage_id", "tanya-ahli")
        .single();

      if (progress?.completed) {
        setIsStageCompleted(true);
      }

      // Fetch experts data
      try {
        const { data: expertsData, error: expertsError } = await supabase
          .from("experts")
          .select("*")
          .order("created_at", { ascending: false });

        if (expertsError) {
          console.error("Error fetching experts:", expertsError);
        } else {
          setExperts(expertsData || []);
        }
      } catch (error) {
        console.error("Error fetching experts:", error);
      }

      setIsLoading(false);
    };

    checkProgress();
  }, [isMounted, supabase, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const completeStage = async () => {
    setIsCompleting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Check if progress record exists
      const { data: existingProgress } = await supabase
        .from("user_progress")
        .select("id")
        .eq("user_id", user.id)
        .eq("stage_id", "tanya-ahli")
        .single();

      if (existingProgress) {
        // Update existing record
        await supabase
          .from("user_progress")
          .update({
            completed: true,
            completed_at: new Date().toISOString(),
          })
          .eq("id", existingProgress.id);
      } else {
        // Insert new record
        await supabase.from("user_progress").insert([
          {
            user_id: user.id,
            stage_id: "tanya-ahli",
            completed: true,
            completed_at: new Date().toISOString(),
          },
        ]);
      }

      setIsStageCompleted(true);
      toast({
        title: "Tahap Selesai",
        description: "Anda telah menyelesaikan tahap Tanya Ahli",
        variant: "default",
      });
    } catch (error) {
      console.error("Error completing stage:", error);
    } finally {
      setIsCompleting(false);
    }
  };

  if (!isMounted || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Kembali</span>
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h1 className="font-semibold text-foreground">Tanya Ahli</h1>
          </div>
          <div className="w-10" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Introduction Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Ajukan Pertanyaan Anda</CardTitle>
            <CardDescription>
              Punya pertanyaan tentang obat, hipertensi, atau kesehatan? Tanyakan
              langsung kepada para ahli kesehatan kami.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Para ahli akan merespon pertanyaan Anda secepatnya. Pastikan
              pertanyaan Anda jelas dan spesifik agar kami dapat memberikan
              jawaban yang tepat.
            </p>
          </CardContent>
        </Card>

        {/* Experts List */}
        {experts.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Daftar Pakar Kesehatan
              </CardTitle>
              <CardDescription>
                Para ahli yang siap menjawab pertanyaan Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {experts.map((expert) => (
                  <Card key={expert.id} className="border border-secondary/50">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        {/* Expert Name */}
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {expert.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {expert.specialty}
                          </p>
                        </div>

                        {/* Expert Bio */}
                        {expert.bio && (
                          <p className="text-sm text-muted-foreground">
                            {expert.bio}
                          </p>
                        )}

                        {/* Contact Info */}
                        <div className="space-y-2 pt-2 border-t border-secondary/30">
                          {expert.email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-4 w-4 text-primary/60" />
                              <a
                                href={`mailto:${expert.email}`}
                                className="text-primary hover:underline"
                              >
                                {expert.email}
                              </a>
                            </div>
                          )}
                          {expert.phone_number && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-primary/60" />
                              <span className="text-foreground">
                                {expert.phone_number}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Ask Now Button */}
                        {expert.phone_number && (
                          <Button
                            onClick={() => {
                              let whatsappNumber = expert.phone_number!.replace(/\D/g, '');
                              // Ensure country code is included (Indonesia: 62)
                              if (whatsappNumber.startsWith('0')) {
                                whatsappNumber = '62' + whatsappNumber.substring(1);
                              } else if (!whatsappNumber.startsWith('62')) {
                                whatsappNumber = '62' + whatsappNumber;
                              }
                              const message = `Hallo, saya pasien ${userFullName} ingin bertanya kepada Anda tentang kesehatan saya. Terima kasih.`;
                              const encodedMessage = encodeURIComponent(message);
                              const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
                              window.open(whatsappUrl, '_blank');
                              // Mark that user has asked a question
                              setHasAskedQuestion(true);
                              // Complete the stage when user clicks to ask
                              completeStage();
                            }}
                            className="w-full gap-2 mt-4"
                          >
                            <MessageSquare className="h-4 w-4" />
                            Tanya Sekarang
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Completion Status */}
        {isStageCompleted && hasAskedQuestion && (
          <Card className="mb-8 border-green-500 bg-green-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">
                    Tahap Selesai
                  </p>
                  <p className="text-sm text-green-800">
                    Anda telah menyelesaikan tahap Tanya Ahli. Silakan lanjut ke postest.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Button */}
        {/* <div className="flex gap-3">
          <Link href="/dashboard" className="flex-1">
            <Button variant="outline" className="w-full">
              Kembali ke Dashboard
            </Button>
          </Link>
          <Link href="/dashboard/postest" className="flex-1">
            <Button className="w-full gap-2">
              Lanjut ke Postest
              <Send className="h-4 w-4" />
            </Button>
          </Link>
        </div> */}
      </main>
    </div>
  );
}
