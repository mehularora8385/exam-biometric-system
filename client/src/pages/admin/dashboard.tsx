import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users, UserCheck, Clock, AlertCircle, Building2, Smartphone,
  FileText, Shield, Activity, ChevronRight, TrendingUp,
  CheckCircle, XCircle, Loader2, BarChart3, Monitor
} from "lucide-react";

interface DashboardProps {
  selectedExamId?: number;
  setActivePage?: (page: string) => void;
}

export default function Dashboard({ selectedExamId, setActivePage }: DashboardProps) {
  const [selectedSlot, setSelectedSlot] = useState<string>("all");
  const slotParam = selectedSlot !== "all" ? selectedSlot : undefined;

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats", selectedExamId, slotParam],
    queryFn: () => api.dashboard.stats(selectedExamId, slotParam),
  });

  const { data: exams = [] } = useQuery({
    queryKey: ["exams"],
    queryFn: api.exams.list,
  });

  const { data: slotsList = [] } = useQuery({
    queryKey: ["slots", selectedExamId],
    queryFn: () => api.slots.list(selectedExamId),
    enabled: !!selectedExamId,
  });

  const { data: alertsData = [] } = useQuery({
    queryKey: ["alerts"],
    queryFn: api.alerts.list,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  const totalCandidates = stats?.totalCandidates ?? 0;
  const verified = stats?.verified ?? 0;
  const pending = stats?.pending ?? 0;
  const notVerified = stats?.notVerified ?? 0;
  const present = stats?.present ?? 0;
  const totalCenters = stats?.totalCenters ?? 0;
  const activeCenters = stats?.activeCenters ?? 0;
  const totalOperators = stats?.totalOperators ?? 0;
  const activeOperators = stats?.activeOperators ?? 0;
  const totalAlerts = stats?.totalAlerts ?? 0;
  const centerStats = stats?.centerStats ?? [];

  const verifiedPct = totalCandidates > 0 ? Math.round((verified / totalCandidates) * 100) : 0;
  const presentPct = totalCandidates > 0 ? Math.round((present / totalCandidates) * 100) : 0;

  const activeExams = exams.filter((e: any) => e.status === "Active").length;
  const draftExams = exams.filter((e: any) => e.status === "Draft").length;
  const stoppedExams = exams.filter((e: any) => e.status === "Stopped").length;

  const criticalAlerts = alertsData.filter((a: any) => a.severity === "critical").length;
  const recentAlerts = alertsData
    .slice()
    .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 4);

  const navigate = (page: string) => {
    if (setActivePage) setActivePage(page);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300 font-sans pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900" data-testid="text-dashboard-title">HQ Admin Dashboard</h1>
          <p className="text-gray-500 text-sm">System overview and quick access</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedExamId && slotsList.length > 0 && (
            <Select value={selectedSlot} onValueChange={setSelectedSlot}>
              <SelectTrigger className="w-[180px] h-8 text-xs" data-testid="select-slot-filter">
                <SelectValue placeholder="All Shifts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Shifts</SelectItem>
                {slotsList.map((s: any) => (
                  <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Badge variant="outline" className="text-xs px-2 py-1 bg-green-50 text-green-700 border-green-200">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" />
            System Online
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          label="Total Exams"
          value={exams.length}
          sub={`${activeExams} active`}
          icon={<FileText className="w-4 h-4" />}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
          testId="text-total-exams"
          onClick={() => navigate("exam")}
        />
        <StatCard
          label="Candidates"
          value={totalCandidates}
          sub={`${verifiedPct}% verified`}
          icon={<Users className="w-4 h-4" />}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          testId="text-total-candidates"
          onClick={() => navigate("candidates")}
        />
        <StatCard
          label="Verified"
          value={verified}
          sub={`${pending} pending`}
          icon={<UserCheck className="w-4 h-4" />}
          iconBg="bg-green-50"
          iconColor="text-green-600"
          testId="text-verified"
        />
        <StatCard
          label="Centres"
          value={totalCenters}
          sub={`${activeCenters} active`}
          icon={<Building2 className="w-4 h-4" />}
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
          testId="text-total-centers"
          onClick={() => navigate("center")}
        />
        <StatCard
          label="Operators"
          value={totalOperators}
          sub={`${activeOperators} online`}
          icon={<Monitor className="w-4 h-4" />}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          testId="text-total-operators"
          onClick={() => navigate("operator")}
        />
        <StatCard
          label="Alerts"
          value={totalAlerts}
          sub={criticalAlerts > 0 ? `${criticalAlerts} critical` : "None critical"}
          icon={<AlertCircle className="w-4 h-4" />}
          iconBg={criticalAlerts > 0 ? "bg-red-50" : "bg-yellow-50"}
          iconColor={criticalAlerts > 0 ? "text-red-600" : "text-yellow-600"}
          testId="text-total-alerts"
          onClick={() => navigate("fraud-analytics")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="shadow-sm border-gray-100 rounded-lg lg:col-span-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Exam Overview</h3>
              <Button variant="ghost" size="sm" className="text-xs h-7 text-blue-600" data-testid="button-view-all-exams" onClick={() => navigate("exam")}>
                View All <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
            <div className="space-y-2">
              {exams.length === 0 && (
                <div className="text-center py-6 text-gray-400 text-sm">No exams created yet</div>
              )}
              {exams.slice(0, 5).map((exam: any) => (
                <div key={exam.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors group" data-testid={`row-exam-${exam.id}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">
                      {exam.code?.substring(0, 2).toUpperCase() || "EX"}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{exam.name}</div>
                      <div className="text-xs text-gray-500">{exam.code} | {exam.client || "N/A"}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-xs text-gray-500 hidden sm:block">
                      {exam.candidatesCount || 0} candidates
                    </div>
                    <Badge className={`text-[10px] px-1.5 py-0 font-medium ${
                      exam.status === "Active" ? "bg-green-50 text-green-700 border-green-200" :
                      exam.status === "Stopped" ? "bg-red-50 text-red-700 border-red-200" :
                      "bg-gray-50 text-gray-600 border-gray-200"
                    }`} variant="outline">
                      {exam.status || "Draft"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100 rounded-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <QuickAction icon={<FileText className="w-4 h-4" />} label="Create Exam" color="blue" onClick={() => navigate("exam")} testId="button-quick-create-exam" />
              <QuickAction icon={<Building2 className="w-4 h-4" />} label="Add Centre" color="orange" onClick={() => navigate("center")} testId="button-quick-add-center" />
              <QuickAction icon={<Users className="w-4 h-4" />} label="Add Operator" color="purple" onClick={() => navigate("operator")} testId="button-quick-add-operator" />
              <QuickAction icon={<Users className="w-4 h-4" />} label="Candidates" color="green" onClick={() => navigate("candidates")} testId="button-quick-candidates" />
              <QuickAction icon={<Smartphone className="w-4 h-4" />} label="Generate APK" color="indigo" onClick={() => navigate("apk")} testId="button-quick-apk" />
              <QuickAction icon={<Monitor className="w-4 h-4" />} label="Devices" color="slate" onClick={() => navigate("device-management")} testId="button-quick-devices" />
              <QuickAction icon={<Shield className="w-4 h-4" />} label="Fraud Check" color="red" onClick={() => navigate("fraud-analytics")} testId="button-quick-fraud" />
              <QuickAction icon={<Activity className="w-4 h-4" />} label="Audit Logs" color="amber" onClick={() => navigate("reports")} testId="button-quick-audit" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="shadow-sm border-gray-100 rounded-lg lg:col-span-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Centre Performance</h3>
              <Button variant="ghost" size="sm" className="text-xs h-7 text-blue-600" data-testid="button-view-all-centres" onClick={() => navigate("center")}>
                View All <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-2 font-medium text-gray-500">Centre</th>
                    <th className="text-center py-2 px-2 font-medium text-gray-500">Total</th>
                    <th className="text-center py-2 px-2 font-medium text-gray-500">Verified</th>
                    <th className="text-center py-2 px-2 font-medium text-gray-500">Present</th>
                    <th className="text-center py-2 px-2 font-medium text-gray-500">Operators</th>
                    <th className="text-center py-2 px-2 font-medium text-gray-500">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {centerStats.slice(0, 6).map((cs: any, i: number) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50" data-testid={`row-center-${cs.centerId}`}>
                      <td className="py-2 px-2">
                        <div className="font-medium text-gray-900">{cs.code}</div>
                        <div className="text-gray-400 text-[10px] truncate max-w-[120px]">{cs.name}</div>
                      </td>
                      <td className="text-center py-2 px-2 text-gray-700">{cs.total}</td>
                      <td className="text-center py-2 px-2">
                        <span className="text-green-600 font-medium">{cs.verified}</span>
                      </td>
                      <td className="text-center py-2 px-2">
                        <span className="text-blue-600 font-medium">{cs.present}</span>
                      </td>
                      <td className="text-center py-2 px-2 text-gray-600">{cs.operators}</td>
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full transition-all"
                              style={{ width: `${cs.progress}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-gray-500 w-7 text-right">{cs.progress}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {centerStats.length === 0 && (
                    <tr><td colSpan={6} className="py-6 text-center text-gray-400 text-xs">No centre data available</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100 rounded-lg">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Recent Alerts</h3>
              <Button variant="ghost" size="sm" className="text-xs h-7 text-blue-600" data-testid="button-view-all-alerts" onClick={() => navigate("fraud-analytics")}>
                View All <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
            <div className="space-y-2">
              {recentAlerts.length === 0 && (
                <div className="text-center py-6 text-gray-400 text-xs flex flex-col items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  No alerts - all clear
                </div>
              )}
              {recentAlerts.map((alert: any) => (
                <div key={alert.id} className="flex items-start gap-2 p-2 rounded-md hover:bg-gray-50 transition-colors" data-testid={`alert-${alert.id}`}>
                  <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    alert.severity === "critical" ? "bg-red-100 text-red-600" :
                    alert.severity === "high" ? "bg-orange-100 text-orange-600" :
                    "bg-yellow-100 text-yellow-600"
                  }`}>
                    <AlertCircle className="w-3 h-3" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-gray-800 truncate">{alert.type?.replace(/_/g, " ") || "Alert"}</div>
                    <div className="text-[10px] text-gray-400 truncate">{alert.message || alert.details || "No details"}</div>
                  </div>
                  <Badge className={`text-[9px] px-1 py-0 flex-shrink-0 ${
                    alert.severity === "critical" ? "bg-red-50 text-red-600 border-red-200" :
                    alert.severity === "high" ? "bg-orange-50 text-orange-600 border-orange-200" :
                    "bg-yellow-50 text-yellow-600 border-yellow-200"
                  }`} variant="outline">
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SummaryBar
          label="Verification Progress"
          value={verifiedPct}
          barColor="bg-green-500"
          stats={[
            { label: "Verified", value: verified, color: "text-green-600" },
            { label: "Pending", value: pending, color: "text-yellow-600" },
            { label: "Not Verified", value: notVerified, color: "text-red-600" },
          ]}
        />
        <SummaryBar
          label="Attendance Rate"
          value={presentPct}
          barColor="bg-blue-500"
          stats={[
            { label: "Present", value: present, color: "text-blue-600" },
            { label: "Absent", value: totalCandidates - present, color: "text-gray-500" },
          ]}
        />
        <Card className="shadow-sm border-gray-100 rounded-lg">
          <CardContent className="p-3">
            <div className="text-xs font-medium text-gray-500 mb-2">Exam Status</div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <span className="text-xs text-gray-700">{activeExams} Active</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                <span className="text-xs text-gray-700">{draftExams} Draft</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-xs text-gray-700">{stoppedExams} Stopped</span>
              </div>
            </div>
            <div className="flex gap-1 mt-2 h-2 rounded-full overflow-hidden bg-gray-100">
              {activeExams > 0 && <div className="bg-green-500 rounded-full" style={{ width: `${(activeExams / Math.max(exams.length, 1)) * 100}%` }} />}
              {draftExams > 0 && <div className="bg-gray-400 rounded-full" style={{ width: `${(draftExams / Math.max(exams.length, 1)) * 100}%` }} />}
              {stoppedExams > 0 && <div className="bg-red-500 rounded-full" style={{ width: `${(stoppedExams / Math.max(exams.length, 1)) * 100}%` }} />}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon, iconBg, iconColor, testId, onClick }: {
  label: string; value: number; sub: string; icon: React.ReactNode;
  iconBg: string; iconColor: string; testId: string; onClick?: () => void;
}) {
  return (
    <Card
      className={`shadow-sm border-gray-100 rounded-lg ${onClick ? "cursor-pointer hover:shadow-md hover:border-gray-200 transition-all" : ""}`}
      onClick={onClick}
      data-testid={testId}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">{label}</span>
          <div className={`w-7 h-7 rounded-md ${iconBg} flex items-center justify-center ${iconColor}`}>
            {icon}
          </div>
        </div>
        <div className="text-xl font-bold text-gray-900">{value.toLocaleString()}</div>
        <div className="text-[11px] text-gray-400 mt-0.5">{sub}</div>
      </CardContent>
    </Card>
  );
}

function QuickAction({ icon, label, color, onClick, testId }: {
  icon: React.ReactNode; label: string; color: string; onClick: () => void; testId: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 hover:bg-blue-100",
    orange: "bg-orange-50 text-orange-600 hover:bg-orange-100",
    purple: "bg-purple-50 text-purple-600 hover:bg-purple-100",
    green: "bg-green-50 text-green-600 hover:bg-green-100",
    indigo: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100",
    slate: "bg-slate-50 text-slate-600 hover:bg-slate-100",
    red: "bg-red-50 text-red-600 hover:bg-red-100",
    amber: "bg-amber-50 text-amber-600 hover:bg-amber-100",
  };
  return (
    <button
      className={`flex flex-col items-center gap-1.5 p-3 rounded-lg transition-colors ${colorMap[color] || colorMap.blue}`}
      onClick={onClick}
      data-testid={testId}
    >
      {icon}
      <span className="text-[10px] font-medium leading-tight text-center">{label}</span>
    </button>
  );
}

function SummaryBar({ label, value, barColor, stats }: {
  label: string; value: number; barColor: string;
  stats: { label: string; value: number; color: string }[];
}) {
  return (
    <Card className="shadow-sm border-gray-100 rounded-lg">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500">{label}</span>
          <span className="text-sm font-bold text-gray-900">{value}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
          <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${value}%` }} />
        </div>
        <div className="flex gap-3">
          {stats.map((s, i) => (
            <div key={i} className="text-[10px]">
              <span className="text-gray-400">{s.label}: </span>
              <span className={`font-medium ${s.color}`}>{s.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
