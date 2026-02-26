import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Video, AlertCircle, ScanLine, Maximize2, Radio, Activity,
  Users, UserCheck, Shield, Clock, RefreshCw, Loader2, Wifi, MapPin
} from "lucide-react";

export default function AICommandCenter() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => api.dashboard.stats(),
    refetchInterval: autoRefresh ? 10000 : false,
  });

  const { data: alertsData = [], isLoading: alertsLoading } = useQuery({
    queryKey: ["alerts"],
    queryFn: api.alerts.list,
    refetchInterval: autoRefresh ? 10000 : false,
  });

  const { data: devices = [] } = useQuery({
    queryKey: ["/api/devices"],
    queryFn: () => api.devices.list(),
    refetchInterval: autoRefresh ? 15000 : false,
  });

  const { data: operators = [] } = useQuery({
    queryKey: ["operators"],
    queryFn: api.operators.list,
    refetchInterval: autoRefresh ? 15000 : false,
  });

  const { data: auditLogs = [] } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: api.auditLogs.list,
    refetchInterval: autoRefresh ? 10000 : false,
  });

  const totalCandidates = stats?.totalCandidates ?? 0;
  const verified = stats?.verified ?? 0;
  const pending = stats?.pending ?? 0;
  const totalCenters = stats?.totalCenters ?? 0;
  const activeOperators = stats?.activeOperators ?? 0;
  const totalOperators = stats?.totalOperators ?? 0;
  const openAlerts = alertsData.filter((a: any) => a.status === "Open").length;
  const criticalAlerts = alertsData.filter((a: any) => a.severity === "critical" || a.severity === "Critical").length;
  const onlineDevices = devices.filter((d: any) => d.loginStatus === "Logged In").length;
  const verifiedPct = totalCandidates > 0 ? Math.round((verified / totalCandidates) * 100) : 0;

  const recentLogs = auditLogs
    .slice()
    .sort((a: any, b: any) => {
      try { return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(); } catch { return 0; }
    })
    .slice(0, 8);

  const recentAlerts = alertsData
    .slice()
    .sort((a: any, b: any) => {
      try { return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(); } catch { return 0; }
    })
    .slice(0, 5);

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-300 font-sans pb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900" data-testid="text-command-center-title">Live Command Center</h1>
          <p className="text-sm text-gray-500">Real-time monitoring and operator activity</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            className={`text-xs h-7 ${autoRefresh ? "bg-red-600 hover:bg-red-700" : ""}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
            data-testid="button-toggle-auto-refresh"
          >
            {autoRefresh ? <><Radio className="w-3 h-3 mr-1 animate-pulse" /> Live</> : <><RefreshCw className="w-3 h-3 mr-1" /> Paused</>}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <LiveStatCard label="Verified" value={`${verified}/${totalCandidates}`} sub={`${verifiedPct}%`} color="green" icon={<UserCheck className="w-4 h-4" />} testId="live-verified" />
        <LiveStatCard label="Pending" value={String(pending)} sub="awaiting" color="yellow" icon={<Clock className="w-4 h-4" />} testId="live-pending" />
        <LiveStatCard label="Centres" value={String(totalCenters)} sub="active" color="blue" icon={<MapPin className="w-4 h-4" />} testId="live-centres" />
        <LiveStatCard label="Operators" value={`${activeOperators}/${totalOperators}`} sub="online" color="purple" icon={<Users className="w-4 h-4" />} testId="live-operators" />
        <LiveStatCard label="Devices" value={`${onlineDevices}/${devices.length}`} sub="connected" color="indigo" icon={<Wifi className="w-4 h-4" />} testId="live-devices" />
        <LiveStatCard label="Alerts" value={String(openAlerts)} sub={criticalAlerts > 0 ? `${criticalAlerts} critical` : "none critical"} color={criticalAlerts > 0 ? "red" : "gray"} icon={<AlertCircle className="w-4 h-4" />} testId="live-alerts" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="shadow-sm border-slate-800 rounded-lg overflow-hidden bg-slate-900 text-white lg:col-span-2">
          <div className="p-3 border-b border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-blue-400" />
              <span className="font-medium text-sm">Verification Activity Monitor</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-green-900/50 text-xs rounded text-green-400 border border-green-500/30">System Active</span>
            </div>
          </div>

          <div className="p-3 max-h-[360px] overflow-y-auto">
            {recentLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-slate-500">
                <ScanLine className="w-8 h-8 mb-2 animate-pulse text-blue-500/30" />
                <p className="text-xs">No activity recorded yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentLogs.map((log: any, i: number) => (
                  <div key={log.id || i} className="flex items-start gap-3 p-2 rounded-md bg-slate-800/50 hover:bg-slate-800 transition-colors" data-testid={`log-entry-${log.id || i}`}>
                    <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      log.action?.toLowerCase().includes("verified") || log.action?.toLowerCase().includes("success") ? "bg-green-900/50 text-green-400" :
                      log.action?.toLowerCase().includes("failed") || log.action?.toLowerCase().includes("fail") ? "bg-red-900/50 text-red-400" :
                      log.action?.toLowerCase().includes("login") ? "bg-blue-900/50 text-blue-400" :
                      "bg-slate-700 text-slate-400"
                    }`}>
                      <Activity className="w-3 h-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-slate-200 truncate">{log.action}</span>
                        <span className="text-[10px] text-slate-500 flex-shrink-0">{log.timestamp}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                        {[log.operatorName && `Op: ${log.operatorName}`, log.centreCode && `Centre: ${log.centreCode}`, log.candidateId && `Cand: ${log.candidateId}`].filter(Boolean).join(" | ") || "System event"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card className="shadow-sm border-gray-100 rounded-lg">
          <CardContent className="p-3">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" /> Recent Alerts
            </h3>
            <div className="space-y-2 max-h-[340px] overflow-y-auto">
              {recentAlerts.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs flex flex-col items-center gap-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  All clear - no alerts
                </div>
              ) : (
                recentAlerts.map((alert: any) => (
                  <div key={alert.id} className={`p-2 rounded-md border transition-colors ${
                    alert.severity === "critical" || alert.severity === "Critical" ? "bg-red-50/50 border-red-100" :
                    alert.severity === "high" || alert.severity === "High" ? "bg-orange-50/50 border-orange-100" :
                    "bg-yellow-50/50 border-yellow-100"
                  }`} data-testid={`alert-live-${alert.id}`}>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-800 truncate">{alert.type?.replace(/_/g, " ")}</span>
                      <Badge className={`text-[9px] px-1 py-0 ${
                        alert.severity === "critical" || alert.severity === "Critical" ? "bg-red-100 text-red-700 border-red-200" :
                        alert.severity === "high" || alert.severity === "High" ? "bg-orange-100 text-orange-700 border-orange-200" :
                        "bg-yellow-100 text-yellow-700 border-yellow-200"
                      }`} variant="outline">{alert.severity}</Badge>
                    </div>
                    <p className="text-[10px] text-gray-500 truncate">{alert.description || "No details"}</p>
                    <div className="text-[9px] text-gray-400 mt-1">{alert.timestamp}</div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-sm border-gray-100 rounded-lg">
          <CardContent className="p-3">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Centre Verification Progress</h3>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {(stats?.centerStats || []).map((cs: any, i: number) => (
                <div key={i} className="flex items-center gap-3" data-testid={`centre-progress-${cs.code}`}>
                  <span className="text-xs font-medium text-gray-700 w-16 truncate">{cs.code}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${cs.progress}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-500 w-10 text-right">{cs.progress}%</span>
                  <span className="text-[10px] text-gray-400 w-14 text-right">{cs.verified}/{cs.total}</span>
                </div>
              ))}
              {(!stats?.centerStats || stats.centerStats.length === 0) && (
                <div className="text-center py-4 text-gray-400 text-xs">No centre data</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100 rounded-lg">
          <CardContent className="p-3">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Online Devices</h3>
            <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
              {devices.length === 0 ? (
                <div className="text-center py-4 text-gray-400 text-xs">No devices registered</div>
              ) : (
                devices.slice(0, 8).map((device: any) => (
                  <div key={device.id} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-gray-50 text-xs" data-testid={`device-live-${device.id}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${device.loginStatus === "Logged In" ? "bg-green-500" : "bg-gray-300"}`} />
                      <span className="font-medium text-gray-700">{device.model || device.macAddress || `Device ${device.id}`}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <span>{device.operatorName || "-"}</span>
                      <span>{device.centerName || "-"}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LiveStatCard({ label, value, sub, color, icon, testId }: {
  label: string; value: string; sub: string; color: string; icon: React.ReactNode; testId: string;
}) {
  const colorMap: Record<string, { bg: string; text: string; icon: string }> = {
    green: { bg: "bg-green-50", text: "text-green-700", icon: "bg-green-100 text-green-600" },
    yellow: { bg: "bg-yellow-50", text: "text-yellow-700", icon: "bg-yellow-100 text-yellow-600" },
    blue: { bg: "bg-blue-50", text: "text-blue-700", icon: "bg-blue-100 text-blue-600" },
    purple: { bg: "bg-purple-50", text: "text-purple-700", icon: "bg-purple-100 text-purple-600" },
    indigo: { bg: "bg-indigo-50", text: "text-indigo-700", icon: "bg-indigo-100 text-indigo-600" },
    red: { bg: "bg-red-50", text: "text-red-700", icon: "bg-red-100 text-red-600" },
    gray: { bg: "bg-gray-50", text: "text-gray-700", icon: "bg-gray-100 text-gray-600" },
  };
  const c = colorMap[color] || colorMap.gray;
  return (
    <Card className="shadow-sm border-gray-100 rounded-lg" data-testid={testId}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-medium text-gray-500 uppercase">{label}</span>
          <div className={`w-6 h-6 rounded ${c.icon} flex items-center justify-center`}>{icon}</div>
        </div>
        <div className="text-lg font-bold text-gray-900">{value}</div>
        <div className="text-[10px] text-gray-400">{sub}</div>
      </CardContent>
    </Card>
  );
}
