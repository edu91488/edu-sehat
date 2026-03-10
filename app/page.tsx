import React from "react"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeartPulse, BookOpen, ClipboardCheck, GraduationCap, ArrowRight } from "lucide-react";

export default function HomePage() {
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
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes pulse-scale {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        .animate-fadeInDown {
          animation: fadeInDown 0.6s ease-out;
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }
        
        .animate-slideInLeft {
          animation: slideInLeft 0.6s ease-out;
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.6s ease-out;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-pulse-scale {
          animation: pulse-scale 2s ease-in-out infinite;
        }
        
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
      `}</style>
      
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between animate-fadeInDown">
          <div className="flex items-center gap-2">
            <HeartPulse className="h-8 w-8 text-primary animate-pulse-scale" />
            <span className="text-xl font-bold text-foreground">EduSehat</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Masuk</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/register">Daftar</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fadeInUp delay-100">
            <HeartPulse className="h-4 w-4 animate-float" />
            Platform Edukasi Kesehatan
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6 text-balance animate-fadeInUp delay-200">
            Tingkatkan Pengetahuan Kesehatan Anda
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty animate-fadeInUp delay-300">
            Pelajari gaya hidup sehat dalam mempelajari Kepatuhan minum obat untuk
mengontrol hipertensi melalui modul 
            pembelajaran interaktif yang dirancang khusus untuk Anda.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp delay-400">
            <Button size="lg" asChild className="hover:scale-105 transition-transform">
              <Link href="/auth/register">
                Mulai Belajar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="hover:scale-105 transition-transform">
              <Link href="/auth/login">Sudah Punya Akun</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/50 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-12 animate-fadeInDown">
            Apa yang Akan Anda Pelajari
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="animate-fadeInUp delay-100">
              <FeatureCard
                icon={<ClipboardCheck className="h-8 w-8" />}
                title="Pre-Test"
                description="Ukur kemampuan Anda sebelum memulai modul pembelajaran"
              />
            </div>
            <div className="animate-fadeInUp delay-200">
              <FeatureCard
                icon={<BookOpen className="h-8 w-8" />}
                title="3 Modul Edukasi"
                description="Materi komprehensif tentang gaya hidup sehat mengenai kepatuhan minum obat "
              />
            </div>
            <div className="animate-fadeInUp delay-300">
              <FeatureCard
                icon={<GraduationCap className="h-8 w-8" />}
                title="Pos-Test"
                description="Uji pemahaman Anda setelah menyelesaikan modul pembelajaran"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 animate-fadeInUp">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <HeartPulse className="h-6 w-6 text-primary animate-float" />
            <span className="font-semibold text-foreground">EduSehat</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Platform Edukasi Kesehatan Indonesia
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-card rounded-xl p-6 border border-border hover:shadow-lg hover:border-primary/30 transition-all duration-300 hover:scale-105 hover:-translate-y-1 cursor-pointer group">
      <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-card-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}
