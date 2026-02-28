import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  ScanFace, Fingerprint, Eye, Hand, Mic, PenTool, Activity,
  Plus, Pencil, Trash2, Settings2, ChevronRight, Loader2, Plug, Cpu, Cable,
  Upload, FolderOpen, FileArchive, CheckCircle2, XCircle, HardDrive
} from "lucide-react";

const CATEGORY_ICONS: Record<string, any> = {
  face: ScanFace, fingerprint: Fingerprint, iris: Eye, palm: Hand,
  voice: Mic, signature: PenTool, vein: Activity,
};

const CATEGORY_COLORS: Record<string, string> = {
  face: "bg-blue-100 text-blue-700",
  fingerprint: "bg-green-100 text-green-700",
  iris: "bg-purple-100 text-purple-700",
  palm: "bg-orange-100 text-orange-700",
  voice: "bg-pink-100 text-pink-700",
  signature: "bg-yellow-100 text-yellow-700",
  vein: "bg-red-100 text-red-700",
};

const PRESET_PLUGINS = [
  { name: "Face Recognition (Camera)", code: "face_camera", category: "face", captureType: "image", manufacturer: "Device Camera", model: "Built-in", connectionType: "Built-in", templateFormat: "JPEG", sdkPackage: "com.google.mlkit.vision.face", sdkVersion: "16.1.5" },
  { name: "MFS100 Fingerprint", code: "mfs100", category: "fingerprint", captureType: "template", manufacturer: "Mantra", model: "MFS100", connectionType: "USB", templateFormat: "ISO 19794-2", sdkPackage: "com.mantra.mfs100", sdkVersion: "2.0.8" },
  { name: "MFS110 Fingerprint", code: "mfs110", category: "fingerprint", captureType: "template", manufacturer: "Mantra", model: "MFS110", connectionType: "USB", templateFormat: "ISO 19794-2", sdkPackage: "com.mantra.mfs110", sdkVersion: "2.1.3" },
  { name: "MFS500 Fingerprint", code: "mfs500", category: "fingerprint", captureType: "template", manufacturer: "Mantra", model: "MFS500", connectionType: "USB", templateFormat: "ISO 19794-2", sdkPackage: "com.mantra.mfs500", sdkVersion: "3.0.1" },
  { name: "Morpho MSO 1300 E3", code: "morpho_1300", category: "fingerprint", captureType: "template", manufacturer: "IDEMIA (Morpho)", model: "MSO 1300 E3", connectionType: "USB", templateFormat: "ISO 19794-2", sdkPackage: "com.morpho.morphosmart", sdkVersion: "4.8.0" },
  { name: "Startek FM220U", code: "startek_fm220", category: "fingerprint", captureType: "template", manufacturer: "Startek", model: "FM220U", connectionType: "USB", templateFormat: "ISO 19794-2", sdkPackage: "com.acpl.registersdk", sdkVersion: "1.0.5" },
  { name: "Secugen Hamster Pro 20", code: "secugen_hpro20", category: "fingerprint", captureType: "template", manufacturer: "SecuGen", model: "Hamster Pro 20", connectionType: "USB", templateFormat: "ISO 19794-2", sdkPackage: "com.secugen.fplib", sdkVersion: "3.2.0" },
  { name: "Iris Scanner (IriTech)", code: "iris_iritech", category: "iris", captureType: "template", manufacturer: "IriTech", model: "IriShield MK2120UL", connectionType: "USB", templateFormat: "ISO 19794-6", sdkPackage: "com.iritech.irishield", sdkVersion: "5.3.0" },
  { name: "CMITech EF-45", code: "iris_cmitech", category: "iris", captureType: "template", manufacturer: "CMITech", model: "EF-45", connectionType: "USB", templateFormat: "ISO 19794-6", sdkPackage: "com.cmitech.iris", sdkVersion: "2.0.1" },
  { name: "Palm Vein Scanner (Fujitsu)", code: "palm_fujitsu", category: "palm", captureType: "template", manufacturer: "Fujitsu", model: "PalmSecure", connectionType: "USB", templateFormat: "Proprietary", sdkPackage: "com.fujitsu.palmsecure", sdkVersion: "3.1.0" },
  { name: "Palm Print (ZKTeco)", code: "palm_zkteco", category: "palm", captureType: "image", manufacturer: "ZKTeco", model: "ZK-PA10", connectionType: "USB", templateFormat: "ISO 19794-4", sdkPackage: "com.zkteco.palm", sdkVersion: "2.5.0" },
];

