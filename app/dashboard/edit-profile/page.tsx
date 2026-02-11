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
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, User, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function EditProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string>("");
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    phoneNumber: "",
  });

  const [originalData, setOriginalData] = useState({
    fullName: "",
    email: "",
    username: "",
    phoneNumber: "",
  });

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/auth/login");
          return;
        }

        setUserId(user.id);

        // Get profile data from profiles table
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("username, email, phone_number")
          .eq("id", user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Error fetching profile:", profileError);
        }

        const fullName = user.user_metadata?.full_name || "Pengguna";
        const email = user.email || "";
        const username = profile?.username || "";
        const phoneNumber = profile?.phone_number || "";

        setFormData({
          fullName,
          email,
          username,
          phoneNumber,
        });

        setOriginalData({
          fullName,
          email,
          username,
          phoneNumber,
        });

        setIsLoading(false);
      } catch (error) {
        console.error("Error loading profile:", error);
        toast({
          title: "Error",
          description: "Gagal memuat profil pengguna",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [supabase, router, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim() || !formData.username.trim()) {
      toast({
        title: "Error",
        description: "Nama lengkap dan username tidak boleh kosong",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      // Update auth user metadata with full_name
      if (formData.fullName !== originalData.fullName) {
        const { error: updateAuthError } = await supabase.auth.updateUser({
          data: { full_name: formData.fullName },
        });

        if (updateAuthError) throw updateAuthError;
      }

      // Update profile table with username, email, and phone_number
      const { error: updateProfileError } = await supabase
        .from("profiles")
        .update({
          username: formData.username,
          email: formData.email || null,
          phone_number: formData.phoneNumber || null,
        })
        .eq("id", userId);

      if (updateProfileError) throw updateProfileError;

      // Update original data to reflect changes
      setOriginalData(formData);

      toast({
        title: "Sukses",
        description: "Profil Anda telah diperbarui",
        variant: "default",
      });

      // Refresh the page after a short delay
      setTimeout(() => {
        router.refresh();
      }, 500);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Gagal memperbarui profil. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges =
    formData.fullName !== originalData.fullName ||
    formData.username !== originalData.username ||
    formData.phoneNumber !== originalData.phoneNumber;

  if (isLoading) {
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
            <User className="h-5 w-5 text-primary" />
            <h1 className="font-semibold text-foreground">Edit Profil</h1>
          </div>
          <div className="w-10" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Profil</CardTitle>
            <CardDescription>
              Perbarui informasi pribadi Anda di sini
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Full Name Input */}
              <div className="space-y-2">
                <label htmlFor="fullName" className="block text-sm font-medium">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Masukkan nama lengkap Anda"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  disabled={isSaving}
                  className="bg-background"
                />
              </div>

              {/* Username Input */}
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-medium">
                  Username <span className="text-red-500">*</span>
                </label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Masukkan username Anda"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={isSaving}
                  className="bg-background"
                />
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Masukkan alamat email Anda"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={true}
                  className="bg-background"
                />
                <p className="text-xs text-muted-foreground">
                  Email Anda dari akun Supabase: {originalData.email || "-"}
                </p>
              </div>

              {/* Phone Number Input */}
              <div className="space-y-2">
                <label htmlFor="phoneNumber" className="block text-sm font-medium">
                  Nomor WhatsApp
                </label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="Contoh: +62812345678 atau 08123456789"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  disabled={isSaving}
                  className="bg-background"
                />
                <p className="text-xs text-muted-foreground">
                  Nomor WhatsApp untuk keperluan komunikasi dengan ahli kesehatan
                </p>
              </div>

              {/* Changes Alert */}
              {hasChanges && (
                <div className="p-4 bg-blue-500/10 border border-blue-200 rounded-lg flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  <p className="text-sm text-blue-900">
                    Anda memiliki perubahan yang belum disimpan
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isSaving || !hasChanges}
                  className="gap-2 flex-1"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Simpan Perubahan
                    </>
                  )}
                </Button>
                <Link href="/dashboard">
                  <Button variant="outline" type="button">
                    Batal
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Informasi Akun</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">User ID</p>
              <p className="font-mono text-xs bg-muted p-2 rounded break-all">
                {userId}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Email Akun (tidak dapat diubah)</p>
              <p className="text-muted-foreground">{originalData.email || "-"}</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
