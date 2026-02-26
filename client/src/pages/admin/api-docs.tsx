import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  BookOpen, Copy, Download, Server, Shield, Smartphone,
  Fingerprint, Camera, Wifi, MapPin, Clock, CheckCircle,
  ArrowRight, Code, Database, Lock, Loader2
} from "lucide-react";

type ApiEndpoint = {
  method: string;
  path: string;
  desc: string;
  body?: string;
  response?: string;
  category: string;
  examSpecific?: boolean;
};

const API_ENDPOINTS: ApiEndpoint[] = [
  { category: "Authentication", method: "POST", path: "/api/auth/login", desc: "Operator/Admin login with username & password", body: '{ "username": "operator1", "password": "pass123" }', response: '{ "id": 1, "username": "operator1", "role": "operator", "name": "Ramesh Kumar", "displayName": "Ramesh Kumar" }' },

  { category: "Data Sync", method: "GET", path: "/api/sync/{examId}", desc: "Download all exam data for offline use (candidates, centres, operators, slots)", examSpecific: true, response: '{ "exam": {...}, "candidates": [...], "centers": [...], "operators": [...], "slots": [...], "serverTime": "..." }' },
  { category: "Data Sync", method: "GET", path: "/api/sync/{examId}?centreCode=DEL001", desc: "Download data for a specific centre only", examSpecific: true },

  { category: "Biometric SDK", method: "GET", path: "/api/biometric/sdk-config", desc: "Get biometric thresholds, SDK versions, scanner settings", response: '{ "faceMatch": { "engine": "FaceNet-512d", "threshold": 75, "livenessRequired": true }, "fingerprint": { "scanner": "MFS100", "sdk": "Mantra RD Service v2.0", "minNfiq": 3 } }' },
  { category: "Biometric SDK", method: "GET", path: "/api/biometric/scanner-status?model=MFS100", desc: "Check if fingerprint scanner is connected and ready", response: '{ "model": "MFS100", "status": "CONNECTED", "usbOtg": true, "rdServiceActive": true }' },

  { category: "Face Verification", method: "POST", path: "/api/biometric/face-match", desc: "Submit captured photo for face matching against candidate DB photo", body: '{ "candidateId": 1, "capturedPhotoBase64": "data:image/jpeg;base64,...", "livenessFrames": 3 }', response: '{ "matched": true, "confidence": 96.5, "liveness": { "isLive": true, "score": 0.98 }, "antiSpoof": { "isReal": true } }' },

  { category: "Fingerprint", method: "POST", path: "/api/biometric/fingerprint-capture", desc: "Submit fingerprint scan result for matching", body: '{ "candidateId": 1, "scannerModel": "MFS100", "templateBase64": "...", "nfiqScore": 4 }', response: '{ "capture": { "quality": 4, "accepted": true }, "matching": { "matched": true, "matchScore": 85, "threshold": 60 } }' },

  { category: "Verification Submit", method: "POST", path: "/api/verification/submit", desc: "Submit complete verification result (face + fingerprint + OMR)", body: '{ "candidateId": 1, "examId": 1, "operatorId": "OP001", "centreCode": "DEL001", "deviceId": "DEV001", "faceMatchPercent": 96.5, "fingerprintMatch": true, "fingerprintScore": 85, "fingerprintNfiq": 4, "scannerModel": "MFS100", "livenessPass": true, "antiSpoofPass": true, "omrNo": "OMR12345", "gpsLat": 28.6139, "gpsLng": 77.209, "verificationType": "face+fingerprint" }', response: '{ "success": true, "status": "Verified", "matchPercent": "96.5%", "candidateId": 1 }', examSpecific: true },

  { category: "Device Heartbeat", method: "POST", path: "/api/verification/heartbeat", desc: "Send device status every 30 seconds (battery, GPS, scanner)", body: '{ "deviceId": "DEV001", "operatorId": "OP001", "centreCode": "DEL001", "examId": 1, "batteryLevel": 85, "gpsLat": 28.6139, "gpsLng": 77.209, "scannerConnected": true, "scannerModel": "MFS100", "appVersion": "3.2.1" }', response: '{ "ok": true, "serverTime": "2025-02-26T10:30:00Z" }' },

  { category: "Candidate Data", method: "GET", path: "/api/candidates?examId={examId}", desc: "List all candidates for an exam", examSpecific: true },
  { category: "Candidate Data", method: "GET", path: "/api/candidates/by-centre/{centreCode}", desc: "List candidates assigned to a specific centre" },
  { category: "Candidate Data", method: "GET", path: "/api/candidates/{id}", desc: "Get single candidate details with photo URL" },
  { category: "Candidate Data", method: "PUT", path: "/api/candidates/{id}", desc: "Update candidate verification status", body: '{ "status": "Verified", "matchPercent": "96.5%", "verifiedAt": "26/02/2025, 10:30:00" }' },

  { category: "Exam Management", method: "GET", path: "/api/exams", desc: "List all exams" },
  { category: "Exam Management", method: "GET", path: "/api/exams/{id}", desc: "Get exam details with all settings" },

  { category: "Centre & Operator", method: "GET", path: "/api/centers?examId={examId}", desc: "List centres for an exam", examSpecific: true },
  { category: "Centre & Operator", method: "GET", path: "/api/operators", desc: "List all operators" },
  { category: "Centre & Operator", method: "GET", path: "/api/center-operator-maps", desc: "Get operator-to-centre assignments" },

  { category: "Device Management", method: "GET", path: "/api/devices", desc: "List all registered devices" },
  { category: "Device Management", method: "PUT", path: "/api/devices/{id}", desc: "Update device status (login, sync, battery)", body: '{ "loginStatus": "Logged In", "lastSync": "26/02/2025 10:30", "batteryLevel": "85%" }' },

  { category: "Alerts & Audit", method: "POST", path: "/api/alerts", desc: "Create a security alert (spoof, liveness fail, etc.)", body: '{ "type": "Spoof Attempt", "severity": "Critical", "candidateId": "1", "operatorId": "OP001", "centreCode": "DEL001", "description": "Photo spoof detected", "confidence": 0.95, "timestamp": "26/02/2025 10:30", "status": "Open" }' },
  { category: "Alerts & Audit", method: "POST", path: "/api/audit-logs", desc: "Create an audit log entry", body: '{ "timestamp": "26/02/2025 10:30", "action": "Biometric verification - Verified", "operatorId": "OP001", "operatorName": "Ramesh", "centreCode": "DEL001", "candidateId": "1", "deviceId": "DEV001", "mode": "face+fingerprint", "details": "Face: 96.5% | FP: Match" }' },

  { category: "APK Config", method: "GET", path: "/api/apk-builds/{id}/config", desc: "Download the full APK configuration JSON for an exam build" },
  { category: "APK Config", method: "POST", path: "/api/apk-builds", desc: "Create a new APK build record", body: '{ "examId": 1, "version": "3.2.1", "features": { "biometricMode": "face_fingerprint" } }' },
  { category: "APK Config", method: "POST", path: "/api/apk-builds/batch", desc: "Generate APK builds for multiple exams at once", body: '{ "examIds": [1, 2, 3], "features": { "biometricMode": "face_fingerprint", "offlineMode": true, "mdmControl": true } }' },
];

