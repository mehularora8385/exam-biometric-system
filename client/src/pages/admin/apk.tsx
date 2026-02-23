import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Box, Camera, Fingerprint, WifiOff, MapPin, Shield, RefreshCw, Upload, Download, Settings, LogOut, Clock, NavigationOff, Lock } from "lucide-react";

export default function GenerateAPK() {
  const [dragActive, setDragActive] = useState(false);
  const [selectedExam, setSelectedExam] = useState("");
  const [biometricMode, setBiometricMode] = useState("face_fingerprint");
  const [verificationFlow, setVerificationFlow] = useState("face_then_fingerprint");
  const [attendanceMode, setAttendanceMode] = useState("both");
  const [omrMode, setOmrMode] = useState("verif_omr");

  const faceLivenessRef = useRef<HTMLButtonElement>(null);
  const fingerprintQualityRef = useRef<HTMLButtonElement>(null);
  const offlineModeRef = useRef<HTMLButtonElement>(null);
  const gpsCaptureRef = useRef<HTMLButtonElement>(null);
  const mdmControlRef = useRef<HTMLButtonElement>(null);
  const mockLocationRef = useRef<HTMLButtonElement>(null);
  const kioskModeRef = useRef<HTMLButtonElement>(null);

  const queryClient = useQueryClient();

  const { data: exams = [] } = useQuery({
    queryKey: ["exams"],
    queryFn: api.exams.list,
  });

  useEffect(() => {
    if (exams.length > 0 && selectedExam === "") {
      setSelectedExam(String(exams[0].id));
    }
  }, [exams]);

  const { data: generatedApks = [], isLoading } = useQuery({
    queryKey: ["apk-builds"],
    queryFn: () => api.apkBuilds.list(),
  });

  const createApkMutation = useMutation({
    mutationFn: (data: any) => api.apkBuilds.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apk-builds"] });
    },
  });

  const handleGenerateApk = () => {
    createApkMutation.mutate({
      examId: parseInt(selectedExam),
      version: `2.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 10)}`,
      date: new Date().toLocaleDateString('en-GB'),
      description: `APK build with ${biometricMode} biometric, ${verificationFlow} flow, ${attendanceMode} attendance, ${omrMode} OMR mode`,
      status: "Building",
      features: {
        biometricMode,
        verificationFlow,
        attendanceMode,
        omrMode,
      },
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Generate APK</h1>
          <p className="text-sm text-gray-500 mt-1">Configure and generate APK for examination</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedExam} onValueChange={setSelectedExam}>
            <SelectTrigger className="w-[200px] h-10 border-gray-200 text-gray-700 bg-white shadow-sm rounded-lg">
              <SelectValue placeholder="Select Exam" />
            </SelectTrigger>
            <SelectContent>
              {exams.map((exam: any) => (
                <SelectItem key={exam.id} value={String(exam.id)}>{exam.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-10 px-6 rounded-lg font-medium gap-2"
            onClick={handleGenerateApk}
            disabled={createApkMutation.isPending}
            data-testid="button-generate-apk"
          >
            {createApkMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Box className="w-4 h-4" />} Generate APK
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Configuration */}
        <div className="lg:col-span-7 space-y-6">
          {/* Biometric Configuration */}
          <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden">
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Biometric Configuration</h3>
                <p className="text-sm text-gray-500 mt-1">Configure verification modes for this exam</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Biometric Mode</label>
                  <Select defaultValue="face_fingerprint" value={biometricMode} onValueChange={setBiometricMode}>
                    <SelectTrigger className="w-full h-11 border-blue-500 ring-2 ring-blue-100 rounded-lg text-gray-900">
                      <SelectValue placeholder="Select Biometric Mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="face_only">Face Only</SelectItem>
                      <SelectItem value="fingerprint_only">Fingerprint Only</SelectItem>
                      <SelectItem value="face_fingerprint">Face + Fingerprint</SelectItem>
                      <SelectItem value="photo_only">Photo Capture Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Verification Flow</label>
                  <Select defaultValue="face_then_fingerprint" value={verificationFlow} onValueChange={setVerificationFlow}>
                    <SelectTrigger className="w-full h-11 border-blue-500 ring-2 ring-blue-100 rounded-lg text-gray-900">
                      <SelectValue placeholder="Select Verification Flow" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="face_then_fingerprint">Face → Fingerprint</SelectItem>
                      <SelectItem value="fingerprint_then_face">Fingerprint → Face</SelectItem>
                      <SelectItem value="single">Single Biometric</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Attendance Mode</label>
                  <Select defaultValue="both" value={attendanceMode} onValueChange={setAttendanceMode}>
                    <SelectTrigger className="w-full h-11 border-blue-500 ring-2 ring-blue-100 rounded-lg text-gray-900">
                      <SelectValue placeholder="Select Attendance Mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="present_only">Mark Present Only</SelectItem>
                      <SelectItem value="verification_only">Verification Only</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">OMR/Barcode Mode</label>
                  <Select defaultValue="verif_omr" value={omrMode} onValueChange={setOmrMode}>
                    <SelectTrigger className="w-full h-11 border-blue-500 ring-2 ring-blue-100 rounded-lg text-gray-900">
                      <SelectValue placeholder="Select OMR/Barcode Mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="present_verif_omr">Present + Verification + OMR</SelectItem>
                      <SelectItem value="verif_omr">Verification + OMR Scan</SelectItem>
                      <SelectItem value="verif_only">Verification Only</SelectItem>
                      <SelectItem value="omr_only">OMR Scan Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Branding Control */}
          <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden">
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Branding Control</h3>
                <p className="text-sm text-gray-500 mt-1">Customize APK logos for this exam</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Camera className="w-4 h-4 text-purple-500" /> Splash Screen Logo
                </div>
                <p className="text-xs text-gray-500 pl-6 mb-2">Logo shown when app opens</p>
                
                <div 
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ml-6
                    ${dragActive ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50 bg-white"}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm font-medium text-blue-600">Click to upload <span className="text-gray-500 font-normal">or drag and drop</span></p>
                    <p className="text-xs text-gray-400 mt-1">512×512px PNG recommended</p>
                    <p className="text-xs text-gray-400">Accepted: image/*</p>
                    <p className="text-xs text-gray-400">Max size: 2MB</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Feature Toggles & Auto Settings */}
        <div className="lg:col-span-5 space-y-6">
          {/* Feature Toggles */}
          <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden">
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Feature Toggles</h3>
                <p className="text-sm text-gray-500 mt-1">Enable or disable APK features</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    <Camera className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900 text-sm">Face Liveness</div>
                      <div className="text-xs text-gray-500">Detect live face vs photo</div>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    <Fingerprint className="w-5 h-5 text-purple-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900 text-sm">Fingerprint Quality Check</div>
                      <div className="text-xs text-gray-500">Ensure minimum quality threshold</div>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    <WifiOff className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900 text-sm">Offline Mode</div>
                      <div className="text-xs text-gray-500">Allow offline operations</div>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    <MapPin className="w-5 h-5 text-red-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900 text-sm">GPS Capture</div>
                      <div className="text-xs text-gray-500">Record location during verification</div>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    <Shield className="w-5 h-5 text-orange-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900 text-sm">MDM Control</div>
                      <div className="text-xs text-gray-500">Enable Mobile Device Management</div>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    <NavigationOff className="w-5 h-5 text-indigo-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900 text-sm">Mock Location Detection</div>
                      <div className="text-xs text-gray-500">Prevent GPS spoofing apps</div>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    <Lock className="w-5 h-5 text-slate-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900 text-sm">Kiosk Mode</div>
                      <div className="text-xs text-gray-500">Lock app to foreground during exam</div>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex gap-3 items-center">
                    <RefreshCw className="w-5 h-5 text-gray-500" />
                    <div className="font-medium text-gray-900 text-sm">Retry Limit</div>
                  </div>
                  <div className="pl-8">
                    <Input defaultValue="3" className="h-10 rounded-lg border-gray-200 shadow-sm w-full" />
                    <div className="text-xs text-gray-500 mt-1.5">Maximum verification attempts (1-10)</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Auto Settings */}
          <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden">
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Auto Settings</h3>
                <p className="text-sm text-gray-500 mt-1">Configure automatic logout and sync</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                      <LogOut className="w-5 h-5 text-red-500 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900 text-sm">Auto Logout</div>
                        <div className="text-xs text-gray-500">Automatically logout after inactivity</div>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="pl-8">
                    <Input defaultValue="30" className="h-10 rounded-lg border-gray-200 shadow-sm w-full" />
                    <div className="text-xs text-gray-500 mt-1.5">Minutes of inactivity before logout (5-120 min)</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                      <RefreshCw className="w-5 h-5 text-green-500 mt-0.5" />
                      <div>
                        <div className="font-medium text-gray-900 text-sm">Auto Sync</div>
                        <div className="text-xs text-gray-500">Automatically sync data with server</div>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="pl-8">
                    <Input defaultValue="5" className="h-10 rounded-lg border-gray-200 shadow-sm w-full" />
                    <div className="text-xs text-gray-500 mt-1.5">Sync interval in minutes (1-60 min)</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex gap-3">
                    <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900 text-sm">Time Synchronization Check</div>
                      <div className="text-xs text-gray-500">Ensure device time matches server time</div>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Full Width Bottom - Generated APKs */}
        <div className="lg:col-span-12">
          <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Generated APKs</h3>
                <p className="text-sm text-gray-500 mt-1">Download and manage generated APK versions</p>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500 my-4">
                <span>Show</span>
                <Select defaultValue="10">
                  <SelectTrigger className="w-16 h-8 text-xs border-gray-200 rounded-md">
                    <SelectValue placeholder="10" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span>entries</span>
              </div>

              <div className="overflow-x-auto border border-gray-100 rounded-lg">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow className="border-b border-gray-100">
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 pl-6 w-28">Version ↑↓</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4">Exam</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 w-36 text-center">Generated On ↑↓</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 w-24 text-center">Status</TableHead>
                      <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-4 text-center pr-6 w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white">
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-12 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                            <span className="text-sm text-gray-500">Loading APK builds...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : generatedApks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-12 text-center text-sm text-gray-500">
                          No APK builds found. Click "Generate APK" to create one.
                        </TableCell>
                      </TableRow>
                    ) : (
                      generatedApks.map((apk: any, idx: number) => (
                        <TableRow key={apk.id || idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors" data-testid={`row-apk-${apk.id || idx}`}>
                          <TableCell className="py-4 pl-6 text-[13px] font-medium text-blue-600">{apk.version}</TableCell>
                          <TableCell className="py-4 text-[13px] text-gray-600 pr-8">{apk.description}</TableCell>
                          <TableCell className="py-4 text-[13px] text-gray-600 text-center">{apk.date}</TableCell>
                          <TableCell className="py-4 text-center">
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${apk.status === "Ready" ? "bg-green-50 text-green-700" : apk.status === "Building" ? "bg-yellow-50 text-yellow-700" : "bg-green-50 text-green-700"}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${apk.status === "Ready" ? "bg-green-500" : apk.status === "Building" ? "bg-yellow-500" : "bg-green-500"}`}></div>
                              {apk.status}
                            </div>
                          </TableCell>
                          <TableCell className="py-4 pr-6 text-center">
                            <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors mx-auto" data-testid={`button-download-apk-${apk.id || idx}`}>
                              <Download className="w-4 h-4" />
                            </button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              
              <div className="pt-2 flex items-center justify-between text-sm text-gray-500">
                <div>Showing {generatedApks.length > 0 ? 1 : 0} to {generatedApks.length} of {generatedApks.length} entries</div>
                <div className="flex gap-2 items-center">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400" disabled>
                    <span className="text-xs">«</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400" disabled>
                    <span className="text-xs">‹</span>
                  </Button>
                  <span className="text-xs font-medium text-gray-900 mx-2">Page 1 of 1</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400" disabled>
                    <span className="text-xs">›</span>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400" disabled>
                    <span className="text-xs">»</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}