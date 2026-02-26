import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  ShieldAlert, AlertTriangle, Fingerprint, Settings2, Search,
  Shield, Loader2, CheckCircle, XCircle, Eye, Camera
} from "lucide-react";

export default function BiometricIntegrity() {
  const [activeTab, setActiveTab] = useState<"monitoring" | "config">("monitoring");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [faceThreshold, setFaceThreshold] = useState(75);
  const [livenessEnabled, setLivenessEnabled] = useState(true);
  const [antiSpoofEnabled, setAntiSpoofEnabled] = useState(true);
  const [fpQualityMin, setFpQualityMin] = useState(3);
  const [retryLimit, setRetryLimit] = useState(3);
  const [strictMode, setStrictMode] = useState(false);

  const { data: alertsData = [], isLoading } = useQuery({
    queryKey: ["alerts"],
    queryFn: api.alerts.list,
  });

  const { data: auditLogs = [] } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: api.auditLogs.list,
  });

  const updateAlertMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => api.alerts.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      toast({ title: "Alert status updated" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const biometricAlerts = alertsData.filter((a: any) => {
    const type = (a.type || "").toLowerCase();
    return type.includes("spoof") || type.includes("liveness") || type.includes("face") ||
           type.includes("fingerprint") || type.includes("biometric") || type.includes("photo") ||
           type.includes("duplicate") || type.includes("invalid");
  });

  const biometricLogs = auditLogs.filter((l: any) => {
    const action = (l.action || "").toLowerCase();
    return action.includes("biometric") || action.includes("verification") || action.includes("face") || action.includes("fingerprint");
  });

  const criticalCount = biometricAlerts.filter((a: any) => a.severity === "critical" || a.severity === "Critical").length;
  const spoofCount = biometricAlerts.filter((a: any) => (a.type || "").toLowerCase().includes("spoof")).length;
  const livenessFailCount = biometricAlerts.filter((a: any) => (a.type || "").toLowerCase().includes("liveness")).length;
  const openCount = biometricAlerts.filter((a: any) => a.status === "Open").length;

  const verificationLogs = biometricLogs.sort((a: any, b: any) => {
    try { return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(); } catch { return 0; }
  }).slice(0, 10);

  const filteredAlerts = biometricAlerts.filter((a: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (a.type || "").toLowerCase().includes(q) || (a.description || "").toLowerCase().includes(q) ||
           (a.centreCode || "").toLowerCase().includes(q) || (a.candidateId || "").includes(q);
  }).sort((a: any, b: any) => {
    try { return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(); } catch { return 0; }
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-300 font-sans pb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900" data-testid="text-biometric-title">Biometric Integrity & Control</h1>
          <p className="text-sm text-gray-500">Monitor biometric exceptions and configure verification settings</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === "monitoring" ? "default" : "outline"}
            size="sm"
            className={`text-xs h-7 ${activeTab === "monitoring" ? "bg-blue-600 hover:bg-blue-700" : ""}`}
            onClick={() => setActiveTab("monitoring")}
            data-testid="button-tab-monitoring"
          >
            <ShieldAlert className="w-3 h-3 mr-1" /> Monitor
          </Button>
          <Button
            variant={activeTab === "config" ? "default" : "outline"}
            size="sm"
            className={`text-xs h-7 ${activeTab === "config" ? "bg-blue-600 hover:bg-blue-700" : ""}`}
            onClick={() => setActiveTab("config")}
            data-testid="button-tab-config"
          >
            <Settings2 className="w-3 h-3 mr-1" /> Configuration
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={<AlertTriangle className="w-4 h-4" />} label="Critical" value={criticalCount} color="red" testId="stat-critical" />
        <StatCard icon={<Camera className="w-4 h-4" />} label="Spoof Detected" value={spoofCount} color="orange" testId="stat-spoof" />
        <StatCard icon={<Eye className="w-4 h-4" />} label="Liveness Fail" value={livenessFailCount} color="yellow" testId="stat-liveness" />
        <StatCard icon={<Shield className="w-4 h-4" />} label="Open Alerts" value={openCount} color="blue" testId="stat-open" />
      </div>

      {activeTab === "monitoring" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="shadow-sm border-gray-100 rounded-lg lg:col-span-2">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Biometric Alerts</h3>
                <div className="relative">
                  <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search alerts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-7 text-xs pl-7 w-40"
                    data-testid="input-search-alerts"
                  />
                </div>
              </div>
              <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
                {filteredAlerts.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-xs flex flex-col items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    No biometric alerts found
                  </div>
                ) : (
                  filteredAlerts.map((alert: any) => (
                    <div key={alert.id} className={`flex items-start gap-2 p-2 rounded-md border text-xs ${
                      alert.severity === "critical" || alert.severity === "Critical" ? "bg-red-50/50 border-red-100" :
                      alert.severity === "high" || alert.severity === "High" ? "bg-orange-50/50 border-orange-100" :
                      "bg-yellow-50/50 border-yellow-100"
                    }`} data-testid={`bio-alert-${alert.id}`}>
                      <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        alert.severity === "critical" || alert.severity === "Critical" ? "bg-red-100 text-red-600" :
                        "bg-orange-100 text-orange-600"
                      }`}>
                        <AlertTriangle className="w-3 h-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-medium text-gray-800 truncate">{alert.type?.replace(/_/g, " ")}</span>
                          <span className="text-[9px] text-gray-400 flex-shrink-0">{alert.timestamp}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 truncate mt-0.5">{alert.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {alert.centreCode && <span className="text-[9px] bg-gray-100 px-1 rounded">{alert.centreCode}</span>}
                          {alert.candidateId && <span className="text-[9px] bg-gray-100 px-1 rounded">ID: {alert.candidateId}</span>}
                          {alert.status === "Open" && (
                            <button
                              className="text-[9px] text-blue-600 hover:underline ml-auto"
                              onClick={() => updateAlertMutation.mutate({ id: alert.id, status: "Resolved" })}
                              data-testid={`button-resolve-${alert.id}`}
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-100 rounded-lg">
            <CardContent className="p-3">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Verifications</h3>
              <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
                {verificationLogs.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-xs">No verification logs yet</div>
                ) : (
                  verificationLogs.map((log: any, i: number) => (
                    <div key={log.id || i} className="flex items-start gap-2 p-2 rounded-md hover:bg-gray-50 text-xs" data-testid={`ver-log-${log.id || i}`}>
                      <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
                        log.action?.toLowerCase().includes("verified") || log.action?.toLowerCase().includes("success") ? "bg-green-100 text-green-600" :
                        log.action?.toLowerCase().includes("fail") ? "bg-red-100 text-red-600" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {log.action?.toLowerCase().includes("fail") ? <XCircle className="w-3 h-3" /> : <Fingerprint className="w-3 h-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800 truncate">{log.action}</div>
                        <div className="text-[9px] text-gray-400 mt-0.5">{log.timestamp}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="shadow-sm border-gray-100 rounded-lg">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Face Verification Settings</h3>
              <div className="space-y-4">
                <ConfigRow label="Match Threshold" desc="Minimum face match % to verify">
                  <div className="flex items-center gap-2">
                    <Input type="number" value={faceThreshold} onChange={(e) => setFaceThreshold(Number(e.target.value))} className="h-8 w-20 text-xs text-right" min={50} max={99} data-testid="input-face-threshold" />
                    <span className="text-xs text-gray-500">%</span>
                  </div>
                </ConfigRow>
                <ConfigRow label="Liveness Detection" desc="Require blink/head turn for anti-spoof">
                  <Switch checked={livenessEnabled} onCheckedChange={setLivenessEnabled} data-testid="switch-liveness" />
                </ConfigRow>
                <ConfigRow label="Anti-Spoof Detection" desc="Detect photo/screen replay attacks">
                  <Switch checked={antiSpoofEnabled} onCheckedChange={setAntiSpoofEnabled} data-testid="switch-antispoof" />
                </ConfigRow>
                <ConfigRow label="Retry Limit" desc="Max verification attempts per candidate">
                  <Input type="number" value={retryLimit} onChange={(e) => setRetryLimit(Number(e.target.value))} className="h-8 w-16 text-xs text-right" min={1} max={10} data-testid="input-retry-limit" />
                </ConfigRow>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-100 rounded-lg">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Fingerprint Settings</h3>
              <div className="space-y-4">
                <ConfigRow label="Min NFIQ Quality" desc="Minimum fingerprint quality score (1-5)">
                  <Input type="number" value={fpQualityMin} onChange={(e) => setFpQualityMin(Number(e.target.value))} className="h-8 w-16 text-xs text-right" min={1} max={5} data-testid="input-nfiq-min" />
                </ConfigRow>
                <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-red-900 text-xs">Strict Mode</div>
                      <div className="text-[10px] text-red-700 mt-0.5">Block all post-exam biometric activity</div>
                    </div>
                    <Switch checked={strictMode} onCheckedChange={setStrictMode} data-testid="switch-strict-mode" />
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="font-medium text-blue-900 text-xs mb-1.5">Automated Protections</div>
                  <ul className="text-[10px] text-blue-800 space-y-0.5 list-disc pl-3">
                    <li>Invalid/Wrong Photo Detection</li>
                    <li>Operator Self-Face Detection</li>
                    <li>Duplicate Image Hash Detection</li>
                    <li>Device Clock Tampering Protection</li>
                  </ul>
                </div>
                <div className="flex justify-end pt-2 border-t border-gray-100">
                  <Button
                    size="sm"
                    className="text-xs h-8 bg-blue-600 hover:bg-blue-700"
                    onClick={() => toast({ title: "Configuration saved", description: `Face threshold: ${faceThreshold}%, Liveness: ${livenessEnabled ? "On" : "Off"}, NFIQ min: ${fpQualityMin}` })}
                    data-testid="button-save-config"
                  >
                    Save Configuration
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color, testId }: { icon: React.ReactNode; label: string; value: number; color: string; testId: string }) {
  const colors: Record<string, string> = {
    red: "bg-red-50 text-red-600",
    orange: "bg-orange-50 text-orange-600",
    yellow: "bg-yellow-50 text-yellow-600",
    blue: "bg-blue-50 text-blue-600",
  };
  return (
    <Card className="shadow-sm border-gray-100 rounded-lg" data-testid={testId}>
      <CardContent className="p-3 flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colors[color]}`}>{icon}</div>
        <div>
          <div className="text-lg font-bold text-gray-900">{value}</div>
          <div className="text-[10px] text-gray-500">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function ConfigRow({ label, desc, children }: { label: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-xs font-medium text-gray-900">{label}</div>
        <div className="text-[10px] text-gray-500">{desc}</div>
      </div>
      {children}
    </div>
  );
}