const CATEGORIES = [...new Set(API_ENDPOINTS.map(e => e.category))];

const ANDROID_FLOW = [
  { step: 1, title: "App Launch", desc: "Check if device is registered. If not, show device registration screen.", icon: <Smartphone className="w-5 h-5" /> },
  { step: 2, title: "Operator Login", desc: "POST /api/auth/login with username & password. Store token/session.", icon: <Lock className="w-5 h-5" /> },
  { step: 3, title: "Download Exam Data", desc: "GET /api/sync/{examId} to download candidates, centres, slots for offline use. Store in Room/SQLite.", icon: <Download className="w-5 h-5" /> },
  { step: 4, title: "SDK Config", desc: "GET /api/biometric/sdk-config to get face match threshold, fingerprint settings, retry limits.", icon: <Fingerprint className="w-5 h-5" /> },
  { step: 5, title: "Start Heartbeat", desc: "POST /api/verification/heartbeat every 30s with battery, GPS, scanner status.", icon: <Wifi className="w-5 h-5" /> },
  { step: 6, title: "Candidate Attendance", desc: "Scan QR/barcode or search by roll number. Mark candidate as Present.", icon: <CheckCircle className="w-5 h-5" /> },
  { step: 7, title: "Face Verification", desc: "Capture candidate photo with back camera. POST /api/biometric/face-match. Check liveness & anti-spoof.", icon: <Camera className="w-5 h-5" /> },
  { step: 8, title: "Fingerprint Scan", desc: "Capture fingerprint via MFS100/MFS110 USB OTG. POST /api/biometric/fingerprint-capture.", icon: <Fingerprint className="w-5 h-5" /> },
  { step: 9, title: "Submit Verification", desc: "POST /api/verification/submit with all results (face %, fingerprint, OMR, GPS). Get Verified/Failed status.", icon: <Shield className="w-5 h-5" /> },
  { step: 10, title: "Offline Sync", desc: "If offline, store results in Room DB. When online, batch sync all pending verifications.", icon: <Database className="w-5 h-5" /> },
];