interface PluginForm {
  name: string;
  code: string;
  category: string;
  manufacturer: string;
  model: string;
  sdkPackage: string;
  sdkVersion: string;
  connectionType: string;
  captureType: string;
  templateFormat: string;
  minAndroidVersion: string;
}

const defaultForm: PluginForm = {
  name: "", code: "", category: "fingerprint", manufacturer: "", model: "",
  sdkPackage: "", sdkVersion: "", connectionType: "USB", captureType: "template",
  templateFormat: "ISO 19794-2", minAndroidVersion: "8.0",
};

export default function BiometricPluginsPage() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<PluginForm>(defaultForm);
  const [showExamConfig, setShowExamConfig] = useState<number | null>(null);
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const [sdkUploadPlugin, setSdkUploadPlugin] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  const { data: sdkFilesData, refetch: refetchSdkFiles } = useQuery({
    queryKey: ["/api/sdk/plugins", sdkUploadPlugin?.code, "files"],
    queryFn: () => sdkUploadPlugin ? fetch(`/api/sdk/plugins/${sdkUploadPlugin.code}/files`).then(r => r.json()) : Promise.resolve(null),
    enabled: !!sdkUploadPlugin,
  });

  const handleSdkUpload = async (files: File[], pluginCode: string, fileType: string) => {
    if (files.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      for (const f of files) formData.append("files", f);
      const resp = await fetch(`/api/sdk/upload?plugin=${pluginCode}&type=${fileType}`, {
        method: "POST", body: formData,
      });
      const result = await resp.json();
      if (!resp.ok) throw new Error(result.message);
      toast({ title: "SDK Files Uploaded", description: `${files.length} file(s) uploaded to ${pluginCode}/${fileType}` });
      refetchSdkFiles();
    } catch (err: any) {
      toast({ title: "Upload Failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteSdkFile = async (filePath: string) => {
    try {
      const resp = await fetch(`/api/sdk/files/${encodeURIComponent(filePath)}`, { method: "DELETE" });
      if (!resp.ok) throw new Error("Failed to delete");
      toast({ title: "File Deleted" });
      refetchSdkFiles();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const { data: plugins = [], isLoading } = useQuery({
    queryKey: ["/api/biometric-plugins"],
  });

  const { data: exams = [] } = useQuery({ queryKey: ["/api/exams"] });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/biometric-plugins/categories/list"],
  });

  const { data: examConfig = [], refetch: refetchExamConfig } = useQuery({
    queryKey: ["/api/exams", selectedExamId, "biometric-config"],
    queryFn: () => selectedExamId ? fetch(`/api/exams/${selectedExamId}/biometric-config`).then(r => r.json()) : Promise.resolve([]),
    enabled: !!selectedExamId,
  });

  const createMutation = useMutation({
    mutationFn: (data: PluginForm) => apiRequest("POST", "/api/biometric-plugins", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/biometric-plugins"] });
      setShowForm(false); setForm(defaultForm);
      toast({ title: "Plugin added successfully" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PluginForm> }) =>
      apiRequest("PATCH", `/api/biometric-plugins/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/biometric-plugins"] });
      setShowForm(false); setEditingId(null); setForm(defaultForm);
      toast({ title: "Plugin updated" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/biometric-plugins/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/biometric-plugins"] });
      toast({ title: "Plugin deleted" });
    },
  });

  const addToExamMutation = useMutation({
    mutationFn: ({ examId, pluginId, stepOrder }: { examId: number; pluginId: number; stepOrder: number }) =>
      apiRequest("POST", `/api/exams/${examId}/biometric-config`, { pluginId, stepOrder }),
    onSuccess: () => {
      refetchExamConfig();
      toast({ title: "Plugin added to exam" });
    },
  });

  const removeFromExamMutation = useMutation({
    mutationFn: ({ examId, configId }: { examId: number; configId: number }) =>
      apiRequest("DELETE", `/api/exams/${examId}/biometric-config/${configId}`),
    onSuccess: () => {
      refetchExamConfig();
      toast({ title: "Plugin removed from exam" });
    },
  });

  const handleAddPreset = (preset: typeof PRESET_PLUGINS[0]) => {
    const alreadyExists = (plugins as any[]).some((p: any) => p.code === preset.code);
    if (alreadyExists) {
      toast({ title: "Already exists", description: `${preset.name} is already registered`, variant: "destructive" });
      return;
    }
    createMutation.mutate(preset as any);
    setShowPresets(false);
  };

  const handleEdit = (plugin: any) => {
    setEditingId(plugin.id);
    setForm({
      name: plugin.name, code: plugin.code, category: plugin.category,
      manufacturer: plugin.manufacturer || "", model: plugin.model || "",
      sdkPackage: plugin.sdkPackage || "", sdkVersion: plugin.sdkVersion || "",
      connectionType: plugin.connectionType || "USB", captureType: plugin.captureType,
      templateFormat: plugin.templateFormat || "", minAndroidVersion: plugin.minAndroidVersion || "8.0",
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!form.name || !form.code || !form.category || !form.captureType) {
      toast({ title: "Required fields missing", variant: "destructive" }); return;
    }
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const getCategoryIcon = (cat: string) => {
    const Icon = CATEGORY_ICONS[cat] || Plug;
    return <Icon className="w-5 h-5" />;
  };

  const pluginsByCategory = (plugins as any[]).reduce((acc: any, p: any) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" data-testid="text-page-title">Biometric Plugins</h1>
          <p className="text-sm text-gray-500 mt-1">Manage biometric devices and SDKs — assign to exams for multi-biometric verification</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPresets(true)} data-testid="button-add-preset" className="gap-2">
            <Cpu className="w-4 h-4" /> Add Preset Device
          </Button>
          <Button onClick={() => { setEditingId(null); setForm(defaultForm); setShowForm(true); }} data-testid="button-add-custom" className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Custom Plugin
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="border-gray-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Plug className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900" data-testid="text-total-plugins">{(plugins as any[]).length}</div>
              <div className="text-xs text-gray-500">Total Plugins</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Fingerprint className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{(plugins as any[]).filter((p: any) => p.category === "fingerprint").length}</div>
              <div className="text-xs text-gray-500">Fingerprint</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{(plugins as any[]).filter((p: any) => p.category === "iris").length}</div>
              <div className="text-xs text-gray-500">Iris</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gray-200">
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <Hand className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{(plugins as any[]).filter((p: any) => ["palm", "vein"].includes(p.category)).length}</div>
              <div className="text-xs text-gray-500">Palm / Vein</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : (plugins as any[]).length === 0 ? (
        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="py-12 text-center">
            <Plug className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-700 mb-1">No Plugins Registered</h3>
            <p className="text-sm text-gray-500 mb-4">Add preset devices (MFS100, MFS110, etc.) or create custom plugins</p>
            <Button onClick={() => setShowPresets(true)} className="gap-2 bg-blue-600 hover:bg-blue-700" data-testid="button-get-started">
              <Cpu className="w-4 h-4" /> Get Started — Add Device
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(pluginsByCategory).map(([cat, items]: [string, any]) => (
            <Card key={cat} className="border-gray-200">
              <CardHeader className="pb-2 pt-4 px-5">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center ${CATEGORY_COLORS[cat] || "bg-gray-100 text-gray-600"}`}>
                    {getCategoryIcon(cat)}
                  </div>
                  <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{cat}</CardTitle>
                  <Badge variant="secondary" className="text-xs">{items.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-4">
                <div className="space-y-2">
                  {items.map((plugin: any) => (
                    <div key={plugin.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors" data-testid={`plugin-row-${plugin.id}`}>
                      <div className="flex items-center gap-4 flex-1">
                        <div>
                          <div className="font-medium text-sm text-gray-900">{plugin.name}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <code className="text-xs text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded">{plugin.code}</code>
                            {plugin.manufacturer && <span className="text-xs text-gray-500">{plugin.manufacturer} {plugin.model}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Cable className="w-3 h-3" />
                          {plugin.connectionType}
                        </div>
                        <Badge variant={plugin.status === "Active" ? "default" : "secondary"} className="text-[10px]">
                          {plugin.status}
                        </Badge>
                        <Button variant="outline" size="sm" className="gap-1 text-xs text-purple-600 border-purple-200 hover:bg-purple-50"
                          onClick={() => setSdkUploadPlugin(plugin)} data-testid={`button-sdk-upload-${plugin.id}`}>
                          <Upload className="w-3 h-3" /> SDK
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(plugin)} data-testid={`button-edit-plugin-${plugin.id}`}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => deleteMutation.mutate(plugin.id)} data-testid={`button-delete-plugin-${plugin.id}`}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="border-gray-200">
        <CardHeader className="pb-3 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-gray-600" />
              <CardTitle className="text-base font-semibold text-gray-800">Exam Biometric Configuration</CardTitle>
            </div>
          </div>
          <p className="text-sm text-gray-500">Assign plugins to exams and define the verification step order</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Select value={selectedExamId ? String(selectedExamId) : ""} onValueChange={(v) => setSelectedExamId(Number(v))}>
              <SelectTrigger className="w-[300px]" data-testid="select-exam-config">
                <SelectValue placeholder="Select an exam to configure" />
              </SelectTrigger>
              <SelectContent>
                {(exams as any[]).map((exam: any) => (
                  <SelectItem key={exam.id} value={String(exam.id)}>{exam.name} ({exam.code})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedExamId && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700">Verification Steps</h4>
                <div className="text-xs text-gray-500">{(examConfig as any[]).length} step(s) configured</div>
              </div>

              {(examConfig as any[]).length > 0 && (
                <div className="space-y-2">
                  {(examConfig as any[]).map((config: any, idx: number) => (
                    <div key={config.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg" data-testid={`exam-step-${idx}`}>
                      <div className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {config.stepOrder}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">{config.plugin?.name || "Unknown Plugin"}</div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>Threshold: {config.threshold}%</span>
                          <span>Retries: {config.retryLimit}</span>
                          <span>Timeout: {config.captureTimeout}s</span>
                          {config.required && <Badge className="text-[9px] bg-red-100 text-red-600">Required</Badge>}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-red-500"
                        onClick={() => removeFromExamMutation.mutate({ examId: selectedExamId, configId: config.id })}
                        data-testid={`button-remove-step-${idx}`}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {(plugins as any[]).length > 0 && (
                <div className="border border-dashed border-gray-200 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-2">Add plugin to verification pipeline:</p>
                  <div className="flex flex-wrap gap-2">
                    {(plugins as any[]).filter((p: any) => p.status === "Active").map((plugin: any) => {
                      const alreadyAdded = (examConfig as any[]).some((c: any) => c.pluginId === plugin.id);
                      return (
                        <Button key={plugin.id} variant={alreadyAdded ? "secondary" : "outline"} size="sm" disabled={alreadyAdded}
                          className="gap-1.5 text-xs"
                          onClick={() => addToExamMutation.mutate({ examId: selectedExamId, pluginId: plugin.id, stepOrder: (examConfig as any[]).length + 1 })}
                          data-testid={`button-add-to-exam-${plugin.id}`}>
                          {getCategoryIcon(plugin.category)}
                          {plugin.name}
                          {alreadyAdded && <span className="text-[10px]">(added)</span>}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showPresets} onOpenChange={setShowPresets}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Cpu className="w-5 h-5" /> Add Preset Biometric Device</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            {["fingerprint", "face", "iris", "palm"].map((cat) => {
              const catPresets = PRESET_PLUGINS.filter((p) => p.category === cat);
              if (catPresets.length === 0) return null;
              return (
                <div key={cat}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-6 h-6 rounded flex items-center justify-center ${CATEGORY_COLORS[cat]}`}>
                      {getCategoryIcon(cat)}
                    </div>
                    <span className="text-sm font-semibold text-gray-700 uppercase">{cat}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {catPresets.map((preset) => {
                      const exists = (plugins as any[]).some((p: any) => p.code === preset.code);
                      return (
                        <div key={preset.code}
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${exists ? "border-green-200 bg-green-50 opacity-70" : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"}`}
                          onClick={() => !exists && handleAddPreset(preset)}
                          data-testid={`preset-${preset.code}`}>
                          <div className="font-medium text-sm text-gray-900">{preset.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{preset.manufacturer} — {preset.connectionType}</div>
                          {exists && <Badge className="mt-1 text-[10px] bg-green-200 text-green-700">Already Added</Badge>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showForm} onOpenChange={(open) => { setShowForm(open); if (!open) { setEditingId(null); setForm(defaultForm); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Plugin" : "Add Custom Plugin"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Plugin Name *</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. MFS200 Fingerprint" data-testid="input-plugin-name" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Code *</label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. mfs200" data-testid="input-plugin-code" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Category *</label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger data-testid="select-category"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(categories as any[]).map((c: any) => (
                      <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Capture Type *</label>
                <Select value={form.captureType} onValueChange={(v) => setForm({ ...form, captureType: v })}>
                  <SelectTrigger data-testid="select-capture-type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="template">Template</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Manufacturer</label>
                <Input value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} placeholder="e.g. Mantra" data-testid="input-manufacturer" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Model</label>
                <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="e.g. MFS200" data-testid="input-model" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600">SDK Package</label>
                <Input value={form.sdkPackage} onChange={(e) => setForm({ ...form, sdkPackage: e.target.value })} placeholder="com.mantra.mfs200" data-testid="input-sdk-package" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">SDK Version</label>
                <Input value={form.sdkVersion} onChange={(e) => setForm({ ...form, sdkVersion: e.target.value })} placeholder="2.0.0" data-testid="input-sdk-version" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Connection</label>
                <Select value={form.connectionType} onValueChange={(v) => setForm({ ...form, connectionType: v })}>
                  <SelectTrigger data-testid="select-connection"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USB">USB</SelectItem>
                    <SelectItem value="Bluetooth">Bluetooth</SelectItem>
                    <SelectItem value="Built-in">Built-in</SelectItem>
                    <SelectItem value="WiFi">WiFi</SelectItem>
                    <SelectItem value="NFC">NFC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Template Format</label>
                <Input value={form.templateFormat} onChange={(e) => setForm({ ...form, templateFormat: e.target.value })} placeholder="ISO 19794-2" data-testid="input-template-format" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Min Android</label>
                <Input value={form.minAndroidVersion} onChange={(e) => setForm({ ...form, minAndroidVersion: e.target.value })} placeholder="8.0" data-testid="input-min-android" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => { setShowForm(false); setEditingId(null); setForm(defaultForm); }}>Cancel</Button>
              <Button className="bg-blue-600 hover:bg-blue-700 gap-2" onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-plugin">
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? "Update Plugin" : "Add Plugin"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!sdkUploadPlugin} onOpenChange={(open) => { if (!open) setSdkUploadPlugin(null); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-purple-600" />
              Upload SDK — {sdkUploadPlugin?.name}
            </DialogTitle>
          </DialogHeader>
          {sdkUploadPlugin && (
            <div className="space-y-4 mt-2">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 space-y-1">
                <p className="font-semibold">Upload SDK files for: {sdkUploadPlugin.manufacturer} {sdkUploadPlugin.model}</p>
                <p>Files will be stored at: <code className="bg-blue-100 px-1 rounded">sdk/{sdkUploadPlugin.code}/</code></p>
                <p>These files are automatically included in APK builds that use this plugin.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="border border-gray-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <FileArchive className="w-4 h-4 text-orange-500" /> JAR / AAR Libraries
                  </div>
                  <p className="text-xs text-gray-500">Main SDK library file (.jar or .aar)</p>
                  <label className="inline-flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors w-full justify-center" data-testid="button-upload-jar">
                    <Upload className="w-3.5 h-3.5" /> {uploading ? "Uploading..." : "Upload .jar / .aar"}
                    <input type="file" multiple accept=".jar,.aar" className="hidden" disabled={uploading} onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      handleSdkUpload(files, sdkUploadPlugin.code, "jar");
                      e.target.value = "";
                    }} />
                  </label>
                </div>

                <div className="border border-gray-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Cpu className="w-4 h-4 text-blue-500" /> Native Libraries (.so)
                  </div>
                  <p className="text-xs text-gray-500">ARM native shared libraries</p>
                  <div className="flex gap-2">
                    <label className="inline-flex items-center gap-1 px-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold rounded-lg cursor-pointer transition-colors flex-1 justify-center" data-testid="button-upload-so-v8a">
                      <Upload className="w-3 h-3" /> arm64-v8a
                      <input type="file" multiple accept=".so" className="hidden" disabled={uploading} onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        handleSdkUpload(files, sdkUploadPlugin.code, "so-v8a");
                        e.target.value = "";
                      }} />
                    </label>
                    <label className="inline-flex items-center gap-1 px-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold rounded-lg cursor-pointer transition-colors flex-1 justify-center" data-testid="button-upload-so-v7a">
                      <Upload className="w-3 h-3" /> armeabi-v7a
                      <input type="file" multiple accept=".so" className="hidden" disabled={uploading} onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        handleSdkUpload(files, sdkUploadPlugin.code, "so-v7a");
                        e.target.value = "";
                      }} />
                    </label>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Activity className="w-4 h-4 text-purple-500" /> AI Models (.tflite)
                  </div>
                  <p className="text-xs text-gray-500">TensorFlow Lite models for biometric matching</p>
                  <label className="inline-flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors w-full justify-center" data-testid="button-upload-model">
                    <Upload className="w-3.5 h-3.5" /> {uploading ? "Uploading..." : "Upload .tflite"}
                    <input type="file" multiple accept=".tflite" className="hidden" disabled={uploading} onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      handleSdkUpload(files, sdkUploadPlugin.code, "model");
                      e.target.value = "";
                    }} />
                  </label>
                </div>

                <div className="border border-gray-200 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <FolderOpen className="w-4 h-4 text-green-500" /> Other Files
                  </div>
                  <p className="text-xs text-gray-500">Config files, certificates, etc.</p>
                  <label className="inline-flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors w-full justify-center" data-testid="button-upload-other">
                    <Upload className="w-3.5 h-3.5" /> {uploading ? "Uploading..." : "Upload Files"}
                    <input type="file" multiple className="hidden" disabled={uploading} onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      handleSdkUpload(files, sdkUploadPlugin.code, "other");
                      e.target.value = "";
                    }} />
                  </label>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FolderOpen className="w-4 h-4" /> Uploaded Files for {sdkUploadPlugin.code}
                  </h4>
                  {sdkFilesData && (
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1">
                        {sdkFilesData.hasJar ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-red-400" />} JAR/AAR
                      </span>
                      <span className="flex items-center gap-1">
                        {sdkFilesData.hasNative ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-red-400" />} Native SO
                      </span>
                      <span className="flex items-center gap-1">
                        {sdkFilesData.hasModel ? <CheckCircle2 className="w-3 h-3 text-green-500" /> : <XCircle className="w-3 h-3 text-red-400" />} AI Model
                      </span>
                      {sdkFilesData.totalSizeStr && <Badge variant="secondary" className="text-[10px]">{sdkFilesData.totalSizeStr}</Badge>}
                    </div>
                  )}
                </div>
                {sdkFilesData?.files?.length > 0 ? (
                  <div className="space-y-1 max-h-[200px] overflow-y-auto">
                    {sdkFilesData.files.map((f: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs" data-testid={`sdk-file-row-${i}`}>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${f.type === 'JAR Library' || f.type === 'AAR Library' ? 'bg-orange-100 text-orange-700' : f.type === 'Native Library' ? 'bg-blue-100 text-blue-700' : f.type === 'AI Model' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                            {f.type.split(' ')[0]}
                          </span>
                          <span className="font-mono text-gray-700 truncate">{f.path}</span>
                          <span className="text-gray-400">{f.sizeStr}</span>
                        </div>
                        <button className="text-red-400 hover:text-red-600 p-1" onClick={() => handleDeleteSdkFile(f.fullPath)} data-testid={`button-delete-sdk-file-${i}`}>
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-400 text-xs">No SDK files uploaded for this plugin yet</div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
