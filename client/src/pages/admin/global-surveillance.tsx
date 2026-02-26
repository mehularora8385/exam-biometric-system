import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Radar, Eye, BrainCircuit, Mic, Waves, Fingerprint, Cpu, Volume2, Save, Zap, Activity } from "lucide-react";

export default function GlobalSurveillance() {
  const [activeTab, setActiveTab] = useState<"kinesics" | "rfid" | "voice">("kinesics");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: exams = [] } = useQuery({
    queryKey: ["exams"],
    queryFn: api.exams.list,
  });
  const [selectedExamId, setSelectedExamId] = useState<string>("");

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["/api/global-tech-settings", selectedExamId],
    queryFn: () => fetch(`/api/global-tech-settings/${selectedExamId || 0}`).then(r => r.json()),
    enabled: true,
  });

  const [kinesicsEnabled, setKinesicsEnabled] = useState(false);
  const [rfidEnabled, setRfidEnabled] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [kinesicsSettings, setKinesicsSettings] = useState<any>({
    microExpressions: true,
    stressAnalysis: true,
    gazeTracking: true,
    confidenceThreshold: 70,
  });
  const [rfidSettings, setRfidSettings] = useState<any>({
    passiveTracking: true,
    entryExitLog: true,
    unauthorizedMovement: true,
    scanInterval: 5,
  });
  const [voiceSettings, setVoiceSettings] = useState<any>({
    passphraseMatch: true,
    syntheticDetection: false,
    backgroundAnomaly: false,
    sampleDuration: 3,
  });

  useEffect(() => {
    if (settings && !settings.message) {
      setKinesicsEnabled(settings.kinesicsEnabled ?? false);
      setRfidEnabled(settings.rfidEnabled ?? false);
      setVoiceEnabled(settings.voiceBiometricsEnabled ?? false);
      if (settings.settings) {
        if (settings.settings.kinesics) setKinesicsSettings(settings.settings.kinesics);
        if (settings.settings.rfid) setRfidSettings(settings.settings.rfid);
        if (settings.settings.voice) setVoiceSettings(settings.settings.voice);
      }
    }
  }, [settings]);

  useEffect(() => {
    if (exams.length > 0 && !selectedExamId) {
      setSelectedExamId(String(exams[0].id));
    }
  }, [exams]);

  const saveMutation = useMutation({
    mutationFn: () => fetch("/api/global-tech-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        examId: selectedExamId ? Number(selectedExamId) : null,
        kinesicsEnabled,
        rfidEnabled,
        voiceBiometricsEnabled: voiceEnabled,
        settings: {
          kinesics: kinesicsSettings,
          rfid: rfidSettings,
          voice: voiceSettings,
        },
      }),
    }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/global-tech-settings"] });
      toast({ title: "Settings saved successfully" });
    },
    onError: (err: Error) => toast({ title: "Error saving", description: err.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-300 font-sans pb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2" data-testid="text-surveillance-title">
            <Radar className="w-5 h-5 text-indigo-600" /> Advanced Surveillance
          </h1>
          <p className="text-sm text-gray-500">Configure next-gen verification technologies per exam</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedExamId} onValueChange={setSelectedExamId}>
            <SelectTrigger className="h-8 w-48 text-xs" data-testid="select-exam-surveillance">
              <SelectValue placeholder="Select Exam" />
            </SelectTrigger>
            <SelectContent>
              {exams.map((exam: any) => (
                <SelectItem key={exam.id} value={String(exam.id)}>{exam.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            data-testid="button-save-surveillance"
          >
            {saveMutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}
            Save All
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <TabCard
          active={activeTab === "kinesics"}
          enabled={kinesicsEnabled}
          onClick={() => setActiveTab("kinesics")}
          icon={<Eye className="w-5 h-5" />}
          title="Kinesics & Micro-Expressions"
          desc="Behavioral analysis for stress/deception"
          color="indigo"
          testId="tab-kinesics"
        />
        <TabCard
          active={activeTab === "rfid"}
          enabled={rfidEnabled}
          onClick={() => setActiveTab("rfid")}
          icon={<Waves className="w-5 h-5" />}
          title="UHF RFID Tracking"
          desc="Passive candidate movement tracking"
          color="blue"
          testId="tab-rfid"
        />
        <TabCard
          active={activeTab === "voice"}
          enabled={voiceEnabled}
          onClick={() => setActiveTab("voice")}
          icon={<Mic className="w-5 h-5" />}
          title="Voice Biometrics"
          desc="Vocal passphrase + noise anomaly"
          color="purple"
          testId="tab-voice"
        />
      </div>

      {activeTab === "kinesics" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="shadow-sm border-gray-100 rounded-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Kinesics Configuration</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500">Enable</span>
                  <Switch checked={kinesicsEnabled} onCheckedChange={setKinesicsEnabled} data-testid="switch-kinesics" />
                </div>
              </div>
              <div className="space-y-3">
                <ToggleRow label="Micro-Expression Analysis" desc="Detect involuntary facial micro-expressions during verification" icon={<Eye className="w-4 h-4 text-indigo-600" />}
                  checked={kinesicsSettings.microExpressions} onChange={(v) => setKinesicsSettings({ ...kinesicsSettings, microExpressions: v })} testId="switch-micro-expr" />
                <ToggleRow label="Stress Pattern Analysis" desc="Monitor physiological stress indicators" icon={<Activity className="w-4 h-4 text-indigo-600" />}
                  checked={kinesicsSettings.stressAnalysis} onChange={(v) => setKinesicsSettings({ ...kinesicsSettings, stressAnalysis: v })} testId="switch-stress" />
                <ToggleRow label="Gaze Tracking" desc="Track eye movement for distraction or prompting" icon={<Fingerprint className="w-4 h-4 text-indigo-600" />}
                  checked={kinesicsSettings.gazeTracking} onChange={(v) => setKinesicsSettings({ ...kinesicsSettings, gazeTracking: v })} testId="switch-gaze" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-gray-100 rounded-lg bg-slate-900 text-white flex flex-col items-center justify-center p-6">
            <BrainCircuit className="w-10 h-10 text-indigo-400 mb-3" />
            <h3 className="font-bold text-white text-base mb-1">Neural Analysis Engine</h3>
            <p className="text-slate-400 text-xs text-center mb-4">Real-time behavioral pattern recognition</p>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${kinesicsEnabled ? "bg-green-900/50 text-green-400 border border-green-500/30" : "bg-gray-700 text-gray-400 border border-gray-600"}`}>
              {kinesicsEnabled ? "Active" : "Disabled"}
            </div>
          </Card>
        </div>
      )}

      {activeTab === "rfid" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="shadow-sm border-gray-100 rounded-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">RFID Configuration</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500">Enable</span>
                  <Switch checked={rfidEnabled} onCheckedChange={setRfidEnabled} data-testid="switch-rfid" />
                </div>
              </div>
              <div className="space-y-3">
                <ToggleRow label="Passive Movement Tracking" desc="Track candidate movement via UHF RFID tags" icon={<Waves className="w-4 h-4 text-blue-600" />}
                  checked={rfidSettings.passiveTracking} onChange={(v) => setRfidSettings({ ...rfidSettings, passiveTracking: v })} testId="switch-passive" />
                <ToggleRow label="Entry/Exit Logging" desc="Log entry and exit times at exam venues" icon={<Zap className="w-4 h-4 text-blue-600" />}
                  checked={rfidSettings.entryExitLog} onChange={(v) => setRfidSettings({ ...rfidSettings, entryExitLog: v })} testId="switch-entry-exit" />
                <ToggleRow label="Unauthorized Movement Alert" desc="Alert on unexpected candidate movement patterns" icon={<Radar className="w-4 h-4 text-blue-600" />}
                  checked={rfidSettings.unauthorizedMovement} onChange={(v) => setRfidSettings({ ...rfidSettings, unauthorizedMovement: v })} testId="switch-unauth" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-gray-100 rounded-lg bg-slate-900 text-white flex flex-col items-center justify-center p-6">
            <Waves className="w-10 h-10 text-blue-400 mb-3" />
            <h3 className="font-bold text-white text-base mb-1">RFID Tracking System</h3>
            <p className="text-slate-400 text-xs text-center mb-4">Passive monitoring via UHF radio frequency</p>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${rfidEnabled ? "bg-green-900/50 text-green-400 border border-green-500/30" : "bg-gray-700 text-gray-400 border border-gray-600"}`}>
              {rfidEnabled ? "Active" : "Disabled"}
            </div>
          </Card>
        </div>
      )}

      {activeTab === "voice" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="shadow-sm border-gray-100 rounded-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Voice Biometrics Configuration</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500">Enable</span>
                  <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} data-testid="switch-voice" />
                </div>
              </div>
              <div className="space-y-3">
                <ToggleRow label="Passphrase Matching" desc="Voice passphrase identity verification" icon={<Mic className="w-4 h-4 text-purple-600" />}
                  checked={voiceSettings.passphraseMatch} onChange={(v) => setVoiceSettings({ ...voiceSettings, passphraseMatch: v })} testId="switch-passphrase" />
                <ToggleRow label="Synthetic Audio Detection" desc="Detect AI-generated or pre-recorded playback" icon={<Cpu className="w-4 h-4 text-purple-600" />}
                  checked={voiceSettings.syntheticDetection} onChange={(v) => setVoiceSettings({ ...voiceSettings, syntheticDetection: v })} testId="switch-synthetic" />
                <ToggleRow label="Background Anomaly" desc="Flag whisper/coaching in audio background" icon={<Volume2 className="w-4 h-4 text-purple-600" />}
                  checked={voiceSettings.backgroundAnomaly} onChange={(v) => setVoiceSettings({ ...voiceSettings, backgroundAnomaly: v })} testId="switch-bg-anomaly" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-gray-100 rounded-lg bg-slate-900 text-white flex flex-col items-center justify-center p-6">
            <Mic className="w-10 h-10 text-purple-400 mb-3" />
            <h3 className="font-bold text-white text-base mb-1">Voice Analysis Engine</h3>
            <p className="text-slate-400 text-xs text-center mb-4">Multi-channel acoustic processing</p>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${voiceEnabled ? "bg-green-900/50 text-green-400 border border-green-500/30" : "bg-gray-700 text-gray-400 border border-gray-600"}`}>
              {voiceEnabled ? "Active" : "Disabled"}
            </div>
            <div className="w-full flex items-center justify-center gap-1 h-16 mt-4">
              {[...Array(16)].map((_, i) => (
                <div key={i} className={`w-1.5 rounded-full transition-all ${voiceEnabled ? "bg-purple-500" : "bg-gray-600"}`} style={{ height: `${20 + Math.random() * 80}%` }} />
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function TabCard({ active, enabled, onClick, icon, title, desc, color, testId }: {
  active: boolean; enabled: boolean; onClick: () => void; icon: React.ReactNode; title: string; desc: string; color: string; testId: string;
}) {
  const borderColor = active ? `border-${color}-500` : "border-gray-100";
  return (
    <Card
      className={`shadow-sm border-2 transition-all cursor-pointer ${active ? `border-${color}-500 bg-${color}-50/30` : `border-gray-100 hover:border-${color}-200`}`}
      onClick={onClick}
      data-testid={testId}
    >
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${active ? `bg-${color}-600 text-white` : `bg-${color}-50 text-${color}-600`}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-gray-900 text-sm truncate">{title}</h3>
            <div className={`w-2 h-2 rounded-full ${enabled ? "bg-green-500" : "bg-gray-300"}`} />
          </div>
          <p className="text-[10px] text-gray-500 truncate">{desc}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ToggleRow({ label, desc, icon, checked, onChange, testId }: {
  label: string; desc: string; icon: React.ReactNode; checked: boolean; onChange: (v: boolean) => void; testId: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
      <div className="flex gap-3">
        <div className="mt-0.5">{icon}</div>
        <div>
          <div className="text-xs font-medium text-gray-900">{label}</div>
          <div className="text-[10px] text-gray-500">{desc}</div>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} data-testid={testId} />
    </div>
  );
}
