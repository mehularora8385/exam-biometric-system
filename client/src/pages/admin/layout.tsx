import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  LayoutDashboard, Users, Building2, Smartphone, FileText, 
  ChevronLeft, ChevronDown, Menu, Shield, Users2, FileArchive, 
  Activity, ShieldAlert, Radar, Monitor, LogOut, Wifi, BarChart3, Eye,
  BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api";

interface AdminLayoutProps {
  children: React.ReactNode;
  activePage: string;
  setActivePage: (page: string) => void;
  selectedExamId?: number;
  onExamChange?: (examId: number | undefined) => void;
}

export default function AdminLayout({ children, activePage, setActivePage, selectedExamId, onExamChange }: AdminLayoutProps) {
  const [, setLocation] = useLocation();
  const { logout, state } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

  const { data: examList = [] } = useQuery({
    queryKey: ["exams"],
    queryFn: api.exams.list,
  });

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  const adminName = state.operator?.name || state.operator?.username || "Admin";
  const initials = adminName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();

  const navItemClass = (isActive: boolean) => cn(
    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer mx-2",
    isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
  );

  return (
    <div className="min-h-screen bg-gray-50/50 flex font-sans antialiased">
      <aside className={cn(
        "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col fixed inset-y-0 left-0 z-50",
        sidebarOpen ? "w-[240px]" : "w-0 -translate-x-full"
      )}>
        <div className="h-14 flex items-center justify-between border-b border-gray-200 px-3">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActivePage("dashboard")} data-testid="link-sidebar-home">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-[12px] text-gray-800 leading-tight uppercase">
              MPA VERIFICATION<br/>SYSTEM
            </span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-gray-600 p-1" data-testid="button-collapse-sidebar">
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-3 space-y-0.5">
          <div className={navItemClass(activePage === "dashboard")} onClick={() => setActivePage("dashboard")} data-testid="nav-dashboard">
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </div>

          <div className={navItemClass(activePage === "exam")} onClick={() => setActivePage("exam")} data-testid="nav-exams">
            <FileText className="w-4 h-4" />
            <span>Exams</span>
          </div>

          <div className={navItemClass(activePage === "center")} onClick={() => setActivePage("center")} data-testid="nav-centres">
            <Building2 className="w-4 h-4" />
            <span>Centres</span>
          </div>

          <div className={navItemClass(activePage === "operator")} onClick={() => setActivePage("operator")} data-testid="nav-operators">
            <Users className="w-4 h-4" />
            <span>Operators</span>
          </div>

          <div className={navItemClass(activePage === "candidates")} onClick={() => setActivePage("candidates")} data-testid="nav-candidates">
            <Users2 className="w-4 h-4" />
            <span>Candidates</span>
          </div>

          <div className={navItemClass(activePage === "apk")} onClick={() => setActivePage("apk")} data-testid="nav-apk">
            <Smartphone className="w-4 h-4" />
            <span>Generate APK</span>
          </div>

          <div className={navItemClass(activePage === "api-docs")} onClick={() => setActivePage("api-docs")} data-testid="nav-api-docs">
            <BookOpen className="w-4 h-4" />
            <span>APK API Docs</span>
          </div>

          <div className={navItemClass(activePage === "device-management")} onClick={() => setActivePage("device-management")} data-testid="nav-devices">
            <Monitor className="w-4 h-4" />
            <span>Device Management</span>
          </div>

          <div className={navItemClass(activePage === "reports")} onClick={() => setActivePage("reports")} data-testid="nav-audit-logs">
            <FileArchive className="w-4 h-4" />
            <span>Audit Logs</span>
          </div>

          <div className="pt-3 pb-1.5 px-4">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Advanced Security</p>
          </div>

          <div className={navItemClass(activePage === "ai-command")} onClick={() => setActivePage("ai-command")} data-testid="nav-command-center">
            <Activity className="w-4 h-4" />
            <span>Live Command Center</span>
          </div>

          <div className={navItemClass(activePage === "fraud-analytics")} onClick={() => setActivePage("fraud-analytics")} data-testid="nav-fraud">
            <Shield className="w-4 h-4" />
            <span>Fraud Analytics</span>
          </div>

          <div className={navItemClass(activePage === "biometric-integrity")} onClick={() => setActivePage("biometric-integrity")} data-testid="nav-biometric">
            <ShieldAlert className="w-4 h-4" />
            <span>Biometric Integrity</span>
          </div>
          
          <div className={navItemClass(activePage === "global-surveillance")} onClick={() => setActivePage("global-surveillance")} data-testid="nav-global-tech">
            <Radar className="w-4 h-4" />
            <span>Global Tech (Beta)</span>
          </div>
        </div>
      </aside>

      <div className={cn("flex-1 flex flex-col min-h-screen transition-all duration-300", sidebarOpen ? "ml-[240px]" : "ml-0")}>
        <header className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-500" data-testid="button-open-sidebar">
                <Menu className="w-4 h-4" />
              </button>
            )}
            
            <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-600 rounded text-[11px] font-medium">
              <Wifi className="w-3 h-3" />
              Online
            </div>

            <button
              className="flex items-center gap-1.5 px-2 py-1 hover:bg-gray-100 rounded text-[11px] font-medium text-gray-600 transition-colors"
              onClick={() => setActivePage("center")}
              data-testid="button-centre-view"
            >
              <Building2 className="w-3 h-3" />
              Centre View
            </button>

            <button
              className="flex items-center gap-1.5 px-2 py-1 hover:bg-gray-100 rounded text-[11px] font-medium text-gray-600 transition-colors"
              onClick={() => setActivePage("exam")}
              data-testid="button-exam-view"
            >
              <Eye className="w-3 h-3" />
              Exam View
            </button>
            
            <div className="relative ml-2">
              <select 
                data-testid="select-exam-filter"
                className="appearance-none bg-white border border-gray-200 text-gray-700 py-1 pl-2 pr-6 rounded text-[11px] font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={selectedExamId ?? ""}
                onChange={(e) => onExamChange?.(e.target.value ? Number(e.target.value) : undefined)}
              >
                <option value="">All Exams</option>
                {examList.map((exam: any) => (
                  <option key={exam.id} value={exam.id}>{exam.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-gray-400">
                <ChevronDown className="w-3 h-3" />
              </div>
            </div>
          </div>
          
          <div className="relative">
            <button
              className="flex items-center gap-2 hover:bg-gray-50 px-2 py-1 rounded transition-colors"
              onClick={() => setProfileOpen(!profileOpen)}
              data-testid="button-profile-menu"
            >
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold">
                {initials}
              </div>
              <div className="flex flex-col text-left hidden sm:flex">
                <span className="text-xs font-semibold text-gray-800 leading-none">{adminName}</span>
                <span className="text-[10px] text-gray-500">Admin</span>
              </div>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>
            
            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => { setActivePage("dashboard"); setProfileOpen(false); }}
                    data-testid="button-menu-dashboard"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Dashboard
                  </button>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                    onClick={handleLogout}
                    data-testid="button-logout"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 overflow-x-hidden">
          {children}
        </main>
      </div>
      
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
