import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2, Play, RotateCcw } from "lucide-react";

interface TestResult {
  step: string;
  status: "pending" | "running" | "pass" | "fail";
  message: string;
  response?: any;
  duration?: number;
}

export default function ApkTester() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);
  const [operatorId, setOperatorId] = useState<number | null>(null);
  const [examId, setExamId] = useState("1");
  const [centreCode, setCentreCode] = useState("");
  const [testName, setTestName] = useState("Test Operator");
  const [testPhone, setTestPhone] = useState("9999999999");
  const [testAadhaar, setTestAadhaar] = useState("999999999999");

  const updateResult = (index: number, update: Partial<TestResult>) => {
    setResults(prev => prev.map((r, i) => i === index ? { ...r, ...update } : r));
  };

  const apiCall = async (method: string, url: string, body?: any) => {
    const start = Date.now();
    const opts: RequestInit = {
      method,
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    const text = await res.text();
    const duration = Date.now() - start;

    if (text.trimStart().startsWith("<")) {
      return { ok: false, duration, data: null, error: `Server returned HTML (${res.status}). Route may not exist.`, raw: text.substring(0, 200) };
    }

    try {
      const data = JSON.parse(text);
      return { ok: res.ok, duration, data, error: null };
    } catch {
      return { ok: false, duration, data: null, error: `Invalid JSON: ${text.substring(0, 200)}` };
    }
  };

  const runAllTests = async () => {
    setRunning(true);
    setOperatorId(null);
    const steps: TestResult[] = [
      { step: "1. Operator Registration", status: "pending", message: "POST /api/apk/operator/register" },
      { step: "2. List Centres", status: "pending", message: `GET /api/apk/centres/${examId}` },
      { step: "3. Select Centre", status: "pending", message: "POST /api/apk/operator/select-centre" },
      { step: "4. Check Session", status: "pending", message: "POST /api/apk/operator/check-session" },
      { step: "5. Heartbeat", status: "pending", message: "POST /api/apk/verification/heartbeat" },
      { step: "6. Get Candidates", status: "pending", message: `GET /api/apk/candidates/${examId}` },
    ];
    setResults(steps);

    // Step 1: Register
    updateResult(0, { status: "running" });
    const reg = await apiCall("POST", "/api/apk/operator/register", {
      name: testName, phone: testPhone, aadhaar: testAadhaar,
      selfie: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ==", deviceId: "test-device-web"
    });
    if (reg.data?.success) {
      const opId = reg.data.operator?.id;
      setOperatorId(opId);
      updateResult(0, { status: "pass", message: `Registered! Operator ID: ${opId}, Already registered: ${reg.data.alreadyRegistered}`, response: reg.data, duration: reg.duration });
    } else {
      updateResult(0, { status: "fail", message: reg.error || reg.data?.message || "Registration failed", response: reg.data || reg.raw, duration: reg.duration });
      setRunning(false);
      return;
    }

    // Step 2: List Centres
    updateResult(1, { status: "running" });
    const centres = await apiCall("GET", `/api/apk/centres/${examId}`);
    if (centres.ok && Array.isArray(centres.data) && centres.data.length > 0) {
      const firstCentre = centres.data[0];
      if (!centreCode) setCentreCode(firstCentre.code);
      const code = centreCode || firstCentre.code;
      updateResult(1, { status: "pass", message: `Found ${centres.data.length} centres. First: ${firstCentre.code} - ${firstCentre.name}`, response: centres.data.slice(0, 5), duration: centres.duration });

      // Step 3: Select Centre
      updateResult(2, { status: "running" });
      const sel = await apiCall("POST", "/api/apk/operator/select-centre", {
        operatorId: reg.data.operator.id, examId: Number(examId), centreCode: code
      });
      if (sel.data?.success) {
        updateResult(2, { status: "pass", message: `Locked to ${sel.data.centreName}, ${sel.data.candidateCount} candidates downloaded`, response: { ...sel.data, candidates: `[${sel.data.candidateCount} items]` }, duration: sel.duration });
      } else {
        updateResult(2, { status: "fail", message: sel.error || sel.data?.message || "Failed", response: sel.data, duration: sel.duration });
      }
    } else {
      updateResult(1, { status: "fail", message: centres.error || "No centres found", response: centres.data, duration: centres.duration });
      updateResult(2, { status: "fail", message: "Skipped - no centres" });
    }

    // Step 4: Check Session
    updateResult(3, { status: "running" });
    const session = await apiCall("POST", "/api/apk/operator/check-session", { operatorId: reg.data.operator.id });
    if (session.data?.success) {
      updateResult(3, { status: "pass", message: `Session active: ${session.data.sessionActive}, Force logout: ${session.data.forceLogout}`, response: session.data, duration: session.duration });
    } else {
      updateResult(3, { status: "fail", message: session.error || session.data?.message || "Failed", response: session.data, duration: session.duration });
    }

    // Step 5: Heartbeat
    updateResult(4, { status: "running" });
    const hb = await apiCall("POST", "/api/apk/verification/heartbeat", { operatorId: reg.data.operator.id, deviceId: "test-device-web", battery: 85, gps: null });
    if (hb.data?.success) {
      updateResult(4, { status: "pass", message: `Heartbeat OK. Force logout: ${hb.data.forceLogout}`, response: hb.data, duration: hb.duration });
    } else {
      updateResult(4, { status: "fail", message: hb.error || hb.data?.message || "Failed", response: hb.data, duration: hb.duration });
    }

    // Step 6: Get Candidates
    updateResult(5, { status: "running" });
    const cands = await apiCall("GET", `/api/apk/candidates/${examId}`);
    if (cands.ok && Array.isArray(cands.data)) {
      updateResult(5, { status: "pass", message: `Downloaded ${cands.data.length} candidates`, response: cands.data.slice(0, 3), duration: cands.duration });
    } else {
      updateResult(5, { status: "fail", message: cands.error || "Failed to get candidates", response: cands.data, duration: cands.duration });
    }

    setRunning(false);
  };

  const passCount = results.filter(r => r.status === "pass").length;
  const failCount = results.filter(r => r.status === "fail").length;

  return (
    <div className="p-6 max-w-4xl mx-auto" data-testid="apk-tester-page">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2" data-testid="text-page-title">APK Flow Tester</h1>
        <p className="text-muted-foreground">Test all APK API endpoints from the browser before installing on devices</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Test Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Operator Name</label>
              <Input data-testid="input-test-name" value={testName} onChange={e => setTestName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Phone</label>
              <Input data-testid="input-test-phone" value={testPhone} onChange={e => setTestPhone(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Aadhaar</label>
              <Input data-testid="input-test-aadhaar" value={testAadhaar} onChange={e => setTestAadhaar(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Exam ID</label>
              <Input data-testid="input-exam-id" value={examId} onChange={e => setExamId(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Centre Code (optional)</label>
              <Input data-testid="input-centre-code" value={centreCode} onChange={e => setCentreCode(e.target.value)} placeholder="Auto-select first" />
            </div>
          </div>
          <div className="flex gap-3">
            <Button data-testid="button-run-tests" onClick={runAllTests} disabled={running} className="gap-2">
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {running ? "Running..." : "Run All Tests"}
            </Button>
            <Button data-testid="button-reset" variant="outline" onClick={() => { setResults([]); setOperatorId(null); }} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <>
          <div className="flex gap-3 mb-4">
            <Badge variant="default" className="bg-green-600" data-testid="badge-pass-count">{passCount} Passed</Badge>
            <Badge variant="destructive" data-testid="badge-fail-count">{failCount} Failed</Badge>
            {results.some(r => r.status === "running") && <Badge variant="secondary">Running...</Badge>}
          </div>

          <div className="space-y-3">
            {results.map((r, i) => (
              <Card key={i} className={r.status === "fail" ? "border-red-500" : r.status === "pass" ? "border-green-500" : ""} data-testid={`card-test-step-${i}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {r.status === "pass" && <CheckCircle className="h-5 w-5 text-green-500" />}
                      {r.status === "fail" && <XCircle className="h-5 w-5 text-red-500" />}
                      {r.status === "running" && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
                      {r.status === "pending" && <div className="h-5 w-5 rounded-full border-2 border-gray-300" />}
                      <span className="font-medium">{r.step}</span>
                    </div>
                    {r.duration && <span className="text-sm text-muted-foreground">{r.duration}ms</span>}
                  </div>
                  <p className={`text-sm ${r.status === "fail" ? "text-red-600" : "text-muted-foreground"}`}>{r.message}</p>
                  {r.response && (
                    <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto max-h-40">
                      {JSON.stringify(r.response, null, 2)}
                    </pre>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
