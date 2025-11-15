import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { APP_LOGO, APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  BarChart3,
  FileText,
  HelpCircle,
  LayoutDashboard,
  Menu,
  Settings,
  Sparkles,
  Wallet,
  X,
  Users,
  Calendar,
  Shield,
} from "lucide-react";
import { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";

interface AgentLayoutProps {
  children: ReactNode;
}

export default function AgentLayout({ children }: AgentLayoutProps) {
  const { t, i18n } = useTranslation();
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout, loading } = useAuth();

  // Redirect to login if not authenticated
  if (!loading && !user) {
    setLocation("/login");
    return null;
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { path: "/", icon: LayoutDashboard, label: t("nav.dashboard") },
    { path: "/agents", icon: Sparkles, label: t("nav.agents") },
    { path: "/briefings", icon: FileText, label: t("nav.briefings") },
    { path: "/automated-briefings", icon: Calendar, label: "Market Updates" },
    { path: "/teams", icon: Users, label: t("nav.teams") },
    { path: "/credits", icon: Wallet, label: t("nav.credits") },
    { path: "/settings", icon: Settings, label: t("nav.settings") },
    { path: "/help", icon: HelpCircle, label: t("nav.help") },
  ];

  // Add admin-only links
  if (user?.role === 'admin') {
    navItems.splice(4, 0, { path: "/users", icon: Users, label: "Users" });
    navItems.splice(7, 0, { path: "/admin-settings", icon: Shield, label: "Admin Settings" });
  }

  const toggleLanguage = () => {
    const newLang = i18n.language === "de" ? "en" : "de";
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } transition-all duration-300 bg-white border-r border-gray-200 flex flex-col overflow-hidden`}
      >
        {/* Header */}
        <div className="h-40 flex items-center justify-between px-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <img src="/mi42-logo.png" alt="Mi42" className="h-32" />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? "bg-gray-100 text-gray-900 font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        {user && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-sm font-medium">
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{user.name}</div>
                <div className="text-xs text-gray-500 truncate">{user.email}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLanguage}
                className="flex-1 text-xs"
              >
                {i18n.language === "de" ? "EN" : "DE"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => logout()} className="flex-1 text-xs">
                {t("common.logout")}
              </Button>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="font-semibold text-gray-900">{t("app.title")}</span>
          <div className="w-10" />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
