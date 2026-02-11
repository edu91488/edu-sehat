"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FileText, Users, LogOut, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function AdminSidebar({ onLogout }: { onLogout: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      id: "laporan",
      label: "Laporan",
      icon: FileText,
      href: "/admin/dashboard",
      description: "Melihat laporan monitoring dan komitmen",
    },
    {
      id: "pakar",
      label: "Kelola Data Pakar",
      icon: Users,
      href: "/admin/experts",
      description: "Mengelola data ahli kesehatan",
    },
  ];

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <aside className={`${isCollapsed ? "w-20" : "w-64"} bg-card border-r border-border h-screen sticky top-0 flex flex-col transition-all duration-300`}>
      {/* Logo Section */}
      <div className="p-6 border-b border-border flex items-center justify-between">
        {!isCollapsed && (
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Menu Admin
          </h2>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`${isCollapsed ? "mx-auto" : ""}`}
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link key={item.id} href={item.href}>
              <button
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isCollapsed ? "justify-center" : ""} ${
                  active
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-foreground hover:bg-secondary/50"
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <div className="text-left flex-1">
                    <p className="font-medium text-sm">{item.label}</p>
                    <p className="text-xs opacity-75">{item.description}</p>
                  </div>
                )}
              </button>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={onLogout}
          className={`w-full flex items-center justify-center gap-2`}
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && "Logout"}
        </Button>
      </div>
    </aside>
  );
}
