import React, { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/lib/store";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, UserCheck, Clock, AlertCircle, Building2, Smartphone, TrendingUp, Search, 
  Shield, ChevronLeft, LayoutDashboard, GraduationCap, Eye, Loader2,
  Phone, Mail, MapPin, CheckCircle2, XCircle, Monitor
} from "lucide-react";
import { cn } from "@/lib/utils";

type TabType = "dashboard" | "operators" | "students";

export default function ClientDashboard() {
  const [, setLocation] = useLocation();
  const { logout, operator } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [selectedExamId, setSelectedExamId] = useState<number | undefined>(undefined);
  const [operatorSearch, setOperatorSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [studentStatusFilter, setStudentStatusFilter] = useState("all");

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  const { data: examList = [] } = useQuery({
    queryKey: ["exams"],
    queryFn: () => api.exams.list(),
  });

  const { data: dashStats, isLoading: statsLoading } = useQuery({
    queryKey: ["client-dashboard", selectedExamId],
    queryFn: () => api.client.dashboard(selectedExamId),
  });

  const { data: operatorList = [], isLoading: opsLoading } = useQuery({
    queryKey: ["client-operators", selectedExamId],
    queryFn: () => api.client.operators(selectedExamId),
    enabled: activeTab === "operators",
  });

  const { data: candidateList = [], isLoading: candidatesLoading } = useQuery({
    queryKey: ["client-candidates", selectedExamId],
    queryFn: () => api.client.candidates(selectedExamId),
    enabled: activeTab === "students",
  });

  const selectedExam = examList.find((e: any) => e.id === selectedExamId);
  const examTitle = selectedExam ? selectedExam.name : "All Exams";
  const clientName = operator?.name || "Client";

  const filteredOperators = operatorList.filter((op: any) => {
    const q = operatorSearch.toLowerCase();
    return !q || op.name?.toLowerCase().includes(q) || op.phone?.includes(q) || op.email?.toLowerCase().includes(q) || op.centerName?.toLowerCase().includes(q);
  });

  const filteredCandidates = candidateList.filter((c: any) => {
    const q = studentSearch.toLowerCase();
    const matchesSearch = !q || c.name?.toLowerCase().includes(q) || c.rollNo?.includes(q) || c.fatherName?.toLowerCase().includes(q) || c.centreCode?.includes(q);
    const matchesStatus = studentStatusFilter === "all" || c.status?.toLowerCase() === studentStatusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const tabs = [
    { key: "dashboard" as TabType, label: "Dashboard", icon: LayoutDashboard },
    { key: "operators" as TabType, label: "Operators", icon: Users },
    { key: "students" as TabType, label: "Students", icon: GraduationCap },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans antialiased">
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 pr-6 border-r border-gray-200 h-8">
            <Shield className="w-6 h-6 text-gray-400" />
            <span className="font-bold text-[13px] text-gray-800 leading-tight uppercase">
              MPA VERIFICATION<br/>SYSTEM
            </span>
          </div>

          <div className="flex items-center gap-3">
            <select
              data-testid="select-exam-filter"
              value={selectedExamId ?? ""}
              onChange={(e) => setSelectedExamId(e.target.value ? Number(e.target.value) : undefined)}
              className="appearance-none bg-white border border-gray-200 text-gray-700 py-1.5 pl-3 pr-8 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]"
            >
              <option value="">All Exams</option>
              {examList.map((exam: any) => (
                <option key={exam.id} value={exam.id}>{exam.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                data-testid={`tab-${tab.key}`}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                  activeTab === tab.key
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full">
            <Eye className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-xs font-semibold text-amber-700">VIEW ONLY</span>
          </div>
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleLogout} title="Click to logout" data-testid="btn-logout">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                {clientName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-800 leading-none">{clientName}</span>
                <span className="text-xs text-gray-500">Client View</span>
              </div>
              <ChevronLeft className="w-4 h-4 text-gray-400 -rotate-90 ml-1" />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-[1400px] w-full mx-auto pb-10">
        {activeTab === "dashboard" && <DashboardTab stats={dashStats} loading={statsLoading} examTitle={examTitle} />}
        {activeTab === "operators" && <OperatorsTab operators={filteredOperators} loading={opsLoading} search={operatorSearch} setSearch={setOperatorSearch} examTitle={examTitle} />}
        {activeTab === "students" && <StudentsTab candidates={filteredCandidates} loading={candidatesLoading} search={studentSearch} setSearch={setStudentSearch} statusFilter={studentStatusFilter} setStatusFilter={setStudentStatusFilter} examTitle={examTitle} />}
      </main>
    </div>
  );
}

function DashboardTab({ stats, loading, examTitle }: { stats: any; loading: boolean; examTitle: string }) {
  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  const s = stats || { totalCandidates: 0, verified: 0, pending: 0, notVerified: 0, totalCenters: 0, activeCenters: 0, totalOperators: 0, activeOperators: 0, centerStats: [] };
  const completionPct = s.totalCandidates > 0 ? Math.round((s.verified / s.totalCandidates) * 100) : 0;
  const presentPct = s.totalCandidates > 0 ? Math.round(((s.verified + s.pending) / s.totalCandidates) * 100) : 0;
  const operatorPct = s.totalOperators > 0 ? Math.round((s.activeOperators / s.totalOperators) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-[28px] font-bold text-gray-900 tracking-tight" data-testid="text-dashboard-title">Exam Dashboard</h1>
        <p className="text-gray-500 text-[15px]">Live monitoring for {examTitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-5 flex justify-between">
            <div className="flex flex-col justify-between">
              <span className="text-[15px] font-medium text-gray-500">Total Candidates</span>
              <span className="text-3xl font-bold text-gray-900 mt-2" data-testid="text-total-candidates">{s.totalCandidates.toLocaleString()}</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div className="flex flex-col">
                <span className="text-[15px] font-medium text-gray-500">Verified</span>
                <span className="text-3xl font-bold text-gray-900 mt-2" data-testid="text-verified-count">{s.verified.toLocaleString()}</span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                <UserCheck className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-3 text-sm">
              <span className="text-gray-500">{completionPct}% complete</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-5 flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-[15px] font-medium text-gray-500">Pending</span>
              <span className="text-3xl font-bold text-gray-900 mt-2" data-testid="text-pending-count">{s.pending.toLocaleString()}</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600">
              <Clock className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-5 flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-[15px] font-medium text-gray-500">Not Verified</span>
              <span className="text-3xl font-bold text-gray-900 mt-2" data-testid="text-not-verified">{s.notVerified.toLocaleString()}</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              <AlertCircle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-none bg-[#f0f7ff] rounded-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100/50 flex items-center justify-center text-blue-600">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-blue-800">Active Centres</div>
              <div className="text-xl font-bold text-gray-900" data-testid="text-active-centers">{s.activeCenters}/{s.totalCenters}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-[#f0fdf4] rounded-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-100/50 flex items-center justify-center text-green-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-green-800">Active Operators</div>
              <div className="text-xl font-bold text-gray-900" data-testid="text-active-operators">{s.activeOperators}/{s.totalOperators}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-[#faf5ff] rounded-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-100/50 flex items-center justify-center text-purple-600">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-purple-800">Synced Devices</div>
              <div className="text-xl font-bold text-gray-900">{s.activeOperators}/{s.totalOperators}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-[#fffbeb] rounded-xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-100/50 flex items-center justify-center text-yellow-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-yellow-800">Present Today</div>
              <div className="text-xl font-bold text-gray-900">{(s.verified + s.pending).toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-sm border-gray-100 rounded-xl lg:col-span-2">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-8 text-[17px]">Centre-wise Verification Status</h3>
            <div className="h-64 flex items-end justify-around gap-2 px-4 border-l border-b border-gray-100 pb-2 relative">
              <div className="absolute left-[-40px] top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400 py-0">
                <span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span>
              </div>
              <div className="absolute inset-0 border-t border-gray-100 border-dashed top-[25%]" />
              <div className="absolute inset-0 border-t border-gray-100 border-dashed top-[50%]" />
              <div className="absolute inset-0 border-t border-gray-100 border-dashed top-[75%]" />

              {(s.centerStats || []).map((cs: any, i: number) => {
                const vPct = cs.total > 0 ? (cs.verified / cs.total) * 100 : 0;
                const pPct = cs.total > 0 ? (cs.pending / cs.total) * 100 : 0;
                const nPct = cs.total > 0 ? ((cs.total - cs.verified - cs.pending) / cs.total) * 100 : 0;
                return (
                  <div key={i} className="flex flex-col items-center justify-end h-full relative z-10 w-full hover:bg-gray-50/50 rounded-t-lg transition-colors group/bar" data-testid={`bar-center-${cs.code}`}>
                    <div className="flex items-end gap-1.5 h-full w-full justify-center">
                      <div className="w-[25%] max-w-[14px] bg-green-500 rounded-t-sm transition-all" style={{ height: `${vPct}%` }} />
                      <div className="w-[25%] max-w-[14px] bg-amber-500 rounded-t-sm transition-all" style={{ height: `${pPct}%` }} />
                      <div className="w-[25%] max-w-[14px] bg-red-500 rounded-t-sm transition-all" style={{ height: `${nPct}%` }} />
                    </div>
                    <div className="absolute -bottom-7 text-[11px] text-gray-500 whitespace-nowrap">{cs.code}</div>
                  </div>
                );
              })}
              {(s.centerStats || []).length === 0 && (
                <div className="flex items-center justify-center w-full h-full text-gray-400 text-sm">No centre data available</div>
              )}
            </div>
            <div className="h-6 w-full"></div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-6 text-[17px]">Verification Status</h3>
            <div className="flex flex-col justify-center items-center h-64 mt-4">
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  {(() => {
                    const total = s.totalCandidates || 1;
                    const vAngle = (s.verified / total) * 251.2;
                    const pAngle = (s.pending / total) * 251.2;
                    return (
                      <>
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e5e7eb" strokeWidth="15" />
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#22c55e" strokeWidth="15" strokeDasharray="251.2" strokeDashoffset={251.2 - vAngle} />
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="15" strokeDasharray="251.2" strokeDashoffset={251.2 - pAngle} style={{ transform: `rotate(${(vAngle / 251.2) * 360}deg)`, transformOrigin: '50px 50px' }} />
                      </>
                    );
                  })()}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{completionPct}%</div>
                    <div className="text-xs text-gray-500">Complete</div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center gap-4 mt-8 text-xs font-medium w-full">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-500 rounded-sm"></div> <span className="text-gray-500">Not Verified</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-amber-500 rounded-sm"></div> <span className="text-gray-500">Pending</span></div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-green-500 rounded-sm"></div> <span className="text-gray-500">Verified</span></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-6 h-full flex items-center justify-around">
            <CircularProgress value={completionPct} label="Verified" sublabel={`${s.verified.toLocaleString()} / ${s.totalCandidates.toLocaleString()}`} strokeClass="stroke-green-500" />
            <CircularProgress value={presentPct} label="Present" sublabel={`${(s.verified + s.pending).toLocaleString()} / ${s.totalCandidates.toLocaleString()}`} strokeClass="stroke-blue-600" />
            <CircularProgress value={operatorPct} label="Operators" sublabel={`${s.activeOperators} / ${s.totalOperators}`} strokeClass="stroke-indigo-500" />
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100 rounded-xl lg:col-span-2">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-6 text-[17px]">Centre Performance</h3>
            <div className="space-y-3">
              {(s.centerStats || []).slice(0, 5).map((cs: any, i: number) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-600 w-20 truncate">{cs.code}</span>
                  <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${cs.progress}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 w-10 text-right">{cs.progress}%</span>
                </div>
              ))}
              {(s.centerStats || []).length === 0 && (
                <div className="text-center text-gray-400 text-sm py-8">No centre data available</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 text-[17px]">Centre-wise Statistics</h3>
          <p className="text-gray-500 text-[13px] mt-1">Detailed breakdown by examination centre</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap" data-testid="table-center-stats">
            <thead className="text-[11px] text-gray-500 uppercase bg-gray-50/80">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Code</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Centre Name</th>
                <th className="px-6 py-4 font-semibold tracking-wider">City</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Total</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Verified</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Pending</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Operators</th>
                <th className="px-6 py-4 font-semibold tracking-wider min-w-[150px]">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(s.centerStats || []).map((row: any, i: number) => (
                <tr key={i} className="hover:bg-blue-50/30 transition-colors" data-testid={`row-center-${row.code}`}>
                  <td className="px-6 py-4 font-medium text-gray-600">{row.code}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{row.name}</td>
                  <td className="px-6 py-4 text-gray-600">{row.city}</td>
                  <td className="px-6 py-4 font-semibold text-gray-700">{row.total.toLocaleString()}</td>
                  <td className="px-6 py-4 font-semibold text-green-600">{row.verified.toLocaleString()}</td>
                  <td className="px-6 py-4 font-semibold text-amber-500">{row.pending.toLocaleString()}</td>
                  <td className="px-6 py-4 font-medium text-green-600">{row.operators}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${row.progress}%` }}></div>
                      </div>
                      <span className="text-xs font-semibold text-gray-600 w-8">{row.progress}%</span>
                    </div>
                  </td>
                </tr>
              ))}
              {(s.centerStats || []).length === 0 && (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400">No centre data available</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function OperatorsTab({ operators, loading, search, setSearch, examTitle }: { operators: any[]; loading: boolean; search: string; setSearch: (s: string) => void; examTitle: string }) {
  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  const activeCount = operators.filter(o => o.status === "Active").length;
  const inactiveCount = operators.filter(o => o.status !== "Active").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-[28px] font-bold text-gray-900 tracking-tight" data-testid="text-operators-title">Operators</h1>
        <p className="text-gray-500 text-[15px]">View-only operator details for {examTitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-5 flex justify-between items-center">
            <div>
              <div className="text-[15px] font-medium text-gray-500">Total Operators</div>
              <div className="text-3xl font-bold text-gray-900 mt-1" data-testid="text-total-operators">{operators.length}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-5 flex justify-between items-center">
            <div>
              <div className="text-[15px] font-medium text-gray-500">Active</div>
              <div className="text-3xl font-bold text-green-600 mt-1" data-testid="text-active-ops">{activeCount}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-5 flex justify-between items-center">
            <div>
              <div className="text-[15px] font-medium text-gray-500">Inactive</div>
              <div className="text-3xl font-bold text-red-500 mt-1" data-testid="text-inactive-ops">{inactiveCount}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
              <XCircle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden">
        <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50 border-b border-gray-100">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input 
              type="text"
              data-testid="input-search-operators"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search operators..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" 
            />
          </div>
          <div className="text-sm text-gray-500 font-medium">
            Showing {operators.length} operator{operators.length !== 1 ? "s" : ""}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap" data-testid="table-operators">
            <thead className="text-[11px] text-gray-500 uppercase bg-gray-50/80">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">#</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Name</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Phone</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Email</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Centre</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Device</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Last Active</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {operators.map((op: any, i: number) => (
                <tr key={op.id} className="hover:bg-blue-50/30 transition-colors" data-testid={`row-operator-${op.id}`}>
                  <td className="px-6 py-4 text-gray-500">{i + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                        {op.name?.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{op.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-gray-400" />{op.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gray-400" />{op.email || "-"}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gray-400" /><span className="text-gray-700">{op.centerName || "-"}</span></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5"><Monitor className="w-3.5 h-3.5 text-gray-400" /><span className="text-gray-600">{op.device || "Not bound"}</span></div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{op.lastActive || "Never"}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-semibold",
                      op.status === "Active" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                    )}>
                      {op.status}
                    </span>
                  </td>
                </tr>
              ))}
              {operators.length === 0 && (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-400">No operators found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function StudentsTab({ candidates, loading, search, setSearch, statusFilter, setStatusFilter, examTitle }: { candidates: any[]; loading: boolean; search: string; setSearch: (s: string) => void; statusFilter: string; setStatusFilter: (s: string) => void; examTitle: string }) {
  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  const verifiedCount = candidates.filter(c => c.status === "Verified").length;
  const pendingCount = candidates.filter(c => c.status === "Pending").length;
  const rejectedCount = candidates.filter(c => c.status === "Rejected").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-[28px] font-bold text-gray-900 tracking-tight" data-testid="text-students-title">Students / Candidates</h1>
        <p className="text-gray-500 text-[15px]">View-only candidate details for {examTitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-5 flex justify-between items-center">
            <div>
              <div className="text-[15px] font-medium text-gray-500">Total Students</div>
              <div className="text-3xl font-bold text-gray-900 mt-1" data-testid="text-total-students">{candidates.length.toLocaleString()}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <GraduationCap className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-5 flex justify-between items-center">
            <div>
              <div className="text-[15px] font-medium text-gray-500">Verified</div>
              <div className="text-3xl font-bold text-green-600 mt-1">{verifiedCount.toLocaleString()}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
              <UserCheck className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-5 flex justify-between items-center">
            <div>
              <div className="text-[15px] font-medium text-gray-500">Pending</div>
              <div className="text-3xl font-bold text-amber-500 mt-1">{pendingCount.toLocaleString()}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600">
              <Clock className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-5 flex justify-between items-center">
            <div>
              <div className="text-[15px] font-medium text-gray-500">Rejected</div>
              <div className="text-3xl font-bold text-red-500 mt-1">{rejectedCount.toLocaleString()}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
              <XCircle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden">
        <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50 border-b border-gray-100">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input 
                type="text"
                data-testid="input-search-students"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, roll no, centre..." 
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow" 
              />
            </div>
            <select
              data-testid="select-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="text-sm text-gray-500 font-medium">
            Showing {candidates.length.toLocaleString()} student{candidates.length !== 1 ? "s" : ""}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap" data-testid="table-students">
            <thead className="text-[11px] text-gray-500 uppercase bg-gray-50/80">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">#</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Roll No</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Name</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Father Name</th>
                <th className="px-6 py-4 font-semibold tracking-wider">DOB</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Centre</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Slot</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Match %</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Verified At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {candidates.map((c: any, i: number) => (
                <tr key={c.id} className="hover:bg-blue-50/30 transition-colors" data-testid={`row-student-${c.id}`}>
                  <td className="px-6 py-4 text-gray-500">{i + 1}</td>
                  <td className="px-6 py-4 font-mono font-semibold text-gray-800">{c.rollNo}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {c.photoUrl ? (
                        <img src={c.photoUrl} className="w-8 h-8 rounded-full object-cover border border-gray-200" alt="" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-bold">
                          {c.name?.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium text-gray-900">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{c.fatherName || "-"}</td>
                  <td className="px-6 py-4 text-gray-600">{c.dob || "-"}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-gray-700 font-medium">{c.centreCode || "-"}</span>
                      <span className="text-[11px] text-gray-400">{c.centreName || ""}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{c.slot || "-"}</td>
                  <td className="px-6 py-4">
                    {c.matchPercent ? (
                      <span className={cn(
                        "font-semibold",
                        Number(c.matchPercent) >= 75 ? "text-green-600" :
                        Number(c.matchPercent) >= 50 ? "text-amber-500" : "text-red-500"
                      )}>
                        {c.matchPercent}%
                      </span>
                    ) : <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-semibold",
                      c.status === "Verified" ? "bg-green-50 text-green-700" :
                      c.status === "Pending" ? "bg-amber-50 text-amber-700" :
                      c.status === "Rejected" ? "bg-red-50 text-red-600" :
                      "bg-gray-50 text-gray-600"
                    )}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{c.verifiedAt || "-"}</td>
                </tr>
              ))}
              {candidates.length === 0 && (
                <tr><td colSpan={10} className="px-6 py-12 text-center text-gray-400">No students found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function CircularProgress({ value, label, sublabel, strokeClass }: { value: number, label: string, sublabel: string, strokeClass: string }) {
  const dashoffset = 226 - (226 * value) / 100;
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28 flex items-center justify-center mb-2">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="36" fill="transparent" stroke="#f1f5f9" strokeWidth="10" />
          <circle 
            cx="50" cy="50" r="36" 
            fill="transparent" 
            className={strokeClass} 
            strokeWidth="10" 
            strokeDasharray="226" 
            strokeDashoffset={dashoffset} 
            strokeLinecap="round" 
            style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-bold text-2xl text-gray-900">{value}%</div>
      </div>
      <div className="text-sm font-semibold text-gray-700">{label}</div>
      <div className="text-[11px] text-gray-400 mt-0.5">{sublabel}</div>
    </div>
  );
}