export default function ApiDocs() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const { toast } = useToast();

  const { data: exams = [] } = useQuery({
    queryKey: ["exams"],
    queryFn: api.exams.list,
  });

  const selectedExam = exams.find((e: any) => String(e.id) === selectedExamId);
  const serverUrl = window.location.origin;

  const filteredEndpoints = activeCategory === "all"
    ? API_ENDPOINTS
    : API_ENDPOINTS.filter(e => e.category === activeCategory);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const getFullPath = (path: string) => {
    let p = path;
    if (selectedExamId) {
      p = p.replace("{examId}", selectedExamId);
    }
    return serverUrl + p;
  };

  const downloadFullConfig = async () => {
    if (!selectedExamId) {
      toast({ title: "Select an exam first", variant: "destructive" });
      return;
    }

    const config = {
      serverUrl,
      examId: Number(selectedExamId),
      examName: selectedExam?.name || "",
      examCode: selectedExam?.code || "",
      generatedAt: new Date().toISOString(),
      apiEndpoints: {
        login: { method: "POST", url: serverUrl + "/api/auth/login" },
        syncData: { method: "GET", url: serverUrl + "/api/sync/" + selectedExamId },
        sdkConfig: { method: "GET", url: serverUrl + "/api/biometric/sdk-config" },
        scannerStatus: { method: "GET", url: serverUrl + "/api/biometric/scanner-status" },
        faceMatch: { method: "POST", url: serverUrl + "/api/biometric/face-match" },
        fingerprintCapture: { method: "POST", url: serverUrl + "/api/biometric/fingerprint-capture" },
        submitVerification: { method: "POST", url: serverUrl + "/api/verification/submit" },
        heartbeat: { method: "POST", url: serverUrl + "/api/verification/heartbeat" },
        candidates: { method: "GET", url: serverUrl + "/api/candidates?examId=" + selectedExamId },
        candidateById: { method: "GET", url: serverUrl + "/api/candidates/{id}" },
        updateCandidate: { method: "PUT", url: serverUrl + "/api/candidates/{id}" },
        centres: { method: "GET", url: serverUrl + "/api/centers?examId=" + selectedExamId },
        devices: { method: "GET", url: serverUrl + "/api/devices" },
        updateDevice: { method: "PUT", url: serverUrl + "/api/devices/{id}" },
        createAlert: { method: "POST", url: serverUrl + "/api/alerts" },
        createAuditLog: { method: "POST", url: serverUrl + "/api/audit-logs" },
      },
      androidDependencies: [
        "implementation 'org.tensorflow:tensorflow-lite:2.14.0'",
        "implementation 'com.google.mlkit:face-detection:16.1.5'",
        "implementation 'com.google.mediapipe:mediapipe:0.10.8'",
        "implementation 'com.squareup.retrofit2:retrofit:2.9.0'",
        "implementation 'com.squareup.okhttp3:okhttp:4.12.0'",
        "implementation 'androidx.biometric:biometric:1.1.0'",
        "implementation 'com.google.zxing:core:3.5.2'",
        "implementation 'androidx.camera:camera-camera2:1.3.1'",
        "implementation 'androidx.room:room-runtime:2.6.1'",
      ],
      permissions: [
        "android.permission.INTERNET",
        "android.permission.CAMERA",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.USB_HOST",
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE",
        "android.permission.FOREGROUND_SERVICE",
        "android.permission.RECEIVE_BOOT_COMPLETED",
      ],
      biometricSettings: {
        faceMatchThreshold: 75,
        livenessRequired: true,
        antiSpoofRequired: true,
        faceRetryLimit: 3,
        fingerprintScanner: "MFS100",
        fingerprintMinNfiq: 3,
        fingerprintRetryLimit: 3,
        supervisorOverride: true,
      },
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MPA_API_Config_${selectedExam?.code || selectedExamId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Config downloaded" });
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300 font-sans pb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2" data-testid="text-api-docs-title">
            <BookOpen className="w-5 h-5 text-blue-600" /> APK API Documentation
          </h1>
          <p className="text-sm text-gray-500">Complete API reference for Android APK development</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedExamId} onValueChange={setSelectedExamId}>
            <SelectTrigger className="h-8 w-48 text-xs" data-testid="select-exam-api">
              <SelectValue placeholder="Select Exam" />
            </SelectTrigger>
            <SelectContent>
              {exams.map((exam: any) => (
                <SelectItem key={exam.id} value={String(exam.id)}>{exam.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" className="h-8 text-xs bg-blue-600 hover:bg-blue-700" onClick={downloadFullConfig} data-testid="button-download-config">
            <Download className="w-3 h-3 mr-1" /> Download Config JSON
          </Button>
        </div>
      </div>

      {selectedExamId && selectedExam && (
        <Card className="shadow-sm border-blue-100 rounded-lg bg-blue-50/50">
          <CardContent className="p-3">
            <div className="flex items-center gap-4 text-xs">
              <div><span className="text-gray-500">Server:</span> <code className="bg-white px-1.5 py-0.5 rounded border text-blue-700 font-mono" data-testid="text-server-url">{serverUrl}</code></div>
              <div><span className="text-gray-500">Exam:</span> <span className="font-medium">{selectedExam.name}</span></div>
              <div><span className="text-gray-500">Code:</span> <code className="bg-white px-1.5 py-0.5 rounded border">{selectedExam.code}</code></div>
              <div><span className="text-gray-500">Sync URL:</span> <code className="bg-white px-1.5 py-0.5 rounded border text-green-700 font-mono">{serverUrl}/api/sync/{selectedExamId}</code></div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm border-gray-100 rounded-lg">
        <CardContent className="p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-green-600" /> Android App Flow (Step by Step)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
            {ANDROID_FLOW.map((step, i) => (
              <div key={i} className="relative flex items-start gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-100" data-testid={`flow-step-${step.step}`}>
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                  {step.step}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-gray-900">{step.title}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-1.5">
        <Button
          size="sm"
          variant={activeCategory === "all" ? "default" : "outline"}
          className={`text-xs h-7 ${activeCategory === "all" ? "bg-blue-600" : ""}`}
          onClick={() => setActiveCategory("all")}
          data-testid="button-filter-all"
        >
          All ({API_ENDPOINTS.length})
        </Button>
        {CATEGORIES.map(cat => (
          <Button
            key={cat}
            size="sm"
            variant={activeCategory === cat ? "default" : "outline"}
            className={`text-xs h-7 ${activeCategory === cat ? "bg-blue-600" : ""}`}
            onClick={() => setActiveCategory(cat)}
            data-testid={`button-filter-${cat.toLowerCase().replace(/\s+/g, "-")}`}
          >
            {cat} ({API_ENDPOINTS.filter(e => e.category === cat).length})
          </Button>
        ))}
      </div>

      <div className="space-y-2">
        {filteredEndpoints.map((ep, i) => (
          <Card key={i} className="shadow-sm border-gray-100 rounded-lg" data-testid={`api-endpoint-${i}`}>
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`text-[10px] px-1.5 py-0 font-mono ${
                      ep.method === "GET" ? "bg-green-100 text-green-700 border-green-200" :
                      ep.method === "POST" ? "bg-blue-100 text-blue-700 border-blue-200" :
                      ep.method === "PUT" ? "bg-orange-100 text-orange-700 border-orange-200" :
                      "bg-red-100 text-red-700 border-red-200"
                    }`} variant="outline">{ep.method}</Badge>
                    <code className="text-xs font-mono text-gray-800 truncate">{ep.path}</code>
                    {ep.examSpecific && <Badge className="text-[9px] px-1 py-0 bg-purple-50 text-purple-600 border-purple-200" variant="outline">Exam-specific</Badge>}
                  </div>
                  <p className="text-[11px] text-gray-500">{ep.desc}</p>

                  {ep.body && (
                    <div className="mt-2">
                      <div className="text-[9px] font-semibold text-gray-400 uppercase mb-0.5">Request Body</div>
                      <pre className="text-[10px] bg-gray-900 text-green-400 p-2 rounded-md overflow-x-auto font-mono">{ep.body}</pre>
                    </div>
                  )}

                  {ep.response && (
                    <div className="mt-2">
                      <div className="text-[9px] font-semibold text-gray-400 uppercase mb-0.5">Response</div>
                      <pre className="text-[10px] bg-gray-50 text-gray-700 p-2 rounded-md overflow-x-auto font-mono border">{ep.response}</pre>
                    </div>
                  )}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() => copyToClipboard(getFullPath(ep.path))}
                    title="Copy full URL"
                    data-testid={`button-copy-${i}`}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-sm border-gray-100 rounded-lg">
        <CardContent className="p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Code className="w-4 h-4 text-purple-600" /> Android Retrofit Setup (Kotlin)
          </h2>
          <pre className="text-[11px] bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto font-mono leading-relaxed">{`interface MpaApiService {

    @POST("api/auth/login")
    suspend fun login(@Body body: LoginRequest): Response<UserResponse>

    @GET("api/sync/{examId}")
    suspend fun syncExamData(@Path("examId") examId: Int): Response<SyncResponse>

    @GET("api/biometric/sdk-config")
    suspend fun getSdkConfig(): Response<SdkConfigResponse>

    @GET("api/biometric/scanner-status")
    suspend fun getScannerStatus(@Query("model") model: String): Response<ScannerStatus>

    @POST("api/biometric/face-match")
    suspend fun faceMatch(@Body body: FaceMatchRequest): Response<FaceMatchResponse>

    @POST("api/biometric/fingerprint-capture")
    suspend fun fingerprintCapture(@Body body: FingerprintRequest): Response<FingerprintResponse>

    @POST("api/verification/submit")
    suspend fun submitVerification(@Body body: VerificationSubmit): Response<VerificationResult>

    @POST("api/verification/heartbeat")
    suspend fun heartbeat(@Body body: HeartbeatRequest): Response<HeartbeatResponse>

    @GET("api/candidates")
    suspend fun getCandidates(@Query("examId") examId: Int): Response<List<Candidate>>

    @PUT("api/candidates/{id}")
    suspend fun updateCandidate(@Path("id") id: Int, @Body body: CandidateUpdate): Response<Candidate>

    @POST("api/alerts")
    suspend fun createAlert(@Body body: AlertRequest): Response<Alert>

    @POST("api/audit-logs")
    suspend fun createAuditLog(@Body body: AuditLogRequest): Response<AuditLog>
}

// Retrofit Instance
val retrofit = Retrofit.Builder()
    .baseUrl("${serverUrl || "https://mpaverification.com"}/")
    .addConverterFactory(GsonConverterFactory.create())
    .client(OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .build())
    .build()

val apiService = retrofit.create(MpaApiService::class.java)`}</pre>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-gray-100 rounded-lg">
        <CardContent className="p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Database className="w-4 h-4 text-orange-600" /> Offline Room Database Schema (Kotlin)
          </h2>
          <pre className="text-[11px] bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto font-mono leading-relaxed">{`@Entity(tableName = "candidates")
data class CandidateEntity(
    @PrimaryKey val id: Int,
    val name: String,
    val rollNo: String,
    val applicationNo: String?,
    val examId: Int,
    val centreCode: String,
    val photoUrl: String?,
    val status: String = "Pending",       // Pending | Verified | Failed
    val matchPercent: String?,
    val presentMark: String?,             // Present | Absent
    val verifiedAt: String?,
    val omrNo: String?,
    val capturedPhotoPath: String?,       // Local file path of captured photo
    val syncedToServer: Boolean = false   // Track if result uploaded
)

@Entity(tableName = "pending_verifications")
data class PendingVerification(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val candidateId: Int,
    val examId: Int,
    val operatorId: String,
    val centreCode: String,
    val deviceId: String,
    val faceMatchPercent: Float?,
    val fingerprintMatch: Boolean?,
    val fingerprintScore: Int?,
    val fingerprintNfiq: Int?,
    val scannerModel: String?,
    val livenessPass: Boolean?,
    val antiSpoofPass: Boolean?,
    val omrNo: String?,
    val gpsLat: Double?,
    val gpsLng: Double?,
    val capturedPhotoPath: String?,
    val verificationType: String?,
    val createdAt: Long = System.currentTimeMillis(),
    val syncedToServer: Boolean = false
)

@Dao
interface VerificationDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPending(verification: PendingVerification)

    @Query("SELECT * FROM pending_verifications WHERE syncedToServer = 0")
    suspend fun getUnsyncedVerifications(): List<PendingVerification>

    @Query("UPDATE pending_verifications SET syncedToServer = 1 WHERE id = :id")
    suspend fun markSynced(id: Int)
}`}</pre>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-gray-100 rounded-lg">
        <CardContent className="p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-red-600" /> Mantra MFS100 Integration (Kotlin)
          </h2>
          <pre className="text-[11px] bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto font-mono leading-relaxed">{`// Add Mantra SDK AAR to libs/ folder
// In build.gradle: implementation files('libs/mantra-mfs100-sdk.aar')

class FingerprintHelper(private val context: Context) {

    private var mfs100: MFS100? = null

    fun init(): Boolean {
        mfs100 = MFS100(OnDeviceChange(context))
        val ret = mfs100?.Init()
        return ret == 0  // 0 = success
    }

    fun capture(): FingerprintResult {
        val timeout = 10000  // 10 seconds
        val quality = 60     // Min quality threshold

        val fingerData = FingerData()
        val ret = mfs100?.AutoCapture(fingerData, timeout, true)

        return FingerprintResult(
            success = ret == 0,
            quality = fingerData.Quality(),
            nfiq = fingerData.Nfiq(),
            isoTemplate = fingerData.ISOTemplate(),  // Send this to server
            rawImage = fingerData.FingerImage(),
            errorCode = ret ?: -1
        )
    }

    fun matchTemplates(template1: ByteArray, template2: ByteArray): Int {
        // Returns match score (0-100)
        return mfs100?.MatchISO(template1, template2) ?: 0
    }

    fun dispose() {
        mfs100?.UnInit()
        mfs100?.Dispose()
    }
}

data class FingerprintResult(
    val success: Boolean,
    val quality: Int,
    val nfiq: Int,
    val isoTemplate: ByteArray?,
    val rawImage: ByteArray?,
    val errorCode: Int
)`}</pre>
        </CardContent>
      </Card>
    </div>
  );
}
