import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Search, MoreVertical, Key, User, Clock, Trash2, Edit, UploadCloud, SquareSquare, Play, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const COLOR_OPTIONS = [
  "bg-blue-100 text-blue-600",
  "bg-indigo-100 text-indigo-600",
  "bg-purple-100 text-purple-600",
  "bg-green-100 text-green-600",
  "bg-amber-100 text-amber-600",
  "bg-rose-100 text-rose-600",
  "bg-cyan-100 text-cyan-600",
  "bg-teal-100 text-teal-600",
];

function getColorFromCode(code: string): string {
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = code.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLOR_OPTIONS[Math.abs(hash) % COLOR_OPTIONS.length];
}

function formatNumber(n: number): string {
  return n.toLocaleString();
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

export default function ExamMaster({ setActivePage }: { setActivePage?: (page: string) => void }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingExamId, setEditingExamId] = useState<number | null>(null);
  const [activeStep, setActiveStep] = useState(1);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    client: "",
    clientLoginId: "",
    clientLoginPass: "",
    apkPassword: "",
  });

  const [editFormData, setEditFormData] = useState({
    name: "",
    code: "",
    client: "",
    clientLoginId: "",
    clientLoginPass: "",
    apkPassword: "",
    biometricMode: "face",
    flowType: "single",
    attendanceMode: "both",
    omrMode: "verification",
    faceLiveness: true,
    retryLimit: "3",
  });

  const [slots, setSlots] = useState([{ name: "Slot 1", startTime: "09:00", endTime: "12:00" }]);

  const [settings, setSettings] = useState({
    biometricMode: "face",
    flowType: "single",
    attendanceMode: "both",
    omrMode: "verification",
    faceLiveness: true,
    fingerprintQuality: true,
    offlineMode: true,
    gps: false,
    mdm: false,
    retryLimit: "3",
  });

  const { data: rawExams = [], isLoading } = useQuery({
    queryKey: ["exams"],
    queryFn: api.exams.list,
  });

  const exams = rawExams.map((exam: any) => ({
    id: exam.code ? exam.code.substring(0, 2).toUpperCase() : "??",
    examId: exam.id,
    name: exam.name,
    code: exam.code,
    client: exam.client,
    status: exam.status || "Draft",
    candidates: formatNumber(exam.candidatesCount || 0),
    verified: formatNumber(exam.verifiedCount || 0),
    verifiedPercent: exam.candidatesCount > 0
      ? Math.round((exam.verifiedCount / exam.candidatesCount) * 100) + "%"
      : "0%",
    created: exam.createdAt ? formatDate(exam.createdAt) : "-",
    apkPass: exam.apkPassword || "-",
    loginId: exam.clientLoginId || "-",
    loginPass: exam.clientLoginPass || "-",
    color: getColorFromCode(exam.code || ""),
    rawExam: exam,
  }));

  const createMutation = useMutation({
    mutationFn: (data: any) => api.exams.create(data),
    onSuccess: async (result: any) => {
      for (const slot of slots) {
        await api.slots.create({
          name: slot.name,
          examId: result.id,
          date: new Date().toISOString().split('T')[0],
          startTime: slot.startTime,
          endTime: slot.endTime,
          status: "Active",
        });
      }
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      setIsAddModalOpen(false);
      setFormData({ name: "", code: "", client: "", clientLoginId: "", clientLoginPass: "", apkPassword: "" });
      setSlots([{ name: "Slot 1", startTime: "09:00", endTime: "12:00" }]);
      setSettings({ biometricMode: "face", flowType: "single", attendanceMode: "both", omrMode: "verification", faceLiveness: true, fingerprintQuality: true, offlineMode: true, gps: false, mdm: false, retryLimit: "3" });
      setActiveStep(1);
      toast({ title: "Exam created successfully" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.exams.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      setIsEditModalOpen(false);
      setEditingExamId(null);
      toast({ title: "Exam updated successfully" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.exams.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      toast({ title: "Exam deleted successfully" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => api.exams.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      toast({ title: "Exam status updated" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const handleEditClick = (exam: any) => {
    const raw = exam.rawExam;
    setEditingExamId(exam.examId);
    setEditFormData({
      name: raw.name || "",
      code: raw.code || "",
      client: raw.client || "",
      clientLoginId: raw.clientLoginId || "",
      clientLoginPass: raw.clientLoginPass || "",
      apkPassword: raw.apkPassword || "",
      biometricMode: raw.biometricMode || "face",
      flowType: raw.flowType || "single",
      attendanceMode: raw.attendanceMode || "both",
      omrMode: raw.omrMode || "verification",
      faceLiveness: raw.faceLiveness ?? true,
      retryLimit: raw.retryLimit ? String(raw.retryLimit) : "3",
    });
    setIsEditModalOpen(true);
  };

  const handleEditSave = () => {
    if (!editingExamId) return;
    updateMutation.mutate({
      id: editingExamId,
      data: {
        name: editFormData.name,
        code: editFormData.code,
        client: editFormData.client,
        clientLoginId: editFormData.clientLoginId,
        clientLoginPass: editFormData.clientLoginPass,
        apkPassword: editFormData.apkPassword,
        biometricMode: editFormData.biometricMode,
        flowType: editFormData.flowType,
        attendanceMode: editFormData.attendanceMode,
        omrMode: editFormData.omrMode,
        faceLiveness: editFormData.faceLiveness,
        retryLimit: parseInt(editFormData.retryLimit) || 3,
      },
    });
  };

  const handleToggleStatus = (examId: number, currentStatus: string) => {
    const newStatus = currentStatus === "Active" ? "Stopped" : "Active";
    statusMutation.mutate({ id: examId, status: newStatus });
  };

  const handleCreateExam = () => {
    createMutation.mutate({
      name: formData.name,
      code: formData.code,
      client: formData.client,
      clientLoginId: formData.clientLoginId,
      clientLoginPass: formData.clientLoginPass,
      apkPassword: formData.apkPassword,
      biometricMode: settings.biometricMode,
      flowType: settings.flowType,
      attendanceMode: settings.attendanceMode,
      omrMode: settings.omrMode,
      faceLiveness: settings.faceLiveness,
      retryLimit: parseInt(settings.retryLimit) || 3,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Exam Management</h1>
          <p className="text-gray-500 text-[15px]">Create and manage examination sessions</p>
        </div>
        
        <Dialog open={isAddModalOpen} onOpenChange={(open) => {
          setIsAddModalOpen(open);
          if (open) setActiveStep(1);
        }}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-exam" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 h-auto gap-2">
              <Plus className="w-4 h-4" /> Create Exam
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-xl bg-white">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="text-xl font-bold text-gray-900">Create New Exam</DialogTitle>
            </DialogHeader>
            
            <div className="flex border-b border-gray-100 px-6 mt-4">
              <div 
                className={`py-3 px-4 text-sm font-medium border-b-2 cursor-pointer ${activeStep === 1 ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveStep(1)}
              >
                1. Basic Info
              </div>
              <div 
                className={`py-3 px-4 text-sm font-medium border-b-2 cursor-pointer ${activeStep === 2 ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveStep(2)}
              >
                2. Time Slots
              </div>
              <div 
                className={`py-3 px-4 text-sm font-medium border-b-2 cursor-pointer ${activeStep === 3 ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveStep(3)}
              >
                3. Settings
              </div>
            </div>

            {activeStep === 1 && (
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Exam Name <span className="text-gray-400">*</span></label>
                    <Input placeholder="e.g., UPSC Civil Services 2024" className="border-gray-200 focus-visible:ring-blue-500" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} data-testid="input-exam-name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Exam Code <span className="text-gray-400">*</span></label>
                    <Input placeholder="e.g., UPSC-CS-2024" className="border-gray-200 focus-visible:ring-blue-500" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} data-testid="input-exam-code" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Client Name <span className="text-gray-400">*</span></label>
                    <Input placeholder="e.g., UPSC Board" className="border-gray-200 focus-visible:ring-blue-500" value={formData.client} onChange={(e) => setFormData({ ...formData, client: e.target.value })} data-testid="input-exam-client" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">APK Download Password</label>
                    <Input placeholder="e.g., UPSC2024" className="border-gray-200 focus-visible:ring-blue-500" value={formData.apkPassword} onChange={(e) => setFormData({ ...formData, apkPassword: e.target.value })} data-testid="input-exam-apk-password" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Client Login ID</label>
                    <Input placeholder="Auto-generated or custom" className="border-gray-200 focus-visible:ring-blue-500" value={formData.clientLoginId} onChange={(e) => setFormData({ ...formData, clientLoginId: e.target.value })} data-testid="input-exam-client-login-id" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Client Login Password</label>
                    <Input placeholder="Auto-generated or custom" className="border-gray-200 focus-visible:ring-blue-500" value={formData.clientLoginPass} onChange={(e) => setFormData({ ...formData, clientLoginPass: e.target.value })} data-testid="input-exam-client-login-pass" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setActiveStep(2)} className="bg-blue-600 hover:bg-blue-700 text-white" data-testid="button-next-step-2">
                    Next: Time Slots
                  </Button>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  {slots.map((slot, idx) => (
                    <div key={idx} className="flex items-end gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium text-gray-700">Slot Name</label>
                        <Input value={slot.name} onChange={(e) => { const ns = [...slots]; ns[idx].name = e.target.value; setSlots(ns); }} className="border-gray-200" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Start Time</label>
                        <Input type="time" value={slot.startTime} onChange={(e) => { const ns = [...slots]; ns[idx].startTime = e.target.value; setSlots(ns); }} className="border-gray-200" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">End Time</label>
                        <Input type="time" value={slot.endTime} onChange={(e) => { const ns = [...slots]; ns[idx].endTime = e.target.value; setSlots(ns); }} className="border-gray-200" />
                      </div>
                      {slots.length > 1 && (
                        <Button variant="outline" size="icon" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => setSlots(slots.filter((_, i) => i !== idx))}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="gap-2 border-dashed border-gray-300 text-gray-600" onClick={() => setSlots([...slots, { name: `Slot ${slots.length + 1}`, startTime: "09:00", endTime: "12:00" }])}>
                  <Plus className="w-4 h-4" /> Add Slot
                </Button>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveStep(1)}>Back</Button>
                  <Button onClick={() => setActiveStep(3)} className="bg-blue-600 hover:bg-blue-700 text-white">Next: Settings</Button>
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-[15px] font-semibold text-gray-900 mb-4">Biometric Settings</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Biometric Mode</label>
                      <Select value={settings.biometricMode} onValueChange={(v) => setSettings({...settings, biometricMode: v})}>
                        <SelectTrigger className="border-gray-200"><SelectValue placeholder="Select mode" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="face">Face Only</SelectItem>
                          <SelectItem value="fingerprint">Fingerprint Only</SelectItem>
                          <SelectItem value="both">Face + Fingerprint</SelectItem>
                          <SelectItem value="photo">Photo Capture Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Verification Flow</label>
                      <Select value={settings.flowType} onValueChange={(v) => setSettings({...settings, flowType: v})}>
                        <SelectTrigger className="border-gray-200"><SelectValue placeholder="Select flow" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single Biometric</SelectItem>
                          <SelectItem value="face_finger">Face then Fingerprint</SelectItem>
                          <SelectItem value="finger_face">Fingerprint then Face</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Attendance Mode</label>
                      <Select value={settings.attendanceMode} onValueChange={(v) => setSettings({...settings, attendanceMode: v})}>
                        <SelectTrigger className="border-gray-200"><SelectValue placeholder="Select mode" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="both">Both</SelectItem>
                          <SelectItem value="present">Mark Present Only</SelectItem>
                          <SelectItem value="verification">Verification Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">OMR/Barcode Mode</label>
                      <Select value={settings.omrMode} onValueChange={(v) => setSettings({...settings, omrMode: v})}>
                        <SelectTrigger className="border-gray-200"><SelectValue placeholder="Select mode" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="verification">Verification Only</SelectItem>
                          <SelectItem value="present_verify_omr">Present + Verification + OMR</SelectItem>
                          <SelectItem value="verify_omr">Verification + OMR Scan</SelectItem>
                          <SelectItem value="omr_only">OMR Scan Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[15px] font-semibold text-gray-900 mb-4">Additional Options</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm text-gray-700">Face Liveness Detection</div>
                        <div className="text-xs text-gray-400">Ensure real face during verification</div>
                      </div>
                      <Switch checked={settings.faceLiveness} onCheckedChange={(v) => setSettings({...settings, faceLiveness: v})} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm text-gray-700">Fingerprint Quality Check</div>
                        <div className="text-xs text-gray-400">Reject low quality fingerprints</div>
                      </div>
                      <Switch checked={settings.fingerprintQuality} onCheckedChange={(v) => setSettings({...settings, fingerprintQuality: v})} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm text-gray-700">Offline Mode Support</div>
                        <div className="text-xs text-gray-400">Allow operation without internet</div>
                      </div>
                      <Switch checked={settings.offlineMode} onCheckedChange={(v) => setSettings({...settings, offlineMode: v})} />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveStep(2)}>Back</Button>
                  <Button
                    data-testid="button-submit-create-exam"
                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                    disabled={createMutation.isPending || !formData.name || !formData.code || !formData.client}
                    onClick={handleCreateExam}
                  >
                    {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    Create Exam
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          data-testid="input-search-exams"
          placeholder="Search exams..."
          className="pl-10 border-gray-200 rounded-lg"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}

      {!isLoading && <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {exams.filter(e => !searchQuery || e.name.toLowerCase().includes(searchQuery.toLowerCase()) || e.code.toLowerCase().includes(searchQuery.toLowerCase()) || e.client.toLowerCase().includes(searchQuery.toLowerCase())).map((exam, i) => (
          <Card key={i} data-testid={`card-exam-${exam.examId}`} className="shadow-sm border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-white">
            <CardContent className="p-0">
              <div className="p-5">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${exam.color}`}>
                      {exam.id}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{exam.name}</h3>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">{exam.code}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button data-testid={`button-exam-menu-${exam.examId}`} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 p-2 rounded-xl shadow-lg border-gray-100">
                      <DropdownMenuItem
                        data-testid={`button-edit-exam-${exam.examId}`}
                        className="flex items-center gap-2 px-3 py-2 text-[13px] text-gray-700 cursor-pointer rounded-lg hover:bg-gray-50 focus:bg-gray-50 mb-1"
                        onClick={() => handleEditClick(exam)}
                      >
                        <Edit className="w-4 h-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="flex items-center gap-2 px-3 py-2 text-[13px] text-gray-700 cursor-pointer rounded-lg hover:bg-gray-50 focus:bg-gray-50 mb-1"
                        onClick={() => {
                          if (setActivePage) setActivePage("upload-candidate");
                        }}
                      >
                        <UploadCloud className="w-4 h-4" /> Upload Candidates
                      </DropdownMenuItem>
                      <div className="h-px bg-gray-100 my-1 mx-2" />
                      {exam.status === "Active" ? (
                        <DropdownMenuItem
                          data-testid={`button-stop-exam-${exam.examId}`}
                          className="flex items-center gap-2 px-3 py-2 text-[13px] text-red-600 cursor-pointer rounded-lg hover:bg-red-50 focus:bg-red-50 focus:text-red-600 mb-1"
                          onClick={() => handleToggleStatus(exam.examId, exam.status)}
                        >
                          <SquareSquare className="w-4 h-4" /> Stop Exam
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          data-testid={`button-start-exam-${exam.examId}`}
                          className="flex items-center gap-2 px-3 py-2 text-[13px] text-green-600 cursor-pointer rounded-lg hover:bg-green-50 focus:bg-green-50 focus:text-green-600 mb-1"
                          onClick={() => handleToggleStatus(exam.examId, exam.status)}
                        >
                          <Play className="w-4 h-4" /> Start Exam
                        </DropdownMenuItem>
                      )}
                      <div className="h-px bg-gray-100 my-1 mx-2" />
                      <DropdownMenuItem
                        data-testid={`button-delete-exam-${exam.examId}`}
                        className="flex items-center gap-2 px-3 py-2 text-[13px] text-red-600 cursor-pointer rounded-lg hover:bg-red-50 focus:bg-red-50 focus:text-red-600"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this exam?")) {
                            deleteMutation.mutate(exam.examId);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-gray-500">Client</span>
                    <span className="font-medium text-gray-900 text-right truncate max-w-[200px]" title={exam.client}>{exam.client}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-gray-500">Status</span>
                    <span className={`font-semibold px-2 py-0.5 rounded-md text-xs ${
                      exam.status === 'Active' ? 'text-green-600 bg-green-50' : 
                      exam.status === 'Stopped' ? 'text-red-600 bg-red-50' : 
                      'text-amber-600 bg-amber-50'
                    }`}>
                      {exam.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-gray-500">Candidates</span>
                    <span className="font-semibold text-gray-900">{exam.candidates}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-gray-500">Verified</span>
                    <span className="font-semibold text-green-600">
                      {exam.verified} <span className="font-medium">({exam.verifiedPercent})</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2">
                    <span className="text-gray-500">Created</span>
                    <span className="font-medium text-gray-900">{exam.created}</span>
                  </div>
                </div>
              </div>
              
              <div className="px-5 pb-5 pt-0 space-y-2">
                <div className="flex items-center gap-2 bg-gray-50/80 rounded-lg p-2.5 text-xs text-gray-600 border border-gray-100">
                  <Key className="w-3.5 h-3.5 text-gray-400" />
                  <span>APK Password: <span className="font-mono font-semibold text-gray-800">{exam.apkPass}</span></span>
                </div>
                <div className="flex items-center gap-2 bg-[#f0f7ff] rounded-lg p-2.5 text-xs text-blue-700 border border-blue-100">
                  <User className="w-3.5 h-3.5 text-blue-500" />
                  <span>Client Login: <span className="font-mono font-semibold">{exam.loginId} / {exam.loginPass}</span></span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>}

      {/* Edit Exam Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-xl bg-white">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-xl font-bold text-gray-900">Edit Exam</DialogTitle>
          </DialogHeader>
          
          <div className="p-6 pt-0 space-y-6 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Exam Name</label>
                <Input data-testid="input-edit-exam-name" value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} className="border-gray-200" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Exam Code</label>
                <Input data-testid="input-edit-exam-code" value={editFormData.code} onChange={(e) => setEditFormData({ ...editFormData, code: e.target.value })} className="border-gray-200" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Client Name</label>
                <Input data-testid="input-edit-exam-client" value={editFormData.client} onChange={(e) => setEditFormData({ ...editFormData, client: e.target.value })} className="border-gray-200" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">APK Download Password</label>
                <Input data-testid="input-edit-exam-apk-password" value={editFormData.apkPassword} onChange={(e) => setEditFormData({ ...editFormData, apkPassword: e.target.value })} className="border-gray-200" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Client Login ID</label>
                <Input data-testid="input-edit-exam-client-login-id" value={editFormData.clientLoginId} onChange={(e) => setEditFormData({ ...editFormData, clientLoginId: e.target.value })} className="border-gray-200" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Client Login Password</label>
                <Input data-testid="input-edit-exam-client-login-pass" value={editFormData.clientLoginPass} onChange={(e) => setEditFormData({ ...editFormData, clientLoginPass: e.target.value })} className="border-gray-200" />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <h4 className="text-[15px] font-semibold text-gray-900 mb-4">Biometric Settings</h4>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Biometric Mode</label>
                  <Select value={editFormData.biometricMode} onValueChange={(v) => setEditFormData({...editFormData, biometricMode: v})}>
                    <SelectTrigger className="border-gray-200"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="face">Face Only</SelectItem>
                      <SelectItem value="fingerprint">Fingerprint Only</SelectItem>
                      <SelectItem value="both">Face + Fingerprint</SelectItem>
                      <SelectItem value="photo">Photo Capture Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Verification Flow</label>
                  <Select value={editFormData.flowType} onValueChange={(v) => setEditFormData({...editFormData, flowType: v})}>
                    <SelectTrigger className="border-gray-200"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single Biometric</SelectItem>
                      <SelectItem value="face_finger">Face then Fingerprint</SelectItem>
                      <SelectItem value="finger_face">Fingerprint then Face</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Attendance Mode</label>
                  <Select value={editFormData.attendanceMode} onValueChange={(v) => setEditFormData({...editFormData, attendanceMode: v})}>
                    <SelectTrigger className="border-gray-200"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="both">Both</SelectItem>
                      <SelectItem value="present">Mark Present Only</SelectItem>
                      <SelectItem value="verification">Verification Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Retry Limit</label>
                  <Input type="number" data-testid="input-edit-exam-retry-limit" value={editFormData.retryLimit} onChange={(e) => setEditFormData({...editFormData, retryLimit: e.target.value})} className="border-gray-200" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm text-gray-700">Face Liveness Detection</div>
                  <div className="text-xs text-gray-400">Ensure real face during verification</div>
                </div>
                <Switch checked={editFormData.faceLiveness} onCheckedChange={(v) => setEditFormData({...editFormData, faceLiveness: v})} />
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3">
            <Button variant="outline" className="border-gray-200" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button
              data-testid="button-save-edit-exam"
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              disabled={updateMutation.isPending}
              onClick={handleEditSave}
            >
              {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
