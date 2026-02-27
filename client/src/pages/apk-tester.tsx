import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, Loader2, Play, RotateCcw, AlertTriangle, Database, Smartphone, Shield, Upload } from "lucide-react";

interface TestResult {
  step: string;
  status: "pending" | "running" | "pass" | "fail" | "warn";
  message: string;
  details?: string[];
  response?: any;
  duration?: number;
}

interface Exam {
  id: number;
  name: string;
  clientLogo?: string;
}

export default function ApkTester() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [testName] = useState("Test Operator " + Math.floor(Math.random() * 1000));
  const [testPhone] = useState("9" + Math.floor(Math.random() * 900000000 + 100000000));
  const [testAadhaar] = useState(String(Math.floor(Math.random() * 900000000000 + 100000000000)));
  const [createdOperatorId, setCreatedOperatorId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/exams").then(r => r.json()).then(data => {
      if (Array.isArray(data)) setExams(data);
    }).catch(() => {});
  }, []);

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
      return { ok: false, status: res.status, duration, data: null, error: `Server returned HTML page (status ${res.status}). The API route may not be registered. Check server/index.ts imports apk-routes.`, raw: text.substring(0, 300) };
    }

    try {
      const data = JSON.parse(text);
      return { ok: res.ok, status: res.status, duration, data, error: null };
    } catch {
      return { ok: false, status: res.status, duration, data: null, error: `Invalid JSON response: ${text.substring(0, 200)}` };
    }
  };

  const runAllTests = async () => {
    setRunning(true);
    setCreatedOperatorId(null);
    const examId = selectedExamId || "1";

    const steps: TestResult[] = [
      { step: "1. Check Client Logo", status: "pending", message: "Verify exam has logo uploaded" },
      { step: "2. Small Payload Registration", status: "pending", message: "Register with tiny selfie (like curl test)" },
      { step: "3. Large Selfie Upload (50KB)", status: "pending", message: "Simulate real camera selfie through nginx" },
      { step: "4. Large Selfie Upload (500KB)", status: "pending", message: "Simulate high-res selfie — tests nginx body limit" },
      { step: "5. Verify DB Record", status: "pending", message: "Check operator was saved correctly in database" },
      { step: "6. Response Format Check", status: "pending", message: "Verify JSON has all fields APK expects" },
      { step: "7. Re-Registration (Same Aadhaar)", status: "pending", message: "Test re-registration returns existing operator" },
      { step: "8. List Centres", status: "pending", message: `GET /api/apk/centres/${examId}` },
      { step: "9. Select Centre", status: "pending", message: "POST /api/apk/operator/select-centre" },
      { step: "10. Verify Centre Lock", status: "pending", message: "Check operator is locked to centre in DB" },
      { step: "11. Session Check", status: "pending", message: "POST /api/apk/operator/check-session" },
      { step: "12. Heartbeat", status: "pending", message: "POST /api/apk/verification/heartbeat" },
      { step: "13. Get Candidates", status: "pending", message: `GET /api/apk/candidates/${examId}` },
      { step: "14. Force Logout", status: "pending", message: "Test force-logout sets correct flags" },
      { step: "15. Session After Logout", status: "pending", message: "Verify session is terminated" },
      { step: "16. Cleanup", status: "pending", message: "Delete test operator from database" },
    ];
    setResults(steps);

    let opId: number | null = null;
    let centreCode = "";

    // Step 1: Check Client Logo
    updateResult(0, { status: "running" });
    const examInfo = exams.find(e => e.id === Number(examId));
    if (examInfo?.clientLogo) {
      const logoCheck = await fetch(examInfo.clientLogo, { method: "HEAD" });
      if (logoCheck.ok) {
        updateResult(0, { status: "pass", message: `Logo found: ${examInfo.clientLogo}`, details: ["Logo file exists and is accessible", "This logo will be used in the APK build"] });
      } else {
        updateResult(0, { status: "warn", message: `Logo URL set but file not accessible: ${examInfo.clientLogo}`, details: ["Upload a new logo via Exam Settings"] });
      }
    } else {
      updateResult(0, { status: "warn", message: "No client logo uploaded for this exam", details: ["Go to Exam Settings and upload a logo", "APK will use default MPA logo without it"] });
    }

    // Step 2: Small Payload Registration
    updateResult(1, { status: "running" });
    const reg = await apiCall("POST", "/api/apk/operator/register", {
      name: testName, phone: testPhone, aadhaar: testAadhaar,
      selfie: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAA==",
      deviceId: "web-tester-" + Date.now()
    });
    if (reg.data?.success && reg.data?.operator) {
      opId = reg.data.operator.id;
      setCreatedOperatorId(opId);
      updateResult(1, {
        status: "pass",
        message: `Registered with small payload! ID: ${opId}`,
        details: [`Operator ID: ${opId}`, `Payload size: ~100 bytes`, `Response time: ${reg.duration}ms`],
        response: reg.data, duration: reg.duration
      });
    } else {
      updateResult(1, { status: "fail", message: reg.error || reg.data?.message || "Registration failed. Server may return HTML instead of JSON.", details: [reg.raw || "Check if apk-routes.ts is imported in index.ts"], response: reg.data, duration: reg.duration });
      for (let i = 2; i < steps.length; i++) updateResult(i, { status: "fail", message: "Skipped — registration failed" });
      setRunning(false);
      return;
    }

    // Step 3: Large Selfie Upload (50KB) - simulates compressed camera thumbnail
    updateResult(2, { status: "running" });
    const fakeSelfie50k = "A".repeat(50000);
    const reg50k = await apiCall("POST", "/api/apk/operator/register", {
      name: testName, phone: testPhone, aadhaar: testAadhaar,
      selfie: fakeSelfie50k, deviceId: "web-tester-50k"
    });
    if (reg50k.data?.success) {
      updateResult(2, { status: "pass", message: `50KB selfie accepted! (${reg50k.duration}ms)`, details: [`Payload: ~50KB base64`, `This simulates the compressed 120x120 selfie from APK`, `Server accepted it — nginx OK`], duration: reg50k.duration });
    } else {
      const isHtml = reg50k.raw?.startsWith("<") || reg50k.error?.includes("HTML");
      updateResult(2, { status: "fail", message: isHtml ? "Server returned HTML — nginx is blocking the request! Add 'client_max_body_size 50M;' to nginx config" : (reg50k.error || "Failed"), details: isHtml ? ["nginx default limit is 1MB", "Add: client_max_body_size 50M; in the SSL server block", "Then: sudo nginx -t && sudo systemctl reload nginx"] : [], duration: reg50k.duration });
    }

    // Step 4: Large Selfie Upload (500KB) - simulates uncompressed selfie
    updateResult(3, { status: "running" });
    const fakeSelfie500k = "B".repeat(500000);
    const reg500k = await apiCall("POST", "/api/apk/operator/register", {
      name: testName, phone: testPhone, aadhaar: testAadhaar,
      selfie: fakeSelfie500k, deviceId: "web-tester-500k"
    });
    if (reg500k.data?.success) {
      updateResult(3, { status: "pass", message: `500KB selfie accepted! (${reg500k.duration}ms)`, details: [`Payload: ~500KB base64`, `This simulates a larger uncompressed selfie`, `Server + nginx both accept large payloads`], duration: reg500k.duration });
    } else {
      const isHtml = reg500k.raw?.startsWith("<") || reg500k.error?.includes("HTML");
      updateResult(3, { status: "fail", message: isHtml ? "NGINX BLOCKED 500KB request! This is why the APK fails. Fix nginx client_max_body_size" : (reg500k.error || "Failed"), details: isHtml ? ["The real APK selfie is similar size", "Add: client_max_body_size 50M; in nginx SSL server block", "This is the ROOT CAUSE of the APK registration error"] : [], duration: reg500k.duration });
    }

    // Step 5: Verify DB Record
    updateResult(4, { status: "running" });
    const dbCheck = await apiCall("GET", `/api/operators/${opId}`);
    if (dbCheck.ok && dbCheck.data) {
      const op = dbCheck.data;
      const issues: string[] = [];
      if (!op.name) issues.push("name is empty");
      if (!op.phone) issues.push("phone is empty");
      if (!op.aadhaar) issues.push("aadhaar is empty");
      if (!op.selfieUrl) issues.push("selfie was NOT saved to database!");
      if (!op.deviceId) issues.push("deviceId was NOT saved");
      if (op.status !== "Active") issues.push(`status is '${op.status}' instead of 'Active'`);
      if (op.sessionActive !== true) issues.push("sessionActive is not true");
      if (op.forceLogout !== false) issues.push("forceLogout is not false");

      if (issues.length === 0) {
        updateResult(4, { status: "pass", message: "All fields saved correctly in database", details: [
          `Name: ${op.name}`, `Phone: ${op.phone}`, `Aadhaar: ${op.aadhaar}`,
          `Selfie: ${op.selfieUrl ? "Saved (" + op.selfieUrl.length + " chars)" : "MISSING!"}`,
          `Device: ${op.deviceId}`, `Status: ${op.status}`, `Session active: ${op.sessionActive}`,
        ], duration: dbCheck.duration });
      } else {
        updateResult(4, { status: "fail", message: `DB record issues: ${issues.join(", ")}`, details: issues, duration: dbCheck.duration });
      }
    } else {
      updateResult(4, { status: "warn", message: "Could not verify DB record", duration: dbCheck.duration });
    }

    // Step 6: Response Format Check — verify all fields the APK Kotlin code expects
    updateResult(5, { status: "running" });
    const formatIssues: string[] = [];
    if (reg.data.success === undefined) formatIssues.push("Missing 'success' field");
    if (reg.data.operator === undefined) formatIssues.push("Missing 'operator' object");
    if (reg.data.message === undefined) formatIssues.push("Missing 'message' field");
    if (reg.data.alreadyRegistered === undefined) formatIssues.push("CRITICAL: Missing 'alreadyRegistered' — will crash Kotlin Gson/JSONObject!");
    if (reg.data.operator) {
      const op = reg.data.operator;
      if (op.id === undefined) formatIssues.push("operator.id missing");
      if (op.name === undefined) formatIssues.push("operator.name missing");
      if (op.phone === undefined) formatIssues.push("operator.phone missing");
      if (op.aadhaar === undefined) formatIssues.push("operator.aadhaar missing");
      if (!("centreCode" in op)) formatIssues.push("operator.centreCode missing — APK expects this field");
      if (!("examId" in op)) formatIssues.push("operator.examId missing — APK expects this field");
      if (!("examName" in op)) formatIssues.push("operator.examName missing — APK expects this field");
    }
    updateResult(5, {
      status: formatIssues.length === 0 ? "pass" : "fail",
      message: formatIssues.length === 0 ? "All response fields match APK Kotlin data classes" : `${formatIssues.length} field issues found — APK will crash!`,
      details: formatIssues.length === 0 ? [
        "success: Boolean ✓", "operator: Object ✓", "operator.id: Int ✓",
        "operator.name: String ✓", "operator.phone: String ✓", "operator.aadhaar: String ✓",
        "operator.centreCode: String? ✓", "operator.examId: Int? ✓", "operator.examName: String? ✓",
        "message: String? ✓", "alreadyRegistered: Boolean ✓"
      ] : formatIssues,
      response: reg.data
    });

    // Step 7: Re-Registration
    updateResult(6, { status: "running" });
    const reReg = await apiCall("POST", "/api/apk/operator/register", {
      name: testName, phone: testPhone, aadhaar: testAadhaar,
      selfie: "reregtest", deviceId: "web-tester-rereg"
    });
    if (reReg.data?.success) {
      const sameId = reReg.data.operator?.id === opId;
      const hasAlreadyReg = reReg.data.alreadyRegistered !== undefined;
      const issues: string[] = [];
      if (!sameId) issues.push(`Different operator ID returned: ${reReg.data.operator?.id} vs ${opId}`);
      if (!hasAlreadyReg) issues.push("Missing 'alreadyRegistered' field — will crash APK!");
      if (reReg.data.alreadyRegistered !== true) issues.push(`alreadyRegistered should be true, got: ${reReg.data.alreadyRegistered}`);

      updateResult(6, {
        status: issues.length === 0 ? "pass" : "fail",
        message: issues.length === 0 ? `Re-registration correct: same ID (${opId}), alreadyRegistered: true` : `Re-registration broken: ${issues.join("; ")}`,
        details: [`Same ID: ${sameId}`, `alreadyRegistered: ${reReg.data.alreadyRegistered}`, ...issues],
        response: reReg.data, duration: reReg.duration
      });
    } else {
      updateResult(6, { status: "fail", message: reReg.error || "Re-registration failed", response: reReg.data, duration: reReg.duration });
    }

    // Step 8: List Centres
    updateResult(7, { status: "running" });
    const centres = await apiCall("GET", `/api/apk/centres/${examId}`);
    if (centres.ok && Array.isArray(centres.data) && centres.data.length > 0) {
      centreCode = centres.data[0].code;
      updateResult(7, { status: "pass", message: `Found ${centres.data.length} centres. Using: ${centreCode}`, details: centres.data.slice(0, 5).map((c: any) => `${c.code} - ${c.name}`), duration: centres.duration });
    } else if (centres.ok && Array.isArray(centres.data) && centres.data.length === 0) {
      updateResult(7, { status: "fail", message: "No centres found for this exam. Create centres first.", duration: centres.duration });
      for (let i = 8; i <= 12; i++) updateResult(i, { status: "fail", message: "Skipped — no centres" });
      await runForceLogoutTests(opId!, 13, updateResult);
      await cleanupOperator(opId!, 15, updateResult);
      setRunning(false);
      return;
    } else {
      updateResult(7, { status: "fail", message: centres.error || "Failed to list centres", response: centres.data, duration: centres.duration });
    }

    // Step 9: Select Centre
    if (centreCode) {
      updateResult(8, { status: "running" });
      const sel = await apiCall("POST", "/api/apk/operator/select-centre", {
        operatorId: opId, examId: Number(examId), centreCode
      });
      if (sel.data?.success) {
        const details = [
          `Centre: ${sel.data.centreName || centreCode}`,
          `Candidates downloaded: ${sel.data.candidateCount ?? "unknown"}`,
          `Has candidates array: ${Array.isArray(sel.data.candidates) ? `Yes (${sel.data.candidates.length} items)` : "No"}`,
        ];
        updateResult(8, { status: "pass", message: `Locked to ${sel.data.centreName || centreCode}, ${sel.data.candidateCount || 0} candidates`, details, duration: sel.duration });
      } else {
        updateResult(8, { status: "fail", message: sel.error || sel.data?.message || "Failed", response: sel.data, duration: sel.duration });
      }

      // Step 10: Verify Centre Lock in DB
      updateResult(9, { status: "running" });
      const lockCheck = await apiCall("GET", `/api/operators/${opId}`);
      if (lockCheck.ok && lockCheck.data) {
        const op = lockCheck.data;
        const issues: string[] = [];
        if (op.centreCode !== centreCode) issues.push(`centreCode: expected '${centreCode}', got '${op.centreCode}'`);
        if (Number(op.examId) !== Number(examId)) issues.push(`examId: expected ${examId}, got ${op.examId}`);
        updateResult(9, {
          status: issues.length === 0 ? "pass" : "fail",
          message: issues.length === 0 ? `Operator locked to centre ${centreCode}, exam ${examId}` : `Lock issues: ${issues.join("; ")}`,
          details: [`centreCode: ${op.centreCode}`, `examId: ${op.examId}`, `examName: ${op.examName}`, ...issues],
          duration: lockCheck.duration
        });
      } else {
        updateResult(9, { status: "warn", message: "Could not verify centre lock in DB", duration: lockCheck.duration });
      }
    } else {
      updateResult(8, { status: "fail", message: "No centre code available" });
      updateResult(9, { status: "fail", message: "Skipped" });
    }

    // Step 11: Session Check
    updateResult(10, { status: "running" });
    const session = await apiCall("POST", "/api/apk/operator/check-session", { operatorId: opId });
    if (session.data?.success) {
      const issues: string[] = [];
      if (session.data.sessionActive !== true) issues.push("sessionActive should be true");
      if (session.data.forceLogout !== false) issues.push("forceLogout should be false");
      updateResult(10, {
        status: issues.length === 0 ? "pass" : "fail",
        message: issues.length === 0 ? "Session active, no force logout" : `Session issues: ${issues.join("; ")}`,
        details: [`sessionActive: ${session.data.sessionActive}`, `forceLogout: ${session.data.forceLogout}`],
        response: session.data, duration: session.duration
      });
    } else {
      updateResult(10, { status: "fail", message: session.error || "Session check failed", response: session.data, duration: session.duration });
    }

    // Step 12: Heartbeat
    updateResult(11, { status: "running" });
    const hb = await apiCall("POST", "/api/apk/verification/heartbeat", { operatorId: opId, deviceId: "web-tester", battery: 85, gps: null });
    if (hb.data?.success) {
      updateResult(11, {
        status: "pass",
        message: `Heartbeat OK. forceLogout: ${hb.data.forceLogout}`,
        details: [`forceLogout: ${hb.data.forceLogout}`],
        response: hb.data, duration: hb.duration
      });
    } else {
      updateResult(11, { status: "fail", message: hb.error || "Heartbeat failed", response: hb.data, duration: hb.duration });
    }

    // Step 13: Get Candidates
    updateResult(12, { status: "running" });
    const cands = await apiCall("GET", `/api/apk/candidates/${examId}${centreCode ? `?centreCode=${centreCode}` : ""}`);
    if (cands.ok && Array.isArray(cands.data)) {
      const sample = cands.data[0];
      const fieldCheck: string[] = [];
      if (sample) {
        const required = ["id", "exam_id", "roll_no", "name", "centre_code"];
        required.forEach(f => { if (sample[f] === undefined) fieldCheck.push(`Missing field: ${f}`); });
      }
      updateResult(12, {
        status: fieldCheck.length === 0 ? "pass" : "warn",
        message: `${cands.data.length} candidates downloaded${fieldCheck.length ? " (some fields missing)" : ""}`,
        details: [
          `Total: ${cands.data.length}`,
          ...(sample ? [`Sample: ${sample.roll_no} - ${sample.name}`] : ["No candidates found"]),
          ...fieldCheck
        ],
        response: sample || null, duration: cands.duration
      });
    } else {
      updateResult(12, { status: "fail", message: cands.error || "Failed to get candidates", response: cands.data, duration: cands.duration });
    }

    // Step 14-15: Force Logout Tests
    await runForceLogoutTests(opId!, 13, updateResult);

    // Step 16: Cleanup
    await cleanupOperator(opId!, 15, updateResult);

    setRunning(false);
  };

  const runForceLogoutTests = async (opId: number, startIdx: number, update: typeof updateResult) => {
    // Step 11: Force Logout
    update(startIdx, { status: "running" });
    const fl = await apiCall("POST", "/api/apk/operator/force-logout", { operatorId: opId });
    if (fl.data?.success) {
      update(startIdx, { status: "pass", message: "Force logout triggered", response: fl.data, duration: fl.duration });
    } else {
      update(startIdx, { status: "fail", message: fl.error || fl.data?.message || "Force logout failed", response: fl.data, duration: fl.duration });
      return;
    }

    // Step 12: Verify session after logout
    update(startIdx + 1, { status: "running" });
    const check = await apiCall("POST", "/api/apk/operator/check-session", { operatorId: opId });
    if (check.data?.success) {
      const issues: string[] = [];
      if (check.data.forceLogout !== true) issues.push("forceLogout should be true after force-logout");
      if (check.data.sessionActive !== false) issues.push("sessionActive should be false after force-logout");
      update(startIdx + 1, {
        status: issues.length === 0 ? "pass" : "fail",
        message: issues.length === 0 ? "Session correctly terminated after force logout" : `Issues: ${issues.join("; ")}`,
        details: [`forceLogout: ${check.data.forceLogout}`, `sessionActive: ${check.data.sessionActive}`],
        response: check.data, duration: check.duration
      });
    } else {
      update(startIdx + 1, { status: "fail", message: check.error || "Session check failed", response: check.data, duration: check.duration });
    }
  };

  const cleanupOperator = async (opId: number, idx: number, update: typeof updateResult) => {
    update(idx, { status: "running" });
    const del = await apiCall("DELETE", `/api/operators/${opId}`);
    if (del.ok || del.status === 404) {
      update(idx, { status: "pass", message: `Test operator ${opId} cleaned up`, duration: del.duration });
    } else {
      update(idx, { status: "warn", message: `Could not cleanup test operator (${del.status}). Delete manually.`, duration: del.duration });
    }
  };

  const passCount = results.filter(r => r.status === "pass").length;
  const failCount = results.filter(r => r.status === "fail").length;
  const warnCount = results.filter(r => r.status === "warn").length;

  return (
    <div className="p-6 max-w-4xl mx-auto" data-testid="apk-tester-page">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2" data-testid="text-page-title">
          <Smartphone className="h-6 w-6" /> APK Flow Tester
        </h1>
        <p className="text-muted-foreground">
          Comprehensive test of all APK API endpoints. Tests the real flow: Registration → Centre Select → Session → Candidates → Force Logout.
          Verifies database records, response formats, and data integrity.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Shield className="h-5 w-5" /> Test Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="col-span-2">
              <label className="text-sm font-medium mb-1 block">Select Exam</label>
              <Select value={selectedExamId} onValueChange={setSelectedExamId}>
                <SelectTrigger data-testid="select-exam">
                  <SelectValue placeholder="Select an exam..." />
                </SelectTrigger>
                <SelectContent>
                  {exams.map(e => (
                    <SelectItem key={e.id} value={String(e.id)}>
                      {e.name} {e.clientLogo ? "✓ Logo" : "⚠ No Logo"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Test Name</label>
              <Input data-testid="input-test-name" value={testName} disabled className="text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Test Aadhaar</label>
              <Input data-testid="input-test-aadhaar" value={testAadhaar} disabled className="text-sm" />
            </div>
          </div>

          {selectedExamId && exams.find(e => e.id === Number(selectedExamId)) && (
            <div className="mb-4 p-3 bg-muted rounded-lg flex items-center gap-3">
              {exams.find(e => e.id === Number(selectedExamId))?.clientLogo ? (
                <>
                  <img
                    src={exams.find(e => e.id === Number(selectedExamId))?.clientLogo || ""}
                    alt="Client Logo"
                    className="h-10 w-10 object-contain rounded"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <span className="text-sm text-green-600 flex items-center gap-1"><Upload className="h-4 w-4" /> Logo uploaded for this exam</span>
                </>
              ) : (
                <span className="text-sm text-orange-600 flex items-center gap-1"><AlertTriangle className="h-4 w-4" /> No logo uploaded — APK will use default logo</span>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <Button data-testid="button-run-tests" onClick={runAllTests} disabled={running || !selectedExamId} className="gap-2">
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {running ? "Running 13 tests..." : "Run Full Test Suite"}
            </Button>
            <Button data-testid="button-reset" variant="outline" onClick={() => { setResults([]); setCreatedOperatorId(null); }} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <>
          <div className="flex gap-3 mb-4 flex-wrap">
            <Badge variant="default" className="bg-green-600" data-testid="badge-pass-count">{passCount} Passed</Badge>
            {failCount > 0 && <Badge variant="destructive" data-testid="badge-fail-count">{failCount} Failed</Badge>}
            {warnCount > 0 && <Badge variant="secondary" className="bg-orange-500 text-white" data-testid="badge-warn-count">{warnCount} Warnings</Badge>}
            {results.some(r => r.status === "running") && <Badge variant="secondary">Running...</Badge>}
            {!running && failCount === 0 && (
              <Badge variant="default" className="bg-green-700" data-testid="badge-all-pass">
                All tests passed — APK flow is working!
              </Badge>
            )}
          </div>

          <div className="space-y-3">
            {results.map((r, i) => (
              <Card
                key={i}
                className={
                  r.status === "fail" ? "border-red-500 border-l-4" :
                  r.status === "pass" ? "border-green-500 border-l-4" :
                  r.status === "warn" ? "border-orange-500 border-l-4" : ""
                }
                data-testid={`card-test-step-${i}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {r.status === "pass" && <CheckCircle className="h-5 w-5 text-green-500" />}
                      {r.status === "fail" && <XCircle className="h-5 w-5 text-red-500" />}
                      {r.status === "warn" && <AlertTriangle className="h-5 w-5 text-orange-500" />}
                      {r.status === "running" && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
                      {r.status === "pending" && <div className="h-5 w-5 rounded-full border-2 border-gray-300" />}
                      <span className="font-medium">{r.step}</span>
                    </div>
                    {r.duration !== undefined && <span className="text-sm text-muted-foreground">{r.duration}ms</span>}
                  </div>
                  <p className={`text-sm ${r.status === "fail" ? "text-red-600" : r.status === "warn" ? "text-orange-600" : "text-muted-foreground"}`}>
                    {r.message}
                  </p>
                  {r.details && r.details.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {r.details.map((d, di) => (
                        <li key={di} className="text-xs text-muted-foreground flex items-center gap-1">
                          <Database className="h-3 w-3" /> {d}
                        </li>
                      ))}
                    </ul>
                  )}
                  {r.response && (
                    <details className="mt-2">
                      <summary className="text-xs text-muted-foreground cursor-pointer">View JSON Response</summary>
                      <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto max-h-40">
                        {JSON.stringify(r.response, null, 2)}
                      </pre>
                    </details>
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
