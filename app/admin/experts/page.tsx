"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  HeartPulse,
  Loader2,
  Plus,
  Edit2,
  Trash2,
  Users,
  AlertCircle,
  Info,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Expert {
  id: string;
  name: string;
  specialty: string;
  phone_number?: string;
  email?: string;
  bio?: string;
  created_at?: string;
}

export default function AdminExpertsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    specialty: "",
    phone_number: "",
    email: "",
    bio: "",
  });

  useEffect(() => {
    const checkAuth = () => {
      const adminToken = localStorage.getItem("adminToken");
      if (!adminToken) {
        router.push("/admin/login");
        return;
      }
      setIsAuthorized(true);
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (!isAuthorized) return;

    const fetchExperts = async () => {
      try {
        const { data, error } = await supabase
          .from("experts")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Supabase error:", error);
          throw new Error(error.message || "Gagal memuat data pakar");
        }

        setExperts(data || []);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching experts:", error);
        const errorMessage = error instanceof Error ? error.message : "Gagal memuat data pakar. Pastikan table experts sudah dibuat di Supabase.";
        setDbError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        setIsLoading(false);
        // Set empty experts array to allow UI to render
        setExperts([]);
      }
    };

    fetchExperts();
  }, [isAuthorized, supabase, toast]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    router.push("/admin/login");
    router.refresh();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenDialog = (expert?: Expert) => {
    if (expert) {
      setEditingId(expert.id);
      setFormData({
        name: expert.name,
        specialty: expert.specialty,
        phone_number: expert.phone_number || "",
        email: expert.email || "",
        bio: expert.bio || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        specialty: "",
        phone_number: "",
        email: "",
        bio: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData({
      name: "",
      specialty: "",
      phone_number: "",
      email: "",
      bio: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.specialty.trim()) {
      toast({
        title: "Error",
        description: "Nama dan spesialisasi harus diisi",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingId) {
        // Update existing expert
        const { error } = await supabase
          .from("experts")
          .update({
            name: formData.name,
            specialty: formData.specialty,
            phone_number: formData.phone_number || null,
            email: formData.email || null,
            bio: formData.bio || null,
          })
          .eq("id", editingId);

        if (error) throw error;

        toast({
          title: "Sukses",
          description: "Data pakar berhasil diperbarui",
        });
      } else {
        // Create new expert
        const { error } = await supabase.from("experts").insert([
          {
            name: formData.name,
            specialty: formData.specialty,
            phone_number: formData.phone_number || null,
            email: formData.email || null,
            bio: formData.bio || null,
          },
        ]);

        if (error) throw error;

        toast({
          title: "Sukses",
          description: "Data pakar berhasil ditambahkan",
        });
      }

      handleCloseDialog();

      // Refresh data
      const { data } = await supabase
        .from("experts")
        .select("*")
        .order("created_at", { ascending: false });

      setExperts(data || []);
    } catch (error) {
      console.error("Error submitting form:", error);
      const errorMessage = error instanceof Error ? error.message : (editingId
          ? "Gagal memperbarui data pakar"
          : "Gagal menambahkan data pakar");
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data pakar ini?")) {
      return;
    }

    try {
      const { error } = await supabase.from("experts").delete().eq("id", id);

      if (error) throw error;

      if (error) throw error;

      toast({
        title: "Sukses",
        description: "Data pakar berhasil dihapus",
      });

      setExperts(experts.filter((e) => e.id !== id));
    } catch (error) {
      console.error("Error deleting expert:", error);
      const errorMessage = error instanceof Error ? error.message : "Gagal menghapus data pakar";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <AdminSidebar onLogout={handleLogout} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HeartPulse className="h-8 w-8 text-primary" />
              <div>
                <span className="text-xl font-bold text-foreground">EduSehat</span>
                <p className="text-xs text-muted-foreground">Admin Panel</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Database Error Alert */}
            {dbError && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Database Error</AlertTitle>
                <AlertDescription>
                  <p className="mb-2">{dbError}</p>
                  <p className="text-sm">
                    Silakan jalankan migration script berikut di Supabase SQL Editor:
                  </p>
                  <code className="block bg-black/20 p-2 rounded mt-2 text-xs overflow-x-auto">
                    {`CREATE TABLE IF NOT EXISTS public.experts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  phone_number TEXT,
  email TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);`}
                  </code>
                </AlertDescription>
              </Alert>
            )}

            {/* Title */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Kelola Data Pakar
                </h1>
                <p className="text-muted-foreground">
                  Mengelola data ahli kesehatan yang membantu menjawab pertanyaan
                  pengguna
                </p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="gap-2"
                    onClick={() => handleOpenDialog()}
                  >
                    <Plus className="h-4 w-4" />
                    Tambah Pakar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingId ? "Edit Data Pakar" : "Tambah Pakar Baru"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingId
                        ? "Perbarui informasi pakar kesehatan"
                        : "Masukkan informasi pakar kesehatan baru"}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nama Pakar *</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Masukkan nama pakar"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="specialty">Spesialisasi *</Label>
                      <Input
                        id="specialty"
                        name="specialty"
                        placeholder="Contoh: Dokter Jantung, Apoteker, dll"
                        value={formData.specialty}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Masukkan email pakar"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone_number">Nomor Telepon</Label>
                      <Input
                        id="phone_number"
                        name="phone_number"
                        placeholder="Contoh: +62812345678"
                        value={formData.phone_number}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Deskripsi / Bio</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        placeholder="Deskripsi singkat tentang pakar"
                        value={formData.bio}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-3 justify-end pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCloseDialog}
                        disabled={isSubmitting}
                      >
                        Batal
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Menyimpan...
                          </>
                        ) : (
                          "Simpan"
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Experts Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Daftar Pakar ({experts.length})
                </CardTitle>
                <CardDescription>
                  Total pakar yang terdaftar dalam sistem
                </CardDescription>
              </CardHeader>
              <CardContent>
                {experts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nama</TableHead>
                          <TableHead>Spesialisasi</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Telepon</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {experts.map((expert) => (
                          <TableRow key={expert.id}>
                            <TableCell className="font-medium">
                              {expert.name}
                            </TableCell>
                            <TableCell>
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                {expert.specialty}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm">
                              {expert.email || "-"}
                            </TableCell>
                            <TableCell className="text-sm">
                              {expert.phone_number || "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenDialog(expert)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleDelete(expert.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Belum ada data pakar</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
