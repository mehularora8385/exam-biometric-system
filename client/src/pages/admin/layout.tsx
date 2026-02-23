import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, Users, Building2, Smartphone, FileText, 
  ChevronLeft, Menu, Shield, Users2, FileArchive, Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

interface AdminLayoutProps {
  children: React.ReactNode;
  activePage: string;
  setActivePage: (page: string) => void;
}

export default function AdminLayout({ children, activePage, setActivePage }: AdminLayoutProps) {
  const [, setLocation] = useLocation();
  const { logout } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  const navItemClass = (isActive: boolean) => cn(
    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer mx-2",
    isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
  );

  return (
    <div className="min-h-screen bg-gray-50/50 flex font-sans antialiased">
      {/* Sidebar */}
      <aside className={cn(
        "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col fixed inset-y-0 left-0 z-50",
        sidebarOpen ? "w-[260px]" : "w-0 -translate-x-full"
      )}>
        <div className="h-16 flex items-center justify-between border-b border-gray-200 px-4">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-gray-400" />
            <span className="font-bold text-[13px] text-gray-800 leading-tight uppercase">
              MPA VERIFICATION<br/>SYSTEM
            </span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-gray-600">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-1">
          <div className={navItemClass(activePage === "dashboard")} onClick={() => setActivePage("dashboard")}>
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </div>

          <div className={navItemClass(activePage === "exam")} onClick={() => setActivePage("exam")}>
            <FileText className="w-5 h-5" />
            <span>Exams</span>
          </div>

          <div className={navItemClass(activePage === "center")} onClick={() => setActivePage("center")}>
            <Building2 className="w-5 h-5" />
            <span>Centres</span>
          </div>

          <div className={navItemClass(activePage === "operator")} onClick={() => setActivePage("operator")}>
            <Users className="w-5 h-5" />
            <span>Operators</span>
          </div>

          <div className={navItemClass(activePage === "candidates")} onClick={() => setActivePage("candidates")}>
            <Users2 className="w-5 h-5" />
            <span>Candidates</span>
          </div>

          <div className={navItemClass(activePage === "apk")} onClick={() => setActivePage("apk")}>
            <Smartphone className="w-5 h-5" />
            <span>Generate APK</span>
          </div>

          <div className={navItemClass(activePage === "reports")} onClick={() => setActivePage("reports")}>
            <FileArchive className="w-5 h-5" />
            <span>Audit Logs</span>
          </div>

          <div className="pt-4 pb-2 px-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Advanced Security</p>
          </div>

          <div className={navItemClass(activePage === "ai-command")} onClick={() => setActivePage("ai-command")}>
            <Activity className="w-5 h-5" />
            <span>Live Command Center</span>
          </div>

          <div className={navItemClass(activePage === "fraud-analytics")} onClick={() => setActivePage("fraud-analytics")}>
            <Shield className="w-5 h-5" />
            <span>Fraud Analytics</span>
          </div>

          <div className={navItemClass(activePage === "biometric-integrity")} onClick={() => setActivePage("biometric-integrity")}>
            <ShieldAlert className="w-5 h-5" />
            <span>Biometric Integrity</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={cn("flex-1 flex flex-col min-h-screen transition-all duration-300", sidebarOpen ? "ml-[260px]" : "ml-0")}>
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button onClick={() => setSidebarOpen(true)} className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-500">
                <Menu className="w-5 h-5" />
              </button>
            )}
            
            <div className="relative">
              <select className="appearance-none bg-white border border-gray-200 text-gray-700 py-1.5 pl-3 pr-8 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>All Exams</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleLogout} title="Click to logout">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                DA
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-800 leading-none">Demo Admin</span>
                <span className="text-xs text-gray-500">Admin</span>
              </div>
              <ChevronLeft className="w-4 h-4 text-gray-400 -rotate-90 ml-1" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-x-hidden">
          {children}
        </main>
      </div>
      
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}