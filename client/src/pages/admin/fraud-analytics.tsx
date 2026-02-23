import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Fingerprint, MapPin, Activity, Smartphone, ShieldAlert, Shield, Loader2 } from "lucide-react";

export default function FraudAnalytics() {
  const { data: alertsData = [], isLoading } = useQuery({
    queryKey: ["alerts"],
    queryFn: api.alerts.list,
  });

  const criticalCount = alertsData.filter((a: any) => a.severity === "critical").length;
  const biometricSpoofCount = alertsData.filter((a: any) => a.type === "biometric_spoof" || a.type === "liveness_failure").length;
  const geofenceCount = alertsData.filter((a: any) => a.type === "geofence_violation" || a.type === "gps_spoof").length;
  const totalAlerts = alertsData.length;
  const trustScore = totalAlerts > 0 ? Math.max(0, 100 - totalAlerts * 0.5).toFixed(1) : "100.0";

  const impersonationCount = alertsData.filter((a: any) => a.type === "impersonation" || a.type === "face_mismatch").length;
  const deviceTamperingCount = alertsData.filter((a: any) => a.type === "device_tampering" || a.type === "root_detected").length;
  const vpnCount = alertsData.filter((a: any) => a.type === "vpn_detected" || a.type === "proxy_detected").length;
  const maxIncidents = Math.max(impersonationCount, deviceTamperingCount, vpnCount, 1);

  const recentAlerts = alertsData
    .slice()
    .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const severityColor = (severity: string) => {
    if (severity === "critical") return { bg: "bg-red-50/50", border: "border-red-100", hover: "hover:bg-red-50", iconBg: "bg-red-100", iconText: "text-red-600" };
    if (severity === "high") return { bg: "bg-orange-50/50", border: "border-orange-100", hover: "hover:bg-orange-50", iconBg: "bg-orange-100", iconText: "text-orange-600" };
    return { bg: "bg-yellow-50/50", border: "border-yellow-100", hover: "hover:bg-yellow-50", iconBg: "bg-yellow-100", iconText: "text-yellow-600" };
  };

  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Fraud Analytics & AI Insights</h1>
          <p className="text-sm text-gray-500 mt-1">Advanced anomaly detection, biometric spoofs, and geofencing violations</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-medium text-sm border border-indigo-100">
          <Shield className="w-4 h-4" /> Global Security Network Active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-6 flex flex-col justify-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900" data-testid="text-critical-count">{criticalCount}</div>
              <div className="text-sm font-medium text-gray-500">Critical Anomalies</div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-6 flex flex-col justify-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
              <Fingerprint className="w-6 h-6" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900" data-testid="text-biometric-spoof-count">{biometricSpoofCount}</div>
              <div className="text-sm font-medium text-gray-500">Biometric Spoof Attempts</div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-6 flex flex-col justify-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900" data-testid="text-geofence-count">{geofenceCount}</div>
              <div className="text-sm font-medium text-gray-500">Geofence Violations</div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-6 flex flex-col justify-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900" data-testid="text-trust-score">{trustScore}%</div>
              <div className="text-sm font-medium text-gray-500">System Trust Score</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Recent AI Security Alerts</h3>
            <div className="space-y-4">
              {recentAlerts.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">No alerts found</p>
              )}
              {recentAlerts.map((alert: any) => {
                const colors = severityColor(alert.severity);
                return (
                  <div key={alert.id} className={`flex items-start gap-4 p-5 rounded-xl ${colors.bg} ${colors.border} border transition-colors ${colors.hover}`} data-testid={`card-alert-${alert.id}`}>
                    <div className={`mt-1 ${colors.iconBg} p-2 rounded-full`}>
                      {alert.type === "gps_spoof" || alert.type === "geofence_violation" ? (
                        <Smartphone className={`w-5 h-5 ${colors.iconText}`} />
                      ) : (
                        <AlertTriangle className={`w-5 h-5 ${colors.iconText}`} />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900">{alert.description?.split('.')[0] || alert.type}</h4>
                        <span className="text-xs text-gray-500 font-mono">{formatTime(alert.timestamp)}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2 leading-relaxed">{alert.description}</p>
                      <div className="mt-4 flex gap-2 flex-wrap">
                        {alert.candidateId && (
                          <span className="text-xs bg-white border border-gray-200 px-2.5 py-1 rounded-md text-gray-700 font-medium shadow-sm">Candidate: {alert.candidateId}</span>
                        )}
                        {alert.operatorId && (
                          <span className="text-xs bg-white border border-gray-200 px-2.5 py-1 rounded-md text-gray-700 font-medium shadow-sm">Operator: {alert.operatorId}</span>
                        )}
                        {alert.centreCode && (
                          <span className="text-xs bg-white border border-gray-200 px-2.5 py-1 rounded-md text-gray-700 font-medium shadow-sm">Centre: {alert.centreCode}</span>
                        )}
                        {alert.confidence && (
                          <span className="text-xs bg-white border border-red-200 px-2.5 py-1 rounded-md text-red-700 font-medium shadow-sm">Confidence: {alert.confidence}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Threat Intelligence Summary</h3>
            <div className="space-y-6">
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Impersonation Attempts</span>
                  <span className="text-sm font-bold text-red-600">{impersonationCount} incidents</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: `${(impersonationCount / maxIncidents) * 100}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Device Tampering (Root/Jailbreak)</span>
                  <span className="text-sm font-bold text-orange-600">{deviceTamperingCount} incidents</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(deviceTamperingCount / maxIncidents) * 100}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">VPN / Network Proxies Detected</span>
                  <span className="text-sm font-bold text-blue-600">{vpnCount} incidents</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(vpnCount / maxIncidents) * 100}%` }}></div>
                </div>
              </div>

            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-600 leading-relaxed">
                The <strong className="text-gray-900">Neural Trust Engine</strong> is currently operating at nominal levels. All automated policies are enforcing strict access controls based on the active risk profile.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}