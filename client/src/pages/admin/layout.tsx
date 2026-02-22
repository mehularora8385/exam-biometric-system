import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, Database, Clock, Building2, Users, Map, 
  UploadCloud, MonitorSmartphone, BarChart4, ChevronDown, 
  ChevronRight, Menu, Settings, UserCircle, LogOut, FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
  const [masterExpanded, setMasterExpanded] = useState(false);
  const [reportExpanded, setReportExpanded] = useState(false);

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  const navItemClass = (isActive: boolean) => cn(
    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors cursor-pointer",
    isActive ? "bg-[#e5eefa] text-[#1a56db] font-semibold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
  );

  const subNavItemClass = (isActive: boolean) => cn(
    "flex items-center gap-3 px-4 py-2.5 pl-11 rounded-lg text-sm transition-colors cursor-pointer",
    isActive ? "bg-[#e5eefa] text-[#1a56db] font-semibold" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar */}
      <aside className={cn(
        "bg-white border-r border-slate-200 transition-all duration-300 flex flex-col fixed inset-y-0 left-0 z-50",
        sidebarOpen ? "w-[280px]" : "w-0 -translate-x-full"
      )}>
        <div className="h-16 flex items-center justify-center border-b border-slate-200 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1a56db] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg leading-none tracking-tighter">BV</span>
            </div>
            <span className="font-bold text-xl text-slate-800 tracking-tight">BioVerify</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          <div className={navItemClass(activePage === "dashboard")} onClick={() => setActivePage("dashboard")}>
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </div>

          <div>
            <div 
              className={cn("flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-colors cursor-pointer", 
                ["department", "designation", "exam"].includes(activePage) ? "text-[#1a56db] font-semibold" : "text-slate-600 hover:bg-slate-50"
              )}
              onClick={() => setMasterExpanded(!masterExpanded)}
            >
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5" />
                <span>Add Master</span>
              </div>
              {masterExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </div>
            
            {masterExpanded && (
              <div className="mt-1 space-y-1">
                <div className={subNavItemClass(activePage === "department")} onClick={() => setActivePage("department")}>Department</div>
                <div className={subNavItemClass(activePage === "designation")} onClick={() => setActivePage("designation")}>Designation</div>
                <div className={subNavItemClass(activePage === "exam")} onClick={() => setActivePage("exam")}>Exam</div>
                <div className={subNavItemClass(activePage === "upload-instruction")} onClick={() => setActivePage("upload-instruction")}>Upload Instruction</div>
                <div className={subNavItemClass(activePage === "omr-setup")} onClick={() => setActivePage("omr-setup")}>OMR Sheet Setup</div>
              </div>
            )}
          </div>

          <div className={navItemClass(activePage === "slot")} onClick={() => setActivePage("slot")}>
            <Clock className="w-5 h-5" />
            <span>Slot Management</span>
          </div>

          <div className={navItemClass(activePage === "center")} onClick={() => setActivePage("center")}>
            <Building2 className="w-5 h-5" />
            <span>Center Master</span>
          </div>

          <div className={navItemClass(activePage === "operator")} onClick={() => setActivePage("operator")}>
            <Users className="w-5 h-5" />
            <span>Operator Master</span>
          </div>

          <div className={navItemClass(activePage === "center-operator-map")} onClick={() => setActivePage("center-operator-map")}>
            <Map className="w-5 h-5" />
            <span>Center Operator Map</span>
          </div>

          <div className={navItemClass(activePage === "upload-candidate")} onClick={() => setActivePage("upload-candidate")}>
            <UploadCloud className="w-5 h-5" />
            <span>Upload Candidate Data</span>
          </div>

          <div className={navItemClass(activePage === "exam-dashboard")} onClick={() => setLocation("/exam-dashboard")}>
            <LayoutDashboard className="w-5 h-5" />
            <span>Exam Wise Dashboard</span>
          </div>

          <div className={navItemClass(activePage === "device-mapping")} onClick={() => setActivePage("device-mapping")}>
            <MonitorSmartphone className="w-5 h-5" />
            <span>Device Mapping List</span>
          </div>

          <div>
            <div 
              className={cn("flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-colors cursor-pointer", 
                activePage === "reports" ? "text-[#1a56db] font-semibold" : "text-slate-600 hover:bg-slate-50"
              )}
              onClick={() => setReportExpanded(!reportExpanded)}
            >
              <div className="flex items-center gap-3">
                <BarChart4 className="w-5 h-5" />
                <span>Report</span>
              </div>
              {reportExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </div>
            
            {reportExpanded && (
              <div className="mt-1 space-y-1">
                <div className={subNavItemClass(activePage === "reports")} onClick={() => setActivePage("reports")}>Exam Center Wise Report</div>
                <div className={subNavItemClass(false)}>Date Wise Verification Report</div>
                <div className={subNavItemClass(false)}>Duplicate Fingerprint Report</div>
                <div className={subNavItemClass(false)}>Invalid Photo Report</div>
                <div className={subNavItemClass(false)}>Operator Login Report</div>
                <div className={subNavItemClass(false)}>Time Misuse Report</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={cn("flex-1 flex flex-col min-h-screen transition-all duration-300", sidebarOpen ? "ml-[280px]" : "ml-0")}>
        {/* Topbar */}
        <header className="h-16 bg-[#1a56db] text-white flex items-center justify-between px-4 sticky top-0 z-40 shadow-md">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 hover:bg-white/10 rounded-md transition-colors">
              <Menu className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-1.5 hover:bg-white/10 rounded-md transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-white/10 rounded-md transition-colors">
              <UserCircle className="w-6 h-6" />
              <span className="text-sm font-medium">Welcome, Admin</span>
            </div>
            <button onClick={handleLogout} className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-red-100 hover:text-white ml-2" title="Logout">
              <LogOut className="w-5 h-5" />
            </button>
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