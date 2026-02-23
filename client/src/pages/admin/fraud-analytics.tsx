import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Fingerprint, MapPin, Activity, Smartphone, ShieldAlert, Shield } from "lucide-react";

export default function FraudAnalytics() {
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
              <div className="text-3xl font-bold text-gray-900">12</div>
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
              <div className="text-3xl font-bold text-gray-900">4</div>
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
              <div className="text-3xl font-bold text-gray-900">3</div>
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
              <div className="text-3xl font-bold text-gray-900">98.5%</div>
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
              <div className="flex items-start gap-4 p-5 rounded-xl bg-red-50/50 border border-red-100 transition-colors hover:bg-red-50">
                <div className="mt-1 bg-red-100 p-2 rounded-full"><AlertTriangle className="w-5 h-5 text-red-600" /></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">Liveness Check Failed - Print Attack Detected</h4>
                    <span className="text-xs text-gray-500 font-mono">10:42 AM</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">High-resolution photo used during facial verification at Centre DEL002. Device locked automatically by AI policy.</p>
                  <div className="mt-4 flex gap-2">
                    <span className="text-xs bg-white border border-gray-200 px-2.5 py-1 rounded-md text-gray-700 font-medium shadow-sm">Candidate: cand-82</span>
                    <span className="text-xs bg-white border border-red-200 px-2.5 py-1 rounded-md text-red-700 font-medium shadow-sm">Confidence: 99.2%</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-5 rounded-xl bg-orange-50/50 border border-orange-100 transition-colors hover:bg-orange-50">
                <div className="mt-1 bg-orange-100 p-2 rounded-full"><Smartphone className="w-5 h-5 text-orange-600" /></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">Mock Location App Detected</h4>
                    <span className="text-xs text-gray-500 font-mono">10:15 AM</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">Operator device DEV015 attempting to mask GPS coordinates using a 3rd party GPS spoofing tool.</p>
                  <div className="mt-4 flex gap-2">
                    <span className="text-xs bg-white border border-gray-200 px-2.5 py-1 rounded-md text-gray-700 font-medium shadow-sm">Operator: op-12</span>
                    <span className="text-xs bg-white border border-gray-200 px-2.5 py-1 rounded-md text-gray-700 font-medium shadow-sm">Location: Mumbai (Spoofed)</span>
                  </div>
                </div>
              </div>
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
                  <span className="text-sm font-bold text-red-600">8 incidents</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Device Tampering (Root/Jailbreak)</span>
                  <span className="text-sm font-bold text-orange-600">3 incidents</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">VPN / Network Proxies Detected</span>
                  <span className="text-sm font-bold text-blue-600">5 incidents</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '30%' }}></div>
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