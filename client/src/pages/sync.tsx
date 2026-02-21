import React, { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, RefreshCw, CheckCircle2, Cloud, HardDrive, Wifi, WifiOff, FileUp, AlertCircle, Clock, Users, Database } from "lucide-react";
import { useLocation } from "wouter";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function SyncPage() {
  const { state, syncData } = useAppStore();
  const [, setLocation] = useLocation();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(new Date());
  const [isOnline, setIsOnline] = useState(true); // Mock network status

  const pendingAttendanceCount = state.attendance.length;
  const pendingRegistrationCount = state.registrations.length;
  const totalPending = pendingAttendanceCount + pendingRegistrationCount;

  // Mock network status toggling for demo purposes
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSync = async () => {
    if (!isOnline) return;
    
    setIsSyncing(true);
    setSyncProgress(0);
    
    // Simulate progress
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    try {
      await syncData();
      clearInterval(interval);
      setSyncProgress(100);
      setLastSyncTime(new Date());
      
      // Reset after a brief delay to show 100% completion
      setTimeout(() => {
        setIsSyncing(false);
        setSyncProgress(0);
      }, 800);
    } catch (error) {
      clearInterval(interval);
      setIsSyncing(false);
      setSyncProgress(0);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <Button 
        variant="ghost" 
        className="gap-2 -ml-3 text-slate-500 hover:text-slate-900"
        onClick={() => setLocation("/")}
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Button>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 leading-tight mb-2">Data Synchronization</h1>
          <p className="text-slate-500">Upload locally collected biometric and attendance records to HQ servers.</p>
        </div>
        
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${
          isOnline ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"
        }`}>
          {isOnline ? (
            <><Wifi className="w-4 h-4" /> Network Connected</>
          ) : (
            <><WifiOff className="w-4 h-4" /> Offline Mode</>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="h-1 w-full bg-blue-500"></div>
          <CardHeader className="pb-2 bg-slate-50/50 flex-1">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-blue-500" /> Device Storage
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="flex items-end gap-3 mb-6 mt-4">
              <div className="text-5xl font-black text-slate-900 leading-none">{totalPending}</div>
              <div className="text-sm font-semibold text-slate-500 mb-1 uppercase tracking-wide">Pending Records</div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm p-3 rounded-lg bg-blue-50/50 border border-blue-100">
                <span className="font-medium text-slate-700">Round 1 (Gate Entry)</span>
                <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded text-xs">{pendingAttendanceCount} queued</span>
              </div>
              <div className="flex justify-between items-center text-sm p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
                <span className="font-medium text-slate-700">Round 2 (Biometrics)</span>
                <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-xs">{pendingRegistrationCount} queued</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className={`h-1 w-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
          <CardHeader className="pb-2 bg-slate-50/50 flex-1">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Cloud className={`w-4 h-4 ${isOnline ? 'text-emerald-500' : 'text-red-500'}`} /> Central Server
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 flex flex-col justify-end h-full mt-4">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                <h3 className="text-xl font-bold text-slate-900">{isOnline ? 'Servers Online & Reachable' : 'Servers Unreachable'}</h3>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                {isOnline 
                  ? "Secure connection to HQ established. End-to-end encryption active for data transfer." 
                  : "Check device internet connection. Data remains securely encrypted on this device until connectivity is restored."}
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <Clock className="w-4 h-4 text-slate-400" /> 
              Last successful sync: 
              <span className="font-semibold text-slate-900">
                {lastSyncTime ? lastSyncTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'}) : 'Never'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-t-4 border-t-primary shadow-md overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/50 to-indigo-50/50 z-0"></div>
        <CardContent className="p-8 md:p-12 relative z-10 flex flex-col items-center text-center space-y-8">
          
          <div className="relative">
            {isSyncing && (
              <>
                <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-70 scale-150"></div>
                <div className="absolute inset-0 bg-blue-200 rounded-full animate-pulse opacity-50 scale-110"></div>
              </>
            )}
            <div className={`w-24 h-24 rounded-full flex items-center justify-center relative z-10 transition-colors duration-500 ${
              isSyncing ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-blue-600 border-4 border-white shadow-sm'
            }`}>
              <RefreshCw className={`w-10 h-10 ${isSyncing ? "animate-spin" : ""}`} />
            </div>
          </div>
          
          <div className="space-y-2 max-w-md">
            <h3 className="text-2xl font-bold text-slate-900">
              {isSyncing ? "Synchronizing Data..." : "Manual Synchronization"}
            </h3>
            <p className="text-slate-500 leading-relaxed">
              {isSyncing 
                ? "Please do not close this app or turn off the device while data is being securely transferred to HQ."
                : "Push all locally stored attendance and biometric registration data to the central server immediately."}
            </p>
          </div>

          {isSyncing && (
            <div className="w-full max-w-md space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-600 uppercase tracking-wider">
                <span>Uploading {totalPending} records</span>
                <span className="text-blue-600">{syncProgress}%</span>
              </div>
              <Progress value={syncProgress} className="h-3 bg-blue-100" />
            </div>
          )}

          <Button 
            size="lg" 
            onClick={handleSync} 
            disabled={isSyncing || totalPending === 0 || !isOnline} 
            className="w-full max-w-sm h-14 text-lg shadow-md transition-all group"
          >
            {isSyncing ? (
              <span className="flex items-center gap-2"><RefreshCw className="w-5 h-5 animate-spin" /> Uploading securely...</span>
            ) : totalPending === 0 ? (
              <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> All Data Synced</span>
            ) : !isOnline ? (
              <span className="flex items-center gap-2"><WifiOff className="w-5 h-5" /> Offline - Cannot Sync</span>
            ) : (
              <span className="flex items-center gap-2"><FileUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" /> Sync {totalPending} Records Now</span>
            )}
          </Button>
          
          {!isOnline && totalPending > 0 && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-100">
              <AlertCircle className="w-4 h-4" /> Please connect to the internet to upload pending records.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6 pt-4">
         <div className="space-y-4">
           <h3 className="font-semibold text-slate-900 flex items-center gap-2">
             <Database className="w-4 h-4 text-emerald-600" /> Candidate Data to Sync
           </h3>
           <Card className="shadow-sm border-slate-200">
             <CardContent className="p-0">
                <div className="overflow-x-auto max-h-80">
                  <Table>
                    <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                      <TableRow>
                        <TableHead className="font-semibold text-slate-700">Roll No.</TableHead>
                        <TableHead className="font-semibold text-slate-700">Candidate Name</TableHead>
                        <TableHead className="font-semibold text-slate-700 text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {state.candidates.length > 0 ? (
                         state.candidates.map((c, i) => {
                           const hasGateEntry = state.attendance.some(a => a.applicationNo === c.applicationNo);
                           const hasRegistration = state.registrations.some(r => r.applicationNo === c.applicationNo);
                           
                           // Only show candidates that need syncing (have local data not yet synced)
                           // For mockup, we'll just show all candidates that have SOME data
                           if (!hasGateEntry && !hasRegistration) return null;

                           return (
                             <TableRow key={`cand-${i}`} className="hover:bg-slate-50/50">
                               <TableCell className="font-mono font-medium text-slate-900">{c.rollNo}</TableCell>
                               <TableCell className="font-medium text-slate-700">{c.name}</TableCell>
                               <TableCell className="text-center">
                                 {hasRegistration ? (
                                   <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-2 py-0.5 whitespace-nowrap">
                                      Biometrics Done
                                   </Badge>
                                 ) : hasGateEntry ? (
                                   <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-2 py-0.5 whitespace-nowrap">
                                      Gate Entry Only
                                   </Badge>
                                 ) : null}
                               </TableCell>
                             </TableRow>
                           );
                         })
                      ) : (
                        <TableRow>
                           <TableCell colSpan={3} className="text-center py-8 text-slate-500 text-sm">
                             No candidate data available.
                           </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
             </CardContent>
           </Card>
         </div>

         <div className="space-y-4">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-slate-400" /> Local Operation Logs
          </h3>
          <div className="rounded-xl bg-slate-900 p-5 font-mono text-xs overflow-auto h-80 shadow-inner border border-slate-800">
            <div className="space-y-2">
              {state.attendance.map((a, i) => (
                <div key={`att-${i}`} className="text-slate-400 hover:text-slate-300 transition-colors flex gap-3">
                  <span className="text-blue-400 shrink-0">[{new Date(a.timestamp).toLocaleTimeString()}]</span>
                  <span className="text-emerald-400 shrink-0">[GATE]</span>
                  <span className="text-slate-300">Attendance marked present for Application No: <span className="text-white">{a.applicationNo}</span></span>
                </div>
              ))}
              {state.registrations.map((r, i) => (
                <div key={`reg-${i}`} className="text-slate-400 hover:text-slate-300 transition-colors flex gap-3">
                  <span className="text-blue-400 shrink-0">[{new Date(r.timestamp).toLocaleTimeString()}]</span>
                  <span className="text-purple-400 shrink-0">[BIO_REG]</span>
                  <span className="text-slate-300">Registration complete for <span className="text-white">{r.applicationNo}</span> (OMR mapped: <span className="text-white">{r.omrCode}</span>)</span>
                </div>
              ))}
              {totalPending === 0 && state.attendance.length === 0 && (
                <div className="text-slate-500 italic flex items-center gap-2 py-2">
                  <div className="w-2 h-2 rounded-full bg-slate-700 animate-pulse"></div>
                  System idle. Awaiting operational data...
                </div>
              )}
            </div>
          </div>
         </div>
      </div>
    </div>
  );
}
