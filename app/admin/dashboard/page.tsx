"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  HeartPulse,
  LogOut,
  Loader2,
  Users,
  CheckCircle2,
  AlertCircle,
  Download,
} from "lucide-react";

interface UserMonitoring {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  completed_at?: string;
  stage_id: string;
  stage_title: string;
}

interface ReportStats {
  totalUsers: number;
  completedMonitoring: number;
  completedCommitment: number;
  completedAll: number;
  completionRate: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [monitoringData, setMonitoringData] = useState<UserMonitoring[]>([]);
  const [commitmentData, setCommitmentData] = useState<UserMonitoring[]>([]);
  const [stats, setStats] = useState<ReportStats>({
    totalUsers: 0,
    completedMonitoring: 0,
    completedCommitment: 0,
    completedAll: 0,
    completionRate: 0,
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

    const fetchReportData = async () => {
      try {
        // Create user map first
        const userMap = new Map();

        // Get all user progress data
        const { data: progress, error: progressError } = await supabase
          .from("user_progress")
          .select("user_id, stage_id, completed, completed_at");

        if (progressError) throw progressError;

        // Get profiles data
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username, email");

        console.log("Profiles query error:", profilesError);
        console.log("Profiles data:", profiles);

        if (profilesError) {
          // Jika kolom email belum ada, query tanpa email
          const { data: profilesWithoutEmail, error: errorWithoutEmail } = await supabase
            .from("profiles")
            .select("id, username");
          
          console.log("Profiles without email error:", errorWithoutEmail);
          console.log("Profiles without email data:", profilesWithoutEmail);

          if (errorWithoutEmail) throw errorWithoutEmail;
          
          if (profilesWithoutEmail) {
            profilesWithoutEmail.forEach(profile => {
              userMap.set(profile.id, {
                email: `${profile.username}@eduseat.com`,
                full_name: profile.username || "Unknown",
              });
            });
          }
        } else {
          // Create user map dari profiles
          profiles?.forEach(profile => {
            userMap.set(profile.id, {
              email: profile.email || `${profile.username}@eduseat.com`,
              full_name: profile.username || "Unknown",
            });
          });
        }

        // Get monitoring responses
        const { data: monitoringResponses, error: monitoringError } = await supabase
          .from("monitoring_responses")
          .select("user_id, education_stage, completed_at")
          .order("completed_at", { ascending: false });

        if (monitoringError) throw monitoringError;

        // Get commitment records
        const { data: commitmentRecords, error: commitmentError } = await supabase
          .from("commitment_records")
          .select("user_id, commitment_status, confirmed_at")
          .eq("commitment_status", true)
          .order("confirmed_at", { ascending: false });

        if (commitmentError) throw commitmentError;

        console.log("Monitoring responses:", monitoringResponses);
        console.log("Commitment records:", commitmentRecords);
        console.log("User map:", userMap);

        // Build monitoring data
        const monitoring: UserMonitoring[] = [];
        monitoringResponses?.forEach(m => {
          const user = userMap.get(m.user_id);
          if (user) {
            monitoring.push({
              id: `${m.user_id}-${m.education_stage}`,
              user_id: m.user_id,
              email: user.email,
              full_name: user.full_name,
              completed_at: m.completed_at,
              stage_id: m.education_stage,
              stage_title: m.education_stage.replace("-", " ").toUpperCase(),
            });
          }
        });

        // Build commitment data
        const commitment: UserMonitoring[] = [];
        commitmentRecords?.forEach(c => {
          const user = userMap.get(c.user_id);
          if (user) {
            commitment.push({
              id: c.user_id,
              user_id: c.user_id,
              email: user.email,
              full_name: user.full_name,
              completed_at: c.confirmed_at,
              stage_id: "education-3",
              stage_title: "PENGUATAN & KOMITMEN",
            });
          }
        });

        // Calculate stats
        const totalUsers = userMap.size;
        const uniqueMonitoringUsers = new Set(monitoring.map(m => m.user_id)).size;
        const uniqueCommitmentUsers = new Set(commitment.map(c => c.user_id)).size;
        const completedAll = commitment.length;

        setMonitoringData(monitoring);
        setCommitmentData(commitment);
        setStats({
          totalUsers,
          completedMonitoring: uniqueMonitoringUsers,
          completedCommitment: uniqueCommitmentUsers,
          completedAll,
          completionRate: totalUsers > 0 ? (completedAll / totalUsers) * 100 : 0,
        });
      } catch (error) {
        console.error("Error fetching report data:", error);
        toast({
          title: "Error",
          description: "Gagal mengambil data laporan",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, [isAuthorized, supabase, toast]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    router.push("/admin/login");
    router.refresh();
  };

  const exportToCSV = (data: UserMonitoring[], filename: string) => {
    const headers = ["No.", "Nama Lengkap", "Email", "Status", "Tanggal Selesai"];
    const rows = data.map((item, index) => [
      index + 1,
      item.full_name,
      item.email,
      item.stage_title,
      item.completed_at ? new Date(item.completed_at).toLocaleDateString("id-ID") : "-",
    ]);

    const csv = [
      headers.join(","),
      ...rows.map(row => row.join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  if (!isAuthorized) {
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
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartPulse className="h-8 w-8 text-primary" />
            <div>
              <span className="text-xl font-bold text-foreground">EduSehat</span>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard Laporan</h1>
          <p className="text-muted-foreground">
            Monitoring data user yang telah mengisi monitoring dan komitmen
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total User</p>
                  <p className="text-3xl font-bold mt-2">{stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500/20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Selesai Monitoring</p>
                  <p className="text-3xl font-bold mt-2">{stats.completedMonitoring}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-500/20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Selesai Komitmen</p>
                  <p className="text-3xl font-bold mt-2">{stats.completedCommitment}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-purple-500/20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                  <p className="text-3xl font-bold mt-2">{stats.completionRate.toFixed(1)}%</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-500/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tables */}
        <Tabs defaultValue="monitoring" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="monitoring">
              📊 Data Monitoring ({monitoringData.length})
            </TabsTrigger>
            <TabsTrigger value="commitment">
              💙 Data Komitmen ({commitmentData.length})
            </TabsTrigger>
          </TabsList>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Laporan Monitoring</CardTitle>
                  <CardDescription>
                    Daftar user yang telah mengikuti monitoring edukasi
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => exportToCSV(monitoringData, "monitoring-report")}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">No.</TableHead>
                          <TableHead>Nama Lengkap</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Stage</TableHead>
                          <TableHead>Tanggal Selesai</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {monitoringData.length > 0 ? (
                          monitoringData.map((item, index) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{index + 1}</TableCell>
                              <TableCell>{item.full_name}</TableCell>
                              <TableCell className="text-sm">{item.email}</TableCell>
                              <TableCell>
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                  {item.stage_title}
                                </span>
                              </TableCell>
                              <TableCell>
                                {item.completed_at
                                  ? new Date(item.completed_at).toLocaleDateString("id-ID", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })
                                  : "-"}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              Belum ada data monitoring
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Commitment Tab */}
          <TabsContent value="commitment">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Laporan Komitmen</CardTitle>
                  <CardDescription>
                    Daftar user yang telah mengkonfirmasi komitmen
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => exportToCSV(commitmentData, "commitment-report")}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">No.</TableHead>
                          <TableHead>Nama Lengkap</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Komitmen</TableHead>
                          <TableHead>Tanggal Dikonfirmasi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {commitmentData.length > 0 ? (
                          commitmentData.map((item, index) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{index + 1}</TableCell>
                              <TableCell>{item.full_name}</TableCell>
                              <TableCell className="text-sm">{item.email}</TableCell>
                              <TableCell>
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                  ✓ Berkomitmen
                                </span>
                              </TableCell>
                              <TableCell>
                                {item.completed_at
                                  ? new Date(item.completed_at).toLocaleDateString("id-ID", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })
                                  : "-"}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              Belum ada data komitmen
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
