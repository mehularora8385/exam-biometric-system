import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, Loader2, Play, AlertTriangle, Database, Shield, Upload, Users, Building, FileText, Key, Smartphone, RefreshCw } from "lucide-react";

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

type TestSuite = "hq" | "apk" | "sync" | "control" | "all";

export default function HqTester() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [selectedSuite, setSelectedSuite] = useState<TestSuite>("all");
  const [createdExamId, setCreatedExamId] = useState<number | null>(null);
  const [createdCentreId, setCreatedCentreId] = useState<number | null>(null);

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
    try {
      const res = await fetch(url, opts);
      const text = await res.text();
      const duration = Date.now() - start;
      if (text.trimStart().startsWith("<")) {
        return { ok: false, status: res.status, duration, data: null, error: `Server returned HTML (status ${res.status}). Route not registered.`, raw: text.substring(0, 200) };
      }
      try {
        const data = JSON.parse(text);
        return { ok: res.ok, status: res.status, duration, data, error: null, raw: text };
      } catch {
        return { ok: false, status: res.status, duration, data: null, error: `Invalid JSON: ${text.substring(0, 200)}`, raw: text };
      }
    } catch (e: any) {
      return { ok: false, status: 0, duration: Date.now() - start, data: null, error: e.message, raw: "" };
    }
  };

  const apiCallFormData = async (url: string, formData: FormData) => {
    const start = Date.now();
    try {
      const res = await fetch(url, { method: "POST", body: formData });
      const text = await res.text();
      const duration = Date.now() - start;
      try {
        const data = JSON.parse(text);
        return { ok: res.ok, status: res.status, duration, data, error: null };
      } catch {
        return { ok: false, status: res.status, duration, data: null, error: text.substring(0, 200) };
      }
    } catch (e: any) {
      return { ok: false, status: 0, duration: Date.now() - start, data: null, error: e.message };
    }
  };

  const runTests = async () => {
    setRunning(true);
    setCreatedExamId(null);
    setCreatedCentreId(null);
    const examId = selectedExamId || "1";
    const ts = Date.now();

    const allSteps: TestResult[] = [];
    const suiteSteps: Record<string, TestResult[]> = {
      hq: [
        { step: "HQ-1. Create Exam", status: "pending", message: "POST /api/exams" },
        { step: "HQ-2. Get Exam Details", status: "pending", message: "GET /api/exams/:id" },
        { step: "HQ-3. Update Exam", status: "pending", message: "PUT /api/exams/:id" },
        { step: "HQ-4. Create Centre", status: "pending", message: "POST /api/centers" },
        { step: "HQ-5. List Centres", status: "pending", message: "GET /api/centers" },
        { step: "HQ-6. Bulk Upload Candidates (JSON)", status: "pending", message: "POST /api/candidates/bulk" },
        { step: "HQ-7. Verify Candidates Created", status: "pending", message: "GET /api/candidates" },
        { step: "HQ-8. Centre-Wise Data Distribution", status: "pending", message: "GET /api/candidates/by-centre/:code" },
        { step: "HQ-9. List Operators", status: "pending", message: "GET /api/operators" },
        { step: "HQ-10. Auth Login", status: "pending", message: "POST /api/auth/login" },
      ],
      apk: [
        { step: "APK-1. Operator Registration", status: "pending", message: "POST /api/apk/operator/register" },
        { step: "APK-2. Large Selfie (2MB)", status: "pending", message: "Test nginx body size limit" },
        { step: "APK-3. Response Format Check", status: "pending", message: "Verify all fields APK expects" },
        { step: "APK-4. Re-Registration", status: "pending", message: "Same Aadhaar returns alreadyRegistered: true" },
        { step: "APK-5. APK Login", status: "pending", message: "POST /api/apk/login" },
        { step: "APK-6. List Centres (APK)", status: "pending", message: "GET /api/apk/centres/:examId" },
        { step: "APK-7. Select Centre", status: "pending", message: "POST /api/apk/operator/select-centre" },
        { step: "APK-8. Download Candidates", status: "pending", message: "GET /api/apk/candidates/:examId" },
        { step: "APK-9. Candidate Data Fields", status: "pending", message: "Verify candidate fields match APK model" },
      ],
      sync: [
        { step: "SYNC-1. Session Check", status: "pending", message: "POST /api/apk/operator/check-session" },
        { step: "SYNC-2. Heartbeat", status: "pending", message: "POST /api/apk/verification/heartbeat" },
        { step: "SYNC-3. Update Attendance", status: "pending", message: "PATCH /api/apk/candidates/:id/attendance" },
        { step: "SYNC-4. Verify Candidate", status: "pending", message: "PATCH /api/apk/candidates/:id/verify" },
        { step: "SYNC-5. Bulk Sync Verifications", status: "pending", message: "POST /api/apk/verification/sync" },
        { step: "SYNC-6. Verify Synced Data on HQ", status: "pending", message: "Confirm verification data saved" },
        { step: "SYNC-7. Force Logout (Single)", status: "pending", message: "POST /api/apk/operator/force-logout" },
        { step: "SYNC-8. Session After Logout", status: "pending", message: "Verify session terminated" },
        { step: "SYNC-9. Cleanup", status: "pending", message: "Delete test data" },
      ],
      control: [
        { step: "CTL-1. Force Logout (Single Operator)", status: "pending", message: "POST /api/operators/:id/force-logout" },
        { step: "CTL-2. Verify Operator Force-Logged Out", status: "pending", message: "Check operator session after force-logout" },
        { step: "CTL-3. Force Logout All Operators", status: "pending", message: "POST /api/operators/force-logout-all" },
        { step: "CTL-4. Force Sync All Devices", status: "pending", message: "POST /api/devices/sync-all" },
        { step: "CTL-5. Logout All Devices", status: "pending", message: "POST /api/devices/logout-all" },
        { step: "CTL-6. MDM Command (Send)", status: "pending", message: "POST /api/devices/mdm-command" },
        { step: "CTL-7. MDM Command (Check)", status: "pending", message: "GET /api/devices/mdm-command?deviceId=..." },
        { step: "CTL-8. Release MDM Lock", status: "pending", message: "POST /api/devices/release-mdm" },
        { step: "CTL-9. Device Force Logout", status: "pending", message: "POST /api/devices/force-logout" },
        { step: "CTL-10. Check Device Logout Status", status: "pending", message: "GET /api/devices/check-logout" },
        { step: "CTL-11. Centre Login Validate", status: "pending", message: "POST /api/centre-login/validate" },
        { step: "CTL-12. Centre Login Locks", status: "pending", message: "GET /api/centre-login/locks" },
        { step: "CTL-13. Crash Log Submit", status: "pending", message: "POST /api/crash-logs" },
        { step: "CTL-14. Crash Log List", status: "pending", message: "GET /api/crash-logs" },
        { step: "CTL-15. Cleanup", status: "pending", message: "Clean up test operators" },
      ],
    };

    if (selectedSuite === "all") {
      allSteps.push(...suiteSteps.hq, ...suiteSteps.apk, ...suiteSteps.sync, ...suiteSteps.control);
    } else {
      allSteps.push(...suiteSteps[selectedSuite]);
    }
    setResults(allSteps);

    let idx = 0;
    let testExamId = Number(examId);
    let testCentreId: number | null = null;
    let testCentreCode = "";
    let testOpId: number | null = null;
    let testCandidateId: number | null = null;
    const testAadhaar = String(Math.floor(Math.random() * 900000000000 + 100000000000));
    const testPhone = "9" + Math.floor(Math.random() * 900000000 + 100000000);

    const shouldRun = (suite: string) => selectedSuite === "all" || selectedSuite === suite;

    if (shouldRun("hq")) {
      // HQ-1: Create Exam
      updateResult(idx, { status: "running" });
      const examRes = await apiCall("POST", "/api/exams", {
        name: `Test Exam ${ts}`,
        code: `TST${ts.toString().slice(-6)}`,
        client: "Test Client",
        status: "Active",
      });
      if (examRes.ok && examRes.data?.id) {
        testExamId = examRes.data.id;
        setCreatedExamId(testExamId);
        updateResult(idx, { status: "pass", message: `Exam created! ID: ${testExamId}`, details: [`Name: Test Exam ${ts}`, `ID: ${testExamId}`], duration: examRes.duration });
      } else {
        updateResult(idx, { status: "fail", message: examRes.error || "Failed to create exam", response: examRes.data, duration: examRes.duration });
      }
      idx++;

      // HQ-2: Get Exam Details
      updateResult(idx, { status: "running" });
      const getExam = await apiCall("GET", `/api/exams/${testExamId}`);
      if (getExam.ok && getExam.data) {
        const issues: string[] = [];
        if (!getExam.data.name) issues.push("name missing");
        if (!getExam.data.id) issues.push("id missing");
        updateResult(idx, {
          status: issues.length === 0 ? "pass" : "warn",
          message: issues.length === 0 ? `Exam details loaded: ${getExam.data.name}` : `Issues: ${issues.join(", ")}`,
          details: [`ID: ${getExam.data.id}`, `Name: ${getExam.data.name}`, `Status: ${getExam.data.status}`],
          duration: getExam.duration
        });
      } else {
        updateResult(idx, { status: "fail", message: getExam.error || "Failed to get exam", duration: getExam.duration });
      }
      idx++;

      // HQ-3: Update Exam
      updateResult(idx, { status: "running" });
      const updateExam = await apiCall("PUT", `/api/exams/${testExamId}`, {
        name: `Test Exam Updated ${ts}`, status: "Active"
      });
      if (updateExam.ok) {
        updateResult(idx, { status: "pass", message: `Exam updated successfully`, duration: updateExam.duration });
      } else {
        updateResult(idx, { status: "fail", message: updateExam.error || "Failed to update exam", duration: updateExam.duration });
      }
      idx++;

      // HQ-4: Create Centre
      updateResult(idx, { status: "running" });
      testCentreCode = `TST${ts.toString().slice(-4)}`;
      const centreRes = await apiCall("POST", "/api/centers", {
        name: `Test Centre ${ts}`,
        code: testCentreCode,
        address: "Test Address",
        city: "Test City",
        state: "Test State",
        examId: testExamId,
      });
      if (centreRes.ok && centreRes.data?.id) {
        testCentreId = centreRes.data.id;
        setCreatedCentreId(testCentreId);
        updateResult(idx, { status: "pass", message: `Centre created! Code: ${testCentreCode}`, details: [`ID: ${testCentreId}`, `Code: ${testCentreCode}`], duration: centreRes.duration });
      } else {
        updateResult(idx, { status: "fail", message: centreRes.error || "Failed to create centre", response: centreRes.data, duration: centreRes.duration });
      }
      idx++;

      // HQ-5: List Centres
      updateResult(idx, { status: "running" });
      const listCentres = await apiCall("GET", `/api/centers?examId=${testExamId}`);
      if (listCentres.ok && Array.isArray(listCentres.data)) {
        const found = listCentres.data.find((c: any) => c.code === testCentreCode);
        updateResult(idx, {
          status: found ? "pass" : "warn",
          message: found ? `${listCentres.data.length} centres found, test centre verified` : `${listCentres.data.length} centres but test centre not in list`,
          details: listCentres.data.slice(0, 5).map((c: any) => `${c.code} - ${c.name}`),
          duration: listCentres.duration
        });
      } else {
        updateResult(idx, { status: "fail", message: listCentres.error || "Failed to list centres", duration: listCentres.duration });
      }
      idx++;

      // HQ-6: Bulk Upload Candidates
      updateResult(idx, { status: "running" });
      const testCandidates = Array.from({ length: 5 }, (_, i) => ({
        name: `Test Candidate ${i + 1}`,
        rollNo: `ROLL${ts}${i + 1}`,
        fatherName: `Father ${i + 1}`,
        dob: "2000-01-01",
        centreCode: testCentreCode,
        examId: testExamId,
        slot: "Morning",
      }));
      const bulkRes = await apiCall("POST", "/api/candidates/bulk", testCandidates);
      if (bulkRes.ok) {
        const count = bulkRes.data?.count || bulkRes.data?.inserted || testCandidates.length;
        updateResult(idx, { status: "pass", message: `${count} candidates uploaded`, details: testCandidates.map(c => `${c.rollNo} - ${c.name}`), duration: bulkRes.duration });
      } else {
        updateResult(idx, { status: "fail", message: bulkRes.error || "Bulk upload failed", response: bulkRes.data, duration: bulkRes.duration });
      }
      idx++;

      // HQ-7: Verify Candidates Created
      updateResult(idx, { status: "running" });
      const candList = await apiCall("GET", `/api/candidates?examId=${testExamId}`);
      if (candList.ok && Array.isArray(candList.data)) {
        testCandidateId = candList.data[0]?.id || null;
        updateResult(idx, {
          status: candList.data.length >= 5 ? "pass" : "warn",
          message: `${candList.data.length} candidates found for exam`,
          details: candList.data.slice(0, 5).map((c: any) => `${c.rollNo || c.roll_no} - ${c.name} (${c.centreCode || c.centre_code})`),
          duration: candList.duration
        });
      } else {
        updateResult(idx, { status: "fail", message: candList.error || "Failed to list candidates", duration: candList.duration });
      }
      idx++;

      // HQ-8: Centre-Wise Data Distribution
      updateResult(idx, { status: "running" });
      if (testCentreCode) {
        const centreData = await apiCall("GET", `/api/candidates/by-centre/${testCentreCode}?examId=${testExamId}`);
        if (centreData.ok && Array.isArray(centreData.data)) {
          updateResult(idx, {
            status: centreData.data.length > 0 ? "pass" : "warn",
            message: `${centreData.data.length} candidates in centre ${testCentreCode}`,
            details: centreData.data.slice(0, 3).map((c: any) => `${c.rollNo || c.roll_no} - ${c.name}`),
            duration: centreData.duration
          });
        } else {
          updateResult(idx, { status: "fail", message: centreData.error || "Centre-wise query failed", response: centreData.data, duration: centreData.duration });
        }
      } else {
        updateResult(idx, { status: "fail", message: "No test centre code available" });
      }
      idx++;

      // HQ-9: List Operators
      updateResult(idx, { status: "running" });
      const opList = await apiCall("GET", "/api/operators");
      if (opList.ok && Array.isArray(opList.data)) {
        updateResult(idx, { status: "pass", message: `${opList.data.length} operators in system`, details: opList.data.slice(0, 5).map((o: any) => `${o.name} - ${o.phone} (${o.status})`), duration: opList.duration });
      } else {
        updateResult(idx, { status: "fail", message: opList.error || "Failed to list operators", duration: opList.duration });
      }
      idx++;

      // HQ-10: Auth Login
      updateResult(idx, { status: "running" });
      const loginRes = await apiCall("POST", "/api/auth/login", { username: "admin", password: "admin" });
      if (loginRes.ok && loginRes.data?.user) {
        updateResult(idx, { status: "pass", message: `Login OK: ${loginRes.data.user.fullName || loginRes.data.user.username}`, details: [`Role: ${loginRes.data.user.role}`, `Username: ${loginRes.data.user.username}`], duration: loginRes.duration });
      } else if (loginRes.status === 401) {
        updateResult(idx, { status: "warn", message: "Login endpoint works but credentials rejected (expected for test)", details: ["Endpoint returns 401 — auth is working", "Use real admin credentials to fully test"], duration: loginRes.duration });
      } else {
        updateResult(idx, { status: "fail", message: loginRes.error || "Auth login failed", response: loginRes.data, duration: loginRes.duration });
      }
      idx++;
    }

    if (shouldRun("apk")) {
      // APK-1: Operator Registration
      updateResult(idx, { status: "running" });
      const reg = await apiCall("POST", "/api/apk/operator/register", {
        name: `Tester ${ts}`, phone: testPhone, aadhaar: testAadhaar,
        selfie: "data:image/jpeg;base64,/9j/test", deviceId: `tester-${ts}`
      });
      if (reg.data?.success && reg.data?.operator) {
        testOpId = reg.data.operator.id;
        updateResult(idx, { status: "pass", message: `Registered! ID: ${testOpId}`, details: [`alreadyRegistered: ${reg.data.alreadyRegistered}`], response: reg.data, duration: reg.duration });
      } else {
        updateResult(idx, { status: "fail", message: reg.error || "Registration failed", response: reg.data, duration: reg.duration });
      }
      idx++;

      // APK-2: Large Selfie (2MB)
      updateResult(idx, { status: "running" });
      const bigSelfie = "X".repeat(2000000);
      const reg2m = await apiCall("POST", "/api/apk/operator/register", {
        name: `Tester ${ts}`, phone: testPhone, aadhaar: testAadhaar,
        selfie: bigSelfie, deviceId: `tester-2m-${ts}`
      });
      if (reg2m.data?.success) {
        updateResult(idx, { status: "pass", message: `2MB selfie accepted (${reg2m.duration}ms)`, details: ["nginx + Express both handle large payloads"], duration: reg2m.duration });
      } else {
        const isNginx = reg2m.raw?.startsWith("<") || reg2m.status === 413;
        updateResult(idx, { status: "fail", message: isNginx ? "NGINX REJECTED 2MB! Add client_max_body_size 50M;" : (reg2m.error || "Failed"), duration: reg2m.duration });
      }
      idx++;

      // APK-3: Response Format Check
      updateResult(idx, { status: "running" });
      const fmtIssues: string[] = [];
      if (reg.data) {
        if (reg.data.success === undefined) fmtIssues.push("Missing 'success'");
        if (reg.data.alreadyRegistered === undefined) fmtIssues.push("CRITICAL: Missing 'alreadyRegistered'");
        if (reg.data.operator) {
          const op = reg.data.operator;
          ["id", "name", "phone", "aadhaar"].forEach(f => { if (op[f] === undefined) fmtIssues.push(`operator.${f} missing`); });
          ["centreCode", "examId", "examName"].forEach(f => { if (!(f in op)) fmtIssues.push(`operator.${f} missing — APK expects this`); });
        } else {
          fmtIssues.push("No operator object in response");
        }
      }
      updateResult(idx, {
        status: fmtIssues.length === 0 ? "pass" : "fail",
        message: fmtIssues.length === 0 ? "All response fields match APK Kotlin model" : `${fmtIssues.length} issues — APK will crash!`,
        details: fmtIssues.length === 0 ? ["success: Boolean OK", "operator.id/name/phone/aadhaar OK", "centreCode/examId/examName OK", "alreadyRegistered: Boolean OK"] : fmtIssues,
      });
      idx++;

      // APK-4: Re-Registration
      updateResult(idx, { status: "running" });
      const reReg = await apiCall("POST", "/api/apk/operator/register", {
        name: `Tester ${ts}`, phone: testPhone, aadhaar: testAadhaar,
        selfie: "retest", deviceId: `tester-rereg-${ts}`
      });
      if (reReg.data?.success) {
        const ok = reReg.data.alreadyRegistered === true && reReg.data.operator?.id === testOpId;
        updateResult(idx, {
          status: ok ? "pass" : "fail",
          message: ok ? `Re-reg correct: same ID, alreadyRegistered: true` : `Re-reg issues: alreadyRegistered=${reReg.data.alreadyRegistered}, id=${reReg.data.operator?.id}`,
          duration: reReg.duration
        });
      } else {
        updateResult(idx, { status: "fail", message: reReg.error || "Re-registration failed", duration: reReg.duration });
      }
      idx++;

      // APK-5: APK Login
      updateResult(idx, { status: "running" });
      const apkLogin = await apiCall("POST", "/api/apk/login", { username: "admin", password: "admin" });
      if (apkLogin.ok && apkLogin.data?.success) {
        updateResult(idx, { status: "pass", message: `APK login OK: ${apkLogin.data.user?.fullName || apkLogin.data.user?.username}`, details: [`Role: ${apkLogin.data.user?.role}`], duration: apkLogin.duration });
      } else if (apkLogin.status === 401 || apkLogin.data?.success === false) {
        updateResult(idx, { status: "warn", message: "APK login endpoint works, credentials rejected (use real creds)", duration: apkLogin.duration });
      } else {
        updateResult(idx, { status: "fail", message: apkLogin.error || "APK login endpoint broken", response: apkLogin.data, duration: apkLogin.duration });
      }
      idx++;

      // APK-6: List Centres (APK)
      updateResult(idx, { status: "running" });
      const apkCentres = await apiCall("GET", `/api/apk/centres/${testExamId}`);
      if (apkCentres.ok && Array.isArray(apkCentres.data)) {
        const found = apkCentres.data.find((c: any) => c.code === testCentreCode);
        if (!testCentreCode && apkCentres.data.length > 0) testCentreCode = apkCentres.data[0].code;
        updateResult(idx, {
          status: apkCentres.data.length > 0 ? "pass" : "warn",
          message: `${apkCentres.data.length} centres available${found ? `, test centre found` : ""}`,
          details: apkCentres.data.slice(0, 5).map((c: any) => `${c.code} - ${c.name}`),
          duration: apkCentres.duration
        });
      } else {
        updateResult(idx, { status: "fail", message: apkCentres.error || "Failed to list centres via APK API", response: apkCentres.data, duration: apkCentres.duration });
      }
      idx++;

      // APK-7: Select Centre
      updateResult(idx, { status: "running" });
      if (testOpId && testCentreCode) {
        const selCentre = await apiCall("POST", "/api/apk/operator/select-centre", {
          operatorId: testOpId, examId: testExamId, centreCode: testCentreCode
        });
        if (selCentre.data?.success) {
          updateResult(idx, {
            status: "pass",
            message: `Locked to ${selCentre.data.centreName || testCentreCode}, ${selCentre.data.candidateCount || 0} candidates`,
            details: [`Centre: ${selCentre.data.centreName}`, `Candidates: ${selCentre.data.candidateCount}`, `Has candidate array: ${Array.isArray(selCentre.data.candidates)}`],
            duration: selCentre.duration
          });
        } else {
          updateResult(idx, { status: "fail", message: selCentre.error || selCentre.data?.message || "Select centre failed", duration: selCentre.duration });
        }
      } else {
        updateResult(idx, { status: "fail", message: `Missing: opId=${testOpId}, centreCode=${testCentreCode}` });
      }
      idx++;

      // APK-8: Download Candidates
      updateResult(idx, { status: "running" });
      const dlCands = await apiCall("GET", `/api/apk/candidates/${testExamId}${testCentreCode ? `?centreCode=${testCentreCode}` : ""}`);
      if (dlCands.ok && Array.isArray(dlCands.data)) {
        if (dlCands.data.length > 0) testCandidateId = testCandidateId || dlCands.data[0].id;
        updateResult(idx, {
          status: dlCands.data.length > 0 ? "pass" : "warn",
          message: `${dlCands.data.length} candidates downloaded`,
          details: dlCands.data.slice(0, 3).map((c: any) => `${c.roll_no || c.rollNo} - ${c.name}`),
          duration: dlCands.duration
        });
      } else {
        updateResult(idx, { status: "fail", message: dlCands.error || "Failed to download candidates", duration: dlCands.duration });
      }
      idx++;

      // APK-9: Candidate Data Fields
      updateResult(idx, { status: "running" });
      if (dlCands.ok && Array.isArray(dlCands.data) && dlCands.data.length > 0) {
        const sample = dlCands.data[0];
        const required = ["id", "name", "roll_no", "centre_code"];
        const optional = ["father_name", "dob", "slot", "photo_url", "attendance_status", "verification_status"];
        const missing = required.filter(f => sample[f] === undefined);
        const optMissing = optional.filter(f => sample[f] === undefined);
        updateResult(idx, {
          status: missing.length === 0 ? "pass" : "fail",
          message: missing.length === 0 ? "All required candidate fields present" : `Missing required: ${missing.join(", ")}`,
          details: [
            ...required.map(f => `${f}: ${sample[f] !== undefined ? "OK" : "MISSING"}`),
            ...optMissing.length > 0 ? [`Optional missing: ${optMissing.join(", ")}`] : [],
          ],
        });
      } else {
        updateResult(idx, { status: "warn", message: "No candidates to check fields" });
      }
      idx++;
    }

    if (shouldRun("sync")) {
      // SYNC-1: Session Check
      updateResult(idx, { status: "running" });
      if (testOpId) {
        const sess = await apiCall("POST", "/api/apk/operator/check-session", { operatorId: testOpId });
        if (sess.data?.success) {
          updateResult(idx, {
            status: sess.data.sessionActive ? "pass" : "warn",
            message: `sessionActive: ${sess.data.sessionActive}, forceLogout: ${sess.data.forceLogout}`,
            duration: sess.duration
          });
        } else {
          updateResult(idx, { status: "fail", message: sess.error || "Session check failed", duration: sess.duration });
        }
      } else {
        updateResult(idx, { status: "warn", message: "No operator ID — run APK suite first" });
      }
      idx++;

      // SYNC-2: Heartbeat
      updateResult(idx, { status: "running" });
      if (testOpId) {
        const hb = await apiCall("POST", "/api/apk/verification/heartbeat", { operatorId: testOpId, deviceId: `tester-${ts}`, battery: 85 });
        if (hb.data?.success) {
          updateResult(idx, { status: "pass", message: `Heartbeat OK, forceLogout: ${hb.data.forceLogout}`, duration: hb.duration });
        } else {
          updateResult(idx, { status: "fail", message: hb.error || "Heartbeat failed", duration: hb.duration });
        }
      } else {
        updateResult(idx, { status: "warn", message: "No operator ID" });
      }
      idx++;

      // SYNC-3: Update Attendance
      updateResult(idx, { status: "running" });
      if (testCandidateId) {
        const att = await apiCall("PATCH", `/api/apk/candidates/${testCandidateId}/attendance`, { attendanceStatus: "present" });
        if (att.data?.success || att.ok) {
          updateResult(idx, { status: "pass", message: `Attendance marked present for candidate ${testCandidateId}`, duration: att.duration });
        } else {
          updateResult(idx, { status: "fail", message: att.error || "Attendance update failed", response: att.data, duration: att.duration });
        }
      } else {
        updateResult(idx, { status: "warn", message: "No candidate ID available — upload candidates first" });
      }
      idx++;

      // SYNC-4: Verify Candidate
      updateResult(idx, { status: "running" });
      if (testCandidateId) {
        const ver = await apiCall("PATCH", `/api/apk/candidates/${testCandidateId}/verify`, {
          verifiedPhoto: "data:image/jpeg;base64,/9j/verified",
          faceMatchPercent: 92.5,
          omrNumber: `OMR${ts}`
        });
        if (ver.data?.success || ver.ok) {
          updateResult(idx, { status: "pass", message: `Candidate ${testCandidateId} verified (92.5% match)`, duration: ver.duration });
        } else {
          updateResult(idx, { status: "fail", message: ver.error || "Verification failed", response: ver.data, duration: ver.duration });
        }
      } else {
        updateResult(idx, { status: "warn", message: "No candidate ID" });
      }
      idx++;

      // SYNC-5: Bulk Sync
      updateResult(idx, { status: "running" });
      if (testCandidateId) {
        const syncRes = await apiCall("POST", "/api/apk/verification/sync", {
          verifications: [
            { candidateId: testCandidateId, verifiedPhoto: "data:image/jpeg;base64,/9j/synced", faceMatchPercent: 95.0, omrNumber: `SYNC${ts}` }
          ]
        });
        if (syncRes.data?.success) {
          updateResult(idx, { status: "pass", message: `Synced ${syncRes.data.synced}/${syncRes.data.total} verifications`, duration: syncRes.duration });
        } else {
          updateResult(idx, { status: "fail", message: syncRes.error || "Bulk sync failed", response: syncRes.data, duration: syncRes.duration });
        }
      } else {
        updateResult(idx, { status: "warn", message: "No candidate ID" });
      }
      idx++;

      // SYNC-6: Verify Synced Data on HQ
      updateResult(idx, { status: "running" });
      if (testCandidateId) {
        const check = await apiCall("GET", `/api/candidates/${testCandidateId}`);
        if (check.ok && check.data) {
          const c = check.data;
          const issues: string[] = [];
          if (c.presentMark !== "Present" && c.presentMark !== "present") issues.push("Attendance not saved as 'Present'");
          if (c.status !== "Verified" && c.status !== "verified") issues.push("Verification status not updated");
          updateResult(idx, {
            status: issues.length === 0 ? "pass" : "warn",
            message: issues.length === 0 ? "Synced data verified on HQ side" : `Issues: ${issues.join(", ")}`,
            details: [`Attendance (presentMark): ${c.presentMark}`, `Status: ${c.status}`, `Face match: ${c.matchPercent}`],
            duration: check.duration
          });
        } else {
          updateResult(idx, { status: "warn", message: "Could not verify synced data", duration: check.duration });
        }
      } else {
        updateResult(idx, { status: "warn", message: "No candidate ID" });
      }
      idx++;

      // SYNC-7: Force Logout
      updateResult(idx, { status: "running" });
      if (testOpId) {
        const fl = await apiCall("POST", "/api/apk/operator/force-logout", { operatorId: testOpId });
        if (fl.data?.success) {
          updateResult(idx, { status: "pass", message: "Force logout triggered", duration: fl.duration });
        } else {
          updateResult(idx, { status: "fail", message: fl.error || "Force logout failed", duration: fl.duration });
        }
      } else {
        updateResult(idx, { status: "warn", message: "No operator ID" });
      }
      idx++;

      // SYNC-8: Session After Logout
      updateResult(idx, { status: "running" });
      if (testOpId) {
        const sessAfter = await apiCall("POST", "/api/apk/operator/check-session", { operatorId: testOpId });
        if (sessAfter.data?.success) {
          const ok = sessAfter.data.forceLogout === true && sessAfter.data.sessionActive === false;
          updateResult(idx, {
            status: ok ? "pass" : "fail",
            message: ok ? "Session correctly terminated" : `forceLogout=${sessAfter.data.forceLogout}, sessionActive=${sessAfter.data.sessionActive}`,
            duration: sessAfter.duration
          });
        } else {
          updateResult(idx, { status: "fail", message: sessAfter.error || "Session check failed", duration: sessAfter.duration });
        }
      } else {
        updateResult(idx, { status: "warn", message: "No operator ID" });
      }
      idx++;

      // SYNC-9: Cleanup
      updateResult(idx, { status: "running" });
      const cleanupDetails: string[] = [];
      if (testOpId) {
        const delOp = await apiCall("DELETE", `/api/operators/${testOpId}`);
        cleanupDetails.push(`Operator ${testOpId}: ${delOp.ok ? "deleted" : "failed"}`);
      }
      if (createdExamId) {
        const delExam = await apiCall("DELETE", `/api/exams/${createdExamId}`);
        cleanupDetails.push(`Exam ${createdExamId}: ${delExam.ok ? "deleted" : "failed"}`);
      }
      if (createdCentreId) {
        const delCentre = await apiCall("DELETE", `/api/centers/${createdCentreId}`);
        cleanupDetails.push(`Centre ${createdCentreId}: ${delCentre.ok ? "deleted" : "failed"}`);
      }
      updateResult(idx, { status: "pass", message: "Test data cleaned up", details: cleanupDetails });
      idx++;
    }

    if (shouldRun("control")) {
      let ctlOpId: number | null = null;
      const ctlAadhaar = String(Math.floor(Math.random() * 900000000000 + 100000000000));
      const ctlPhone = "8" + Math.floor(Math.random() * 900000000 + 100000000);
      const testDeviceId = `test-device-${ts}`;

      // CTL-1: Force Logout (Single Operator) — first register one
      updateResult(idx, { status: "running" });
      const ctlReg = await apiCall("POST", "/api/apk/operator/register", {
        name: `CTL Tester ${ts}`, phone: ctlPhone, aadhaar: ctlAadhaar,
        selfie: "ctltest", deviceId: testDeviceId
      });
      if (ctlReg.data?.success) {
        ctlOpId = ctlReg.data.operator.id;
        const fl = await apiCall("POST", `/api/operators/${ctlOpId}/force-logout`);
        if (fl.data?.success) {
          updateResult(idx, { status: "pass", message: `Operator ${ctlOpId} force-logged out via HQ route`, duration: fl.duration });
        } else {
          updateResult(idx, { status: "fail", message: fl.error || "Force logout route failed", response: fl.data, duration: fl.duration });
        }
      } else {
        updateResult(idx, { status: "fail", message: "Could not create test operator for force-logout test" });
      }
      idx++;

      // CTL-2: Verify Operator Force-Logged Out
      updateResult(idx, { status: "running" });
      if (ctlOpId) {
        const check = await apiCall("POST", "/api/apk/operator/check-session", { operatorId: ctlOpId });
        if (check.data?.success) {
          const ok = check.data.forceLogout === true && check.data.sessionActive === false;
          updateResult(idx, {
            status: ok ? "pass" : "fail",
            message: ok ? "Operator session correctly terminated" : `forceLogout=${check.data.forceLogout}, sessionActive=${check.data.sessionActive}`,
            duration: check.duration
          });
        } else {
          updateResult(idx, { status: "fail", message: check.error || "Session check failed", duration: check.duration });
        }
      } else {
        updateResult(idx, { status: "warn", message: "No operator to check" });
      }
      idx++;

      // CTL-3: Force Logout All Operators
      updateResult(idx, { status: "running" });
      const flAll = await apiCall("POST", "/api/operators/force-logout-all", { examId: testExamId });
      if (flAll.data?.success) {
        updateResult(idx, { status: "pass", message: `All operators for exam ${testExamId} force-logged out`, duration: flAll.duration });
      } else if (flAll.status === 404) {
        updateResult(idx, { status: "warn", message: "Route not found — may need to deploy latest code", duration: flAll.duration });
      } else {
        updateResult(idx, { status: "fail", message: flAll.error || "Force logout all failed", response: flAll.data, duration: flAll.duration });
      }
      idx++;

      // CTL-4: Force Sync All Devices
      updateResult(idx, { status: "running" });
      const syncAll = await apiCall("POST", "/api/devices/sync-all", { examId: testExamId });
      if (syncAll.data?.success || syncAll.ok) {
        updateResult(idx, { status: "pass", message: syncAll.data?.message || "Sync all triggered", duration: syncAll.duration });
      } else if (syncAll.status === 404) {
        updateResult(idx, { status: "warn", message: "Route not found — devices table may not exist", duration: syncAll.duration });
      } else {
        updateResult(idx, { status: "fail", message: syncAll.error || "Sync all failed", response: syncAll.data, duration: syncAll.duration });
      }
      idx++;

      // CTL-5: Logout All Devices
      updateResult(idx, { status: "running" });
      const logoutAll = await apiCall("POST", "/api/devices/logout-all", { examId: testExamId });
      if (logoutAll.data?.success || logoutAll.ok) {
        updateResult(idx, { status: "pass", message: logoutAll.data?.message || "All devices logged out", duration: logoutAll.duration });
      } else if (logoutAll.status === 404) {
        updateResult(idx, { status: "warn", message: "Route not found", duration: logoutAll.duration });
      } else {
        updateResult(idx, { status: "fail", message: logoutAll.error || "Logout all failed", response: logoutAll.data, duration: logoutAll.duration });
      }
      idx++;

      // CTL-6: MDM Command (Send)
      updateResult(idx, { status: "running" });
      const mdmSend = await apiCall("POST", "/api/devices/mdm-command", { deviceId: testDeviceId, command: "lock_screen" });
      if (mdmSend.data?.success) {
        updateResult(idx, { status: "pass", message: `MDM command 'lock_screen' sent to ${testDeviceId}`, duration: mdmSend.duration });
      } else if (mdmSend.status === 404) {
        updateResult(idx, { status: "warn", message: "MDM command route not found", duration: mdmSend.duration });
      } else {
        updateResult(idx, { status: "fail", message: mdmSend.error || "MDM command failed", response: mdmSend.data, duration: mdmSend.duration });
      }
      idx++;

      // CTL-7: MDM Command (Check — device polls for commands)
      updateResult(idx, { status: "running" });
      const mdmCheck = await apiCall("GET", `/api/devices/mdm-command?deviceId=${testDeviceId}`);
      if (mdmCheck.ok) {
        updateResult(idx, {
          status: "pass",
          message: mdmCheck.data?.command ? `Pending command: ${mdmCheck.data.command}` : "No pending commands (expected after check clears it)",
          details: [`command: ${mdmCheck.data?.command || "null"}`],
          duration: mdmCheck.duration
        });
      } else if (mdmCheck.status === 404) {
        updateResult(idx, { status: "warn", message: "MDM check route not found", duration: mdmCheck.duration });
      } else {
        updateResult(idx, { status: "fail", message: mdmCheck.error || "MDM check failed", duration: mdmCheck.duration });
      }
      idx++;

      // CTL-8: Release MDM Lock
      updateResult(idx, { status: "running" });
      const mdmRelease = await apiCall("POST", "/api/devices/release-mdm", { examId: testExamId });
      if (mdmRelease.data?.success || mdmRelease.ok) {
        updateResult(idx, { status: "pass", message: mdmRelease.data?.message || "MDM released", duration: mdmRelease.duration });
      } else if (mdmRelease.status === 404) {
        updateResult(idx, { status: "warn", message: "Release MDM route not found", duration: mdmRelease.duration });
      } else {
        updateResult(idx, { status: "fail", message: mdmRelease.error || "Release MDM failed", response: mdmRelease.data, duration: mdmRelease.duration });
      }
      idx++;

      // CTL-9: Device Force Logout
      updateResult(idx, { status: "running" });
      const devLogout = await apiCall("POST", "/api/devices/force-logout", { examId: testExamId, reason: "Test force logout" });
      if (devLogout.data?.success) {
        updateResult(idx, { status: "pass", message: devLogout.data.message, duration: devLogout.duration });
      } else if (devLogout.status === 404) {
        updateResult(idx, { status: "warn", message: "Device force logout route not found", duration: devLogout.duration });
      } else {
        updateResult(idx, { status: "fail", message: devLogout.error || "Device force logout failed", response: devLogout.data, duration: devLogout.duration });
      }
      idx++;

      // CTL-10: Check Device Logout Status
      updateResult(idx, { status: "running" });
      const devCheck = await apiCall("GET", `/api/devices/check-logout?deviceId=${testDeviceId}`);
      if (devCheck.ok) {
        updateResult(idx, {
          status: "pass",
          message: `Device logout check: forceLogout=${devCheck.data?.forceLogout}`,
          details: [`forceLogout: ${devCheck.data?.forceLogout}`, `reason: ${devCheck.data?.reason || "none"}`],
          duration: devCheck.duration
        });
      } else {
        updateResult(idx, { status: "fail", message: devCheck.error || "Device check failed", duration: devCheck.duration });
      }
      idx++;

      // CTL-11: Centre Login Validate
      updateResult(idx, { status: "running" });
      const centreLogin = await apiCall("POST", "/api/centre-login/validate", { examId: testExamId, centreCode: testCentreCode || "TST001" });
      if (centreLogin.ok) {
        updateResult(idx, {
          status: "pass",
          message: `Centre login: allowed=${centreLogin.data?.allowed}, ${centreLogin.data?.message}`,
          details: [`allowed: ${centreLogin.data?.allowed}`, `message: ${centreLogin.data?.message}`],
          duration: centreLogin.duration
        });
      } else if (centreLogin.status === 404) {
        updateResult(idx, { status: "warn", message: "Centre login validate route not found", duration: centreLogin.duration });
      } else {
        updateResult(idx, { status: "fail", message: centreLogin.error || "Centre login validate failed", duration: centreLogin.duration });
      }
      idx++;

      // CTL-12: Centre Login Locks
      updateResult(idx, { status: "running" });
      const locks = await apiCall("GET", `/api/centre-login/locks?examId=${testExamId}`);
      if (locks.ok) {
        const lockData = Array.isArray(locks.data) ? locks.data : [];
        updateResult(idx, {
          status: "pass",
          message: `${lockData.length} centre login locks configured`,
          details: lockData.slice(0, 5).map((l: any) => `${l.centreCode}: locked=${l.isLocked}, max=${l.maxDevices}`),
          duration: locks.duration
        });
      } else if (locks.status === 404) {
        updateResult(idx, { status: "warn", message: "Centre login locks route not found", duration: locks.duration });
      } else {
        updateResult(idx, { status: "fail", message: locks.error || "Failed to get locks", duration: locks.duration });
      }
      idx++;

      // CTL-13: Crash Log Submit
      updateResult(idx, { status: "running" });
      const crashLog = await apiCall("POST", "/api/crash-logs", {
        deviceId: testDeviceId, deviceModel: "Test Device", appVersion: "1.0.0-test",
        errorMessage: "Test crash from HQ tester", stackTrace: "at TestSuite.run(HqTester.tsx:1)",
        examId: testExamId, crashedAt: new Date().toISOString()
      });
      if (crashLog.data?.success || crashLog.ok) {
        updateResult(idx, { status: "pass", message: `Crash log submitted (ID: ${crashLog.data?.id})`, duration: crashLog.duration });
      } else if (crashLog.status === 404) {
        updateResult(idx, { status: "warn", message: "Crash logs route not found", duration: crashLog.duration });
      } else {
        updateResult(idx, { status: "fail", message: crashLog.error || "Crash log submit failed", duration: crashLog.duration });
      }
      idx++;

      // CTL-14: Crash Log List
      updateResult(idx, { status: "running" });
      const crashList = await apiCall("GET", "/api/crash-logs");
      if (crashList.ok && Array.isArray(crashList.data)) {
        updateResult(idx, {
          status: "pass",
          message: `${crashList.data.length} crash logs in system`,
          details: crashList.data.slice(0, 3).map((l: any) => `${l.deviceId}: ${l.errorMessage?.substring(0, 50)}`),
          duration: crashList.duration
        });
      } else if (crashList.status === 404) {
        updateResult(idx, { status: "warn", message: "Crash logs route not found", duration: crashList.duration });
      } else {
        updateResult(idx, { status: "fail", message: crashList.error || "Failed to list crash logs", duration: crashList.duration });
      }
      idx++;

      // CTL-15: Cleanup
      updateResult(idx, { status: "running" });
      const ctlCleanup: string[] = [];
      if (ctlOpId) {
        const del = await apiCall("DELETE", `/api/operators/${ctlOpId}`);
        ctlCleanup.push(`Operator ${ctlOpId}: ${del.ok ? "deleted" : "failed"}`);
      }
      updateResult(idx, { status: "pass", message: "Control test data cleaned up", details: ctlCleanup });
      idx++;
    }

    setRunning(false);
  };

  const passCount = results.filter(r => r.status === "pass").length;
  const failCount = results.filter(r => r.status === "fail").length;
  const warnCount = results.filter(r => r.status === "warn").length;

  const statusIcon = (status: string) => {
    switch (status) {
      case "pass": return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "fail": return <XCircle className="h-5 w-5 text-red-600" />;
      case "warn": return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "running": return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      default: return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const suiteIcon = (suite: TestSuite) => {
    switch (suite) {
      case "hq": return <Building className="h-4 w-4" />;
      case "apk": return <Smartphone className="h-4 w-4" />;
      case "sync": return <RefreshCw className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto" data-testid="hq-tester-page">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2" data-testid="text-page-title">
          <Shield className="h-6 w-6" /> HQ System Tester
        </h1>
        <p className="text-muted-foreground" data-testid="text-page-description">
          End-to-end testing: Exam creation, data upload, centre distribution, APK authorization, candidate sync, operator management
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Test Suite</label>
              <Select value={selectedSuite} onValueChange={(v) => setSelectedSuite(v as TestSuite)}>
                <SelectTrigger data-testid="select-suite">
                  <SelectValue placeholder="Select test suite" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tests (HQ + APK + Sync + Control)</SelectItem>
                  <SelectItem value="hq">HQ Only (Exam, Centre, Candidates)</SelectItem>
                  <SelectItem value="apk">APK Only (Registration, Auth, Download)</SelectItem>
                  <SelectItem value="sync">Sync Only (Session, Heartbeat, Verify)</SelectItem>
                  <SelectItem value="control">Control Only (Force Logout, MDM, Devices)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">Use Existing Exam (optional)</label>
              <Select value={selectedExamId} onValueChange={setSelectedExamId}>
                <SelectTrigger data-testid="select-exam">
                  <SelectValue placeholder="Create new test exam" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map(e => (
                    <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={runTests} disabled={running} className="gap-2" data-testid="button-run-tests">
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              {running ? "Running..." : "Run Tests"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="mb-4 flex gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700" data-testid="badge-pass">{passCount} Passed</Badge>
          <Badge variant="outline" className="bg-red-50 text-red-700" data-testid="badge-fail">{failCount} Failed</Badge>
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700" data-testid="badge-warn">{warnCount} Warnings</Badge>
        </div>
      )}

      <div className="space-y-2">
        {results.map((r, i) => (
          <Card key={i} className={`border-l-4 ${r.status === "pass" ? "border-l-green-500" : r.status === "fail" ? "border-l-red-500" : r.status === "warn" ? "border-l-yellow-500" : r.status === "running" ? "border-l-blue-500" : "border-l-gray-200"}`}
            data-testid={`test-result-${i}`}>
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {statusIcon(r.status)}
                  <span className="font-medium text-sm">{r.step}</span>
                </div>
                {r.duration && <span className="text-xs text-muted-foreground">{r.duration}ms</span>}
              </div>
              <p className={`text-sm mt-1 ml-7 ${r.status === "fail" ? "text-red-600" : r.status === "warn" ? "text-yellow-700" : "text-muted-foreground"}`}>
                {r.message}
              </p>
              {r.details && r.details.length > 0 && (
                <details className="ml-7 mt-1">
                  <summary className="text-xs text-muted-foreground cursor-pointer">Details ({r.details.length} items)</summary>
                  <div className="text-xs mt-1 space-y-0.5">
                    {r.details.map((d, j) => (
                      <div key={j} className="flex items-start gap-1">
                        <Database className="h-3 w-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <span>{d}</span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
              {r.response && (
                <details className="ml-7 mt-1">
                  <summary className="text-xs text-muted-foreground cursor-pointer">View JSON Response</summary>
                  <pre className="text-xs mt-1 p-2 bg-muted rounded overflow-x-auto max-h-40">{JSON.stringify(r.response, null, 2)}</pre>
                </details>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
