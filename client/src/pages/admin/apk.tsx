import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, Box, Camera, Fingerprint, WifiOff, MapPin, Shield, RefreshCw,
  Download, Settings, LogOut, Clock, NavigationOff, Lock, Smartphone, Tablet,
  CheckCircle, XCircle, FileJson, Cpu, Scan, Eye
} from "lucide-react";

export default function GenerateAPK() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedExamIds, setSelectedExamIds] = useState<number[]>([]);
  const [biometricMode, setBiometricMode] = useState("face_fingerprint");
  const [verificationFlow, setVerificationFlow] = useState("face_then_fingerprint");
  const [attendanceMode, setAttendanceMode] = useState("both");
  const [omrMode, setOmrMode] = useState("verif_omr");
  const [fingerprintScanner, setFingerprintScanner] = useState("MFS100");

  const [faceLiveness, setFaceLiveness] = useState(true);
  const [fingerprintQuality, setFingerprintQuality] = useState(true);
  const [offlineMode, setOfflineMode] = useState(true);
  const [gpsCapture, setGpsCapture] = useState(true);
  const [mdmControl, setMdmControl] = useState(true);
  const [mockLocationDetection, setMockLocationDetection] = useState(true);
  const [kioskMode, setKioskMode] = useState(true);
  const [retryLimit, setRetryLimit] = useState("3");
  const [autoLogout, setAutoLogout] = useState(true);
  const [autoLogoutMinutes, setAutoLogoutMinutes] = useState("30");
  const [autoSync, setAutoSync] = useState(true);
  const [autoSyncMinutes, setAutoSyncMinutes] = useState("5");
  const [timeSyncCheck, setTimeSyncCheck] = useState(true);

  const { data: exams = [] } = useQuery({ queryKey: ["exams"], queryFn: api.exams.list });

  const { data: generatedApks = [], isLoading } = useQuery({
    queryKey: ["apk-builds"],
    queryFn: () => api.apkBuilds.list(),
    refetchInterval: 3000,
  });

  const toggleExam = (examId: number) => {
    setSelectedExamIds(prev =>
      prev.includes(examId) ? prev.filter(id => id !== examId) : [...prev, examId]
    );
  };

  const selectAllExams = () => {
    if (selectedExamIds.length === exams.length) {
      setSelectedExamIds([]);
    } else {
      setSelectedExamIds(exams.map((e: any) => e.id));
    }
  };

  const batchBuildMutation = useMutation({
    mutationFn: () => api.apkBuilds.batchCreate(selectedExamIds, {
      biometricMode,
      verificationFlow,
      attendanceMode,
      omrMode,
      fingerprintScanner,
      faceLiveness,
      fingerprintQuality,
      offlineMode,
      gpsCapture,
      mdmControl,
      mockLocationDetection,
      kioskMode,
      retryLimit: parseInt(retryLimit),
      autoLogoutMinutes: autoLogout ? parseInt(autoLogoutMinutes) : 0,
      autoSyncMinutes: autoSync ? parseInt(autoSyncMinutes) : 0,
      timeSyncCheck,
    }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["apk-builds"] });
      toast({ title: "Build Started", description: `${data.count} APK build(s) queued. They will be ready in a few seconds.` });
    },
    onError: (err: any) => {
      toast({ title: "Build Failed", description: err.message, variant: "destructive" });
    },
  });

  const handleBatchBuild = () => {
    if (selectedExamIds.length === 0) {
      toast({ title: "No Exams Selected", description: "Please select at least one exam to build APK", variant: "destructive" });
      return;
    }
    batchBuildMutation.mutate();
  };

  const buildingCount = generatedApks.filter((a: any) => a.status === "Building").length;
  const readyCount = generatedApks.filter((a: any) => a.status === "Ready").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Generate APK</h1>
          <p className="text-sm text-gray-500 mt-1">Build & configure verification APK for tablets and mobiles</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-xs font-medium text-green-700">
            <Tablet className="w-3.5 h-3.5" /> Tablet
            <span className="text-green-300">|</span>
            <Smartphone className="w-3.5 h-3.5" /> Mobile
            <span className="text-green-300">|</span>
            Android 8.0+
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-10 px-6 rounded-lg font-medium gap-2"
            onClick={handleBatchBuild}
            disabled={batchBuildMutation.isPending || selectedExamIds.length === 0}
            data-testid="button-generate-apk"
          >
            {batchBuildMutation.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Building...</>
            ) : (
              <><Box className="w-4 h-4" /> Build APK ({selectedExamIds.length})</>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{generatedApks.length}</div>
              <div className="text-xs text-gray-500">Total Builds</div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{readyCount}</div>
              <div className="text-xs text-gray-500">Ready</div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center text-yellow-600">
              <Loader2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{buildingCount}</div>
              <div className="text-xs text-gray-500">Building</div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-gray-100 rounded-xl">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <Tablet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">{selectedExamIds.length}</div>
              <div className="text-xs text-gray-500">Exams Selected</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-gray-100 rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Select Exams for APK Build</h3>
              <p className="text-sm text-gray-500 mt-1">Select one or multiple exams to build APKs simultaneously</p>
            </div>
            <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={selectAllExams} data-testid="button-select-all-exams">
              {selectedExamIds.length === exams.length ? "Deselect All" : "Select All"}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {exams.map((exam: any) => {
              const isSelected = selectedExamIds.includes(exam.id);
              return (
                <div
                  key={exam.id}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected ? "border-blue-500 bg-blue-50/50" : "border-gray-100 hover:border-gray-200 bg-white"
                  }`}
                  onClick={() => toggleExam(exam.id)}
                  data-testid={`checkbox-exam-${exam.id}`}
                >
                  <Checkbox checked={isSelected} className="data-[state=checked]:bg-blue-600" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900 truncate">{exam.name}</div>
                    <div className="text-xs text-gray-500">{exam.code} | {exam.candidatesCount || 0} candidates</div>
                  </div>
                  <div className={`px-2 py-0.5 rounded text-xs font-medium ${
                    exam.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  }`}>
                    {exam.status}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden">
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-600" /> Biometric & Verification
                </h3>
                <p className="text-sm text-gray-500 mt-1">Configure face match, fingerprint scanner & OMR settings</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Biometric Mode</label>
                  <Select value={biometricMode} onValueChange={setBiometricMode}>
                    <SelectTrigger className="w-full h-11 border-blue-500 ring-2 ring-blue-100 rounded-lg text-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="face_only">Face Only (AI Face Match)</SelectItem>
                      <SelectItem value="fingerprint_only">Fingerprint Only (MFS100/MFS110)</SelectItem>
                      <SelectItem value="face_fingerprint">Face + Fingerprint (Recommended)</SelectItem>
                      <SelectItem value="photo_only">Photo Capture Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Fingerprint Scanner Model</label>
                  <Select value={fingerprintScanner} onValueChange={setFingerprintScanner}>
                    <SelectTrigger className="w-full h-11 rounded-lg text-gray-900 border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MFS100">Mantra MFS100 (USB Fingerprint)</SelectItem>
                      <SelectItem value="MFS110">Mantra MFS110 (USB Fingerprint)</SelectItem>
                      <SelectItem value="MFS500">Mantra MFS500 (Slap Scanner)</SelectItem>
                      <SelectItem value="IRIS_SCANNER">Mantra MIS100V2 (Iris Scanner)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-400 pl-1">Connected via USB OTG to tablet/mobile</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Verification Flow</label>
                  <Select value={verificationFlow} onValueChange={setVerificationFlow}>
                    <SelectTrigger className="w-full h-11 rounded-lg text-gray-900 border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="face_then_fingerprint">Face Match → Fingerprint → OMR</SelectItem>
                      <SelectItem value="fingerprint_then_face">Fingerprint → Face Match → OMR</SelectItem>
                      <SelectItem value="parallel">Parallel (Face + Fingerprint simultaneously)</SelectItem>
                      <SelectItem value="single">Single Biometric Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Attendance Mode</label>
                  <Select value={attendanceMode} onValueChange={setAttendanceMode}>
                    <SelectTrigger className="w-full h-11 rounded-lg text-gray-900 border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="present_only">Mark Present Only</SelectItem>
                      <SelectItem value="verification_only">Biometric Verification Only</SelectItem>
                      <SelectItem value="both">Both (Present + Verification)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">OMR / Barcode Mode</label>
                  <Select value={omrMode} onValueChange={setOmrMode}>
                    <SelectTrigger className="w-full h-11 rounded-lg text-gray-900 border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="present_verif_omr">Present + Verification + OMR Capture</SelectItem>
                      <SelectItem value="verif_omr">Verification + OMR Scan</SelectItem>
                      <SelectItem value="verif_only">Verification Only</SelectItem>
                      <SelectItem value="omr_only">OMR Scan Only (Camera)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-400 pl-1">OMR captured using tablet rear camera</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Tablet className="w-5 h-5 text-green-600" /> Device Compatibility
                </h3>
                <p className="text-sm text-gray-500 mt-1">APK installs on these device types</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Tablet className="w-8 h-8 text-green-600" />
                    <div>
                      <div className="font-bold text-green-800">Tablets</div>
                      <div className="text-xs text-green-600">Samsung, Lenovo, iBall, etc.</div>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs text-green-700">
                    <div className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3" /> Android 8.0+ (Oreo & above)</div>
                    <div className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3" /> USB OTG for MFS100/MFS110</div>
                    <div className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3" /> Front & rear camera required</div>
                    <div className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3" /> Min 2GB RAM, 16GB storage</div>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Smartphone className="w-8 h-8 text-blue-600" />
                    <div>
                      <div className="font-bold text-blue-800">Mobile Phones</div>
                      <div className="text-xs text-blue-600">Samsung, Xiaomi, Realme, etc.</div>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs text-blue-700">
                    <div className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3" /> Android 8.0+ (Oreo & above)</div>
                    <div className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3" /> USB OTG for fingerprint scanner</div>
                    <div className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3" /> Front camera for face match</div>
                    <div className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3" /> Min 2GB RAM, 8GB storage</div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h4 className="font-semibold text-sm text-gray-800 mb-2 flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-purple-600" /> Supported Hardware
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-2 bg-white rounded-lg border text-center">
                    <div className="font-bold text-gray-800">MFS100</div>
                    <div className="text-gray-500">Fingerprint</div>
                    <div className="text-green-600 font-medium mt-1">USB OTG</div>
                  </div>
                  <div className="p-2 bg-white rounded-lg border text-center">
                    <div className="font-bold text-gray-800">MFS110</div>
                    <div className="text-gray-500">Fingerprint</div>
                    <div className="text-green-600 font-medium mt-1">USB OTG</div>
                  </div>
                  <div className="p-2 bg-white rounded-lg border text-center">
                    <div className="font-bold text-gray-800">Camera</div>
                    <div className="text-gray-500">Face + OMR</div>
                    <div className="text-blue-600 font-medium mt-1">Built-in</div>
                  </div>
                  <div className="p-2 bg-white rounded-lg border text-center">
                    <div className="font-bold text-gray-800">GPS</div>
                    <div className="text-gray-500">Location</div>
                    <div className="text-blue-600 font-medium mt-1">Built-in</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden">
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gray-600" /> Security & Features
                </h3>
                <p className="text-sm text-gray-500 mt-1">Toggle APK security features</p>
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    <Eye className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900 text-sm">AI Face Liveness</div>
                      <div className="text-xs text-gray-500">Blink/head turn detection, anti-spoofing</div>
                    </div>
                  </div>
                  <Switch checked={faceLiveness} onCheckedChange={setFaceLiveness} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    <Fingerprint className="w-5 h-5 text-purple-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900 text-sm">Fingerprint Quality Check</div>
                      <div className="text-xs text-gray-500">NFIQ score ≥ 3 required (MFS100/110)</div>
                    </div>
                  </div>
                  <Switch checked={fingerprintQuality} onCheckedChange={setFingerprintQuality} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    <Scan className="w-5 h-5 text-orange-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900 text-sm">OMR Camera Capture</div>
                      <div className="text-xs text-gray-500">Auto-detect OMR sheet via rear camera</div>
                    </div>
                  </div>
                  <Switch checked={omrMode !== "verif_only"} disabled />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    <WifiOff className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900 text-sm">Offline Mode</div>
                      <div className="text-xs text-gray-500">Work without internet, sync later</div>
                    </div>
                  </div>
                  <Switch checked={offlineMode} onCheckedChange={setOfflineMode} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    <MapPin className="w-5 h-5 text-red-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900 text-sm">GPS Capture</div>
                      <div className="text-xs text-gray-500">Record location during verification</div>
                    </div>
                  </div>
                  <Switch checked={gpsCapture} onCheckedChange={setGpsCapture} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    <Shield className="w-5 h-5 text-orange-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900 text-sm">MDM Control</div>
                      <div className="text-xs text-gray-500">Mobile Device Management lock</div>
                    </div>
                  </div>
                  <Switch checked={mdmControl} onCheckedChange={setMdmControl} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    <NavigationOff className="w-5 h-5 text-indigo-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900 text-sm">Mock Location Detection</div>
                      <div className="text-xs text-gray-500">Block GPS spoofing apps</div>
                    </div>
                  </div>
                  <Switch checked={mockLocationDetection} onCheckedChange={setMockLocationDetection} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    <Lock className="w-5 h-5 text-slate-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900 text-sm">Kiosk Mode</div>
                      <div className="text-xs text-gray-500">Lock device to APK during exam</div>
                    </div>
                  </div>
                  <Switch checked={kioskMode} onCheckedChange={setKioskMode} />
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <div className="flex gap-3 items-center">
                    <RefreshCw className="w-5 h-5 text-gray-500" />
                    <div className="font-medium text-gray-900 text-sm">Retry Limit</div>
                  </div>
                  <div className="pl-8">
                    <Input value={retryLimit} onChange={e => setRetryLimit(e.target.value)} className="h-10 rounded-lg border-gray-200 shadow-sm w-full" />
                    <div className="text-xs text-gray-500 mt-1">Max biometric verification attempts (1-10)</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden">
            <CardContent className="p-6 space-y-5">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" /> Auto Settings
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    <LogOut className="w-5 h-5 text-red-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900 text-sm">Auto Logout</div>
                      <div className="text-xs text-gray-500">Logout after inactivity</div>
                    </div>
                  </div>
                  <Switch checked={autoLogout} onCheckedChange={setAutoLogout} />
                </div>
                {autoLogout && (
                  <div className="pl-8">
                    <Input value={autoLogoutMinutes} onChange={e => setAutoLogoutMinutes(e.target.value)} className="h-9 rounded-lg border-gray-200 shadow-sm w-full text-sm" />
                    <div className="text-xs text-gray-500 mt-1">Minutes (5-120)</div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    <RefreshCw className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900 text-sm">Auto Sync</div>
                      <div className="text-xs text-gray-500">Sync data with server</div>
                    </div>
                  </div>
                  <Switch checked={autoSync} onCheckedChange={setAutoSync} />
                </div>
                {autoSync && (
                  <div className="pl-8">
                    <Input value={autoSyncMinutes} onChange={e => setAutoSyncMinutes(e.target.value)} className="h-9 rounded-lg border-gray-200 shadow-sm w-full text-sm" />
                    <div className="text-xs text-gray-500 mt-1">Interval in minutes (1-60)</div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex gap-3">
                    <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900 text-sm">Time Sync Check</div>
                      <div className="text-xs text-gray-500">Match device time to server</div>
                    </div>
                  </div>
                  <Switch checked={timeSyncCheck} onCheckedChange={setTimeSyncCheck} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-12">
          <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Generated APK Builds</h3>
                  <p className="text-sm text-gray-500 mt-1">Download APK config files for Android installation</p>
                </div>
                {buildingCount > 0 && (
                  <div className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-200">
                    <Loader2 className="w-4 h-4 animate-spin" /> {buildingCount} build(s) in progress...
                  </div>
                )}
              </div>

              <div className="overflow-x-auto border border-gray-100 rounded-lg">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow className="border-b border-gray-100">
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 pl-6 w-24">Version</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">Exam</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 w-28 text-center">Date</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 w-28 text-center">Size</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 w-32 text-center">Device</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 w-24 text-center">Status</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 text-center pr-6 w-48">Download</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white">
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-12 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                            <span className="text-sm text-gray-500">Loading builds...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : generatedApks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="py-12 text-center text-sm text-gray-500">
                          No APK builds yet. Select exams and click "Build APK" to create.
                        </TableCell>
                      </TableRow>
                    ) : (
                      generatedApks.map((apk: any, idx: number) => (
                        <TableRow key={apk.id || idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors" data-testid={`row-apk-${apk.id || idx}`}>
                          <TableCell className="py-4 pl-6 text-[13px] font-mono font-medium text-blue-600">v{apk.version}</TableCell>
                          <TableCell className="py-4">
                            <div className="text-[13px] font-medium text-gray-900">{apk.examName || "—"}</div>
                            <div className="text-xs text-gray-500">{apk.description}</div>
                          </TableCell>
                          <TableCell className="py-4 text-[13px] text-gray-600 text-center">{apk.date}</TableCell>
                          <TableCell className="py-4 text-[13px] text-gray-600 text-center">{apk.buildSize || "—"}</TableCell>
                          <TableCell className="py-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Tablet className="w-3.5 h-3.5 text-gray-400" />
                              <Smartphone className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-xs text-gray-500 ml-1">{apk.deviceTypes || "Tablet,Mobile"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 text-center">
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                              apk.status === "Ready" ? "bg-green-50 text-green-700" : 
                              apk.status === "Building" ? "bg-yellow-50 text-yellow-700" : 
                              "bg-red-50 text-red-700"
                            }`}>
                              {apk.status === "Building" ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : apk.status === "Ready" ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}
                              {apk.status}
                            </div>
                          </TableCell>
                          <TableCell className="py-4 pr-6 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {apk.status === "Ready" && apk.downloadUrl ? (
                                <button
                                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                                  onClick={() => api.apkBuilds.downloadApk(apk.id)}
                                  data-testid={`button-download-apk-${apk.id || idx}`}
                                >
                                  <Download className="w-4 h-4" /> Download .apk
                                </button>
                              ) : apk.status === "Building" ? (
                                <div className="flex items-center gap-2">
                                  <Loader2 className="w-4 h-4 animate-spin text-yellow-600" />
                                  <span className="text-xs text-yellow-600 font-medium">Building...</span>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">—</span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="pt-2 flex items-center justify-between text-sm text-gray-500">
                <div>Showing {generatedApks.length} entries</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-12">
          <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-600" /> How APK Works on Tablets & Mobiles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-2">
                    <Download className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-blue-700 mb-1">Step 1</div>
                  <div className="font-semibold text-sm text-gray-900">Install APK</div>
                  <div className="text-xs text-gray-500 mt-1">Download & install on Android tablet/mobile via admin panel</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200 text-center">
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-2">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-purple-700 mb-1">Step 2</div>
                  <div className="font-semibold text-sm text-gray-900">Operator Login</div>
                  <div className="text-xs text-gray-500 mt-1">Operator logs in with credentials, downloads centre data</div>
                </div>
                <div className="p-4 bg-green-50 rounded-xl border border-green-200 text-center">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-2">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-green-700 mb-1">Step 3</div>
                  <div className="font-semibold text-sm text-gray-900">AI Face Match</div>
                  <div className="text-xs text-gray-500 mt-1">AI captures live photo, compares with candidate photo (liveness check)</div>
                </div>
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-200 text-center">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-2">
                    <Fingerprint className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-orange-700 mb-1">Step 4</div>
                  <div className="font-semibold text-sm text-gray-900">Fingerprint</div>
                  <div className="text-xs text-gray-500 mt-1">MFS100/MFS110 scanner via USB OTG captures & matches fingerprint</div>
                </div>
                <div className="p-4 bg-red-50 rounded-xl border border-red-200 text-center">
                  <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-2">
                    <Scan className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-red-700 mb-1">Step 5</div>
                  <div className="font-semibold text-sm text-gray-900">OMR Capture</div>
                  <div className="text-xs text-gray-500 mt-1">Rear camera scans OMR sheet, extracts OMR number automatically</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
