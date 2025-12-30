import React from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, RefreshCw, CheckCircle2, Cloud, HardDrive } from "lucide-react";
import { useLocation } from "wouter";

export default function SyncPage() {
  const { state, syncData } = useAppStore();
  const [, setLocation] = useLocation();
  const [isSyncing, setIsSyncing] = React.useState(false);

  const pendingCount = state.attendance.length + state.registrations.length;

  const handleSync = async () => {
    setIsSyncing(true);
    await syncData();
    setIsSyncing(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">Data Synchronization</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-slate-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <HardDrive className="w-4 h-4" /> Local Storage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{pendingCount}</div>
            <p className="text-xs text-slate-500">Records pending upload</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <Cloud className="w-4 h-4" /> Server Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600 flex items-center gap-2">
              Online <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-500">Last sync: Just now</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
            <RefreshCw className={`w-8 h-8 ${isSyncing ? "animate-spin" : ""}`} />
          </div>
          <div>
            <h3 className="text-lg font-bold">Manual Sync</h3>
            <p className="text-slate-500 max-w-xs mx-auto">
              Push all locally stored attendance and registration data to the central server.
            </p>
          </div>
          <Button size="lg" onClick={handleSync} disabled={isSyncing || pendingCount === 0} className="w-full max-w-sm">
            {isSyncing ? "Syncing Data..." : `Sync ${pendingCount} Records`}
          </Button>
        </CardContent>
      </Card>

      <div className="rounded-lg bg-slate-900 text-slate-400 p-4 font-mono text-xs overflow-auto max-h-60">
        <div className="mb-2 text-slate-100">System Logs</div>
        {state.attendance.map((a, i) => (
          <div key={i}>[LOG] Attendance marked for {a.applicationNo} at {new Date(a.timestamp).toLocaleTimeString()}</div>
        ))}
        {state.registrations.map((r, i) => (
          <div key={i}>[LOG] Registration complete for {r.applicationNo} (OMR: {r.omrCode})</div>
        ))}
        {pendingCount === 0 && <div>[INFO] System idle. All records synced.</div>}
      </div>
    </div>
  );
}
