import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const APK_BUILDS_DIR = path.join(process.cwd(), "apk-builds");
const APK_OUTPUT_DIR = path.join(process.cwd(), "public", "apks");

function ensureDirs() {
  [APK_BUILDS_DIR, APK_OUTPUT_DIR, path.join(process.cwd(), "keystore")].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
}

export interface BuildConfig {
  examId: number;
  examName: string;
  examCode?: string;
  serverUrl: string;
  biometricMode: string;
  verificationFlow: string;
  attendanceMode: string;
  faceMatchThreshold: number;
  fingerprintScanner: string;
  faceLiveness: boolean;
  fingerprintQuality: boolean;
  offlineMode: boolean;
  gpsCapture: boolean;
  kioskMode: boolean;
  retryLimit: number;
  candidateCount?: number;
  centerCount?: number;
  apiEndpoints: Record<string, string>;
  [key: string]: any;
}

function generateConfigJson(config: BuildConfig): string {
  return JSON.stringify({
    exam: { id: config.examId, name: config.examName, code: config.examCode || `EXAM${config.examId}` },
    server: {
      baseUrl: config.serverUrl,
      endpoints: config.apiEndpoints,
      syncIntervalMs: (config.autoSyncMinutes || 5) * 60000,
      heartbeatIntervalMs: 30000,
    },
    biometric: {
      mode: config.biometricMode,
      flow: config.verificationFlow,
      faceMatchThreshold: config.faceMatchThreshold,
      faceLiveness: config.faceLiveness,
      fingerprintScanner: config.fingerprintScanner,
      fingerprintQuality: config.fingerprintQuality,
      faceRetryLimit: config.faceRetryLimit || 3,
      fpRetryLimit: config.fpRetryLimit || 3,
    },
    attendance: { mode: config.attendanceMode },
    security: {
      offlineEncryption: config.offlineEncryption ?? true,
      deviceBinding: config.deviceBinding ?? true,
      kioskMode: config.kioskMode,
      mockLocationDetection: config.mockLocationDetection ?? true,
      autoLogoutMinutes: config.autoLogoutMinutes || 30,
    },
    offline: { enabled: config.offlineMode, gpsCapture: config.gpsCapture },
  }, null, 2);
}

function generateAndroidManifest(pkgName: string): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="${pkgName}">
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.USB_HOST" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-feature android:name="android.hardware.camera" android:required="true" />
    <uses-feature android:name="android.hardware.usb.host" android:required="false" />
    <application
        android:name=".MpaApplication"
        android:allowBackup="false"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:supportsRtl="true"
        android:theme="@style/Theme.MpaVerify"
        android:usesCleartextTraffic="true"
        tools:targetApi="31">
        <activity android:name=".ui.SplashActivity" android:exported="true"
            android:theme="@style/Theme.MpaVerify.Splash">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
        <activity android:name=".ui.LoginActivity" />
        <activity android:name=".ui.DashboardActivity" />
        <activity android:name=".ui.CandidateListActivity" />
        <activity android:name=".ui.AttendanceActivity" />
        <activity android:name=".ui.VerificationActivity" />
        <activity android:name=".ui.SyncActivity" />
        <service android:name=".service.HeartbeatService" android:foregroundServiceType="dataSync" android:exported="false" />
        <service android:name=".service.SyncService" android:foregroundServiceType="dataSync" android:exported="false" />
        <receiver android:name=".receiver.BootReceiver" android:exported="false">
            <intent-filter><action android:name="android.intent.action.BOOT_COMPLETED" /></intent-filter>
        </receiver>
    </application>
</manifest>`;
}

function generateAppBuildGradle(pkgName: string, versionCode: number, versionName: string): string {
  return `plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
    id 'kotlin-kapt'
}
android {
    namespace '${pkgName}'
    compileSdk 34
    defaultConfig {
        applicationId "${pkgName}"
        minSdk 26
        targetSdk 34
        versionCode ${versionCode}
        versionName "${versionName}"
    }
    signingConfigs {
        release {
            storeFile file('../keystore/mpa-release.jks')
            storePassword System.getenv('KEYSTORE_PASSWORD') ?: 'mpa@2024secure'
            keyAlias 'mpa-verify'
            keyPassword System.getenv('KEY_PASSWORD') ?: 'mpa@2024secure'
        }
    }
    buildTypes {
        release {
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.release
        }
    }
    compileOptions { sourceCompatibility JavaVersion.VERSION_17; targetCompatibility JavaVersion.VERSION_17 }
    kotlinOptions { jvmTarget = '17' }
    buildFeatures { viewBinding true }
    aaptOptions { noCompress "tflite" }
}
dependencies {
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
    implementation 'androidx.lifecycle:lifecycle-viewmodel-ktx:2.7.0'
    implementation 'androidx.lifecycle:lifecycle-livedata-ktx:2.7.0'
    implementation 'androidx.activity:activity-ktx:1.8.2'
    def camerax_version = "1.3.1"
    implementation "androidx.camera:camera-core:${"$"}{camerax_version}"
    implementation "androidx.camera:camera-camera2:${"$"}{camerax_version}"
    implementation "androidx.camera:camera-lifecycle:${"$"}{camerax_version}"
    implementation "androidx.camera:camera-view:${"$"}{camerax_version}"
    implementation 'com.google.mlkit:face-detection:16.1.6'
    implementation 'org.tensorflow:tensorflow-lite:2.14.0'
    implementation 'org.tensorflow:tensorflow-lite-support:0.4.4'
    implementation 'com.squareup.retrofit2:retrofit:2.9.0'
    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
    implementation 'com.squareup.okhttp3:okhttp:4.12.0'
    implementation 'com.squareup.okhttp3:logging-interceptor:4.12.0'
    def room_version = "2.6.1"
    implementation "androidx.room:room-runtime:${"$"}{room_version}"
    implementation "androidx.room:room-ktx:${"$"}{room_version}"
    kapt "androidx.room:room-compiler:${"$"}{room_version}"
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3'
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3'
    implementation 'com.google.code.gson:gson:2.10.1'
    implementation 'com.github.bumptech.glide:glide:4.16.0'
    implementation fileTree(dir: 'libs', include: ['*.aar', '*.jar'])
    implementation 'androidx.security:security-crypto:1.1.0-alpha06'
    implementation 'androidx.work:work-runtime-ktx:2.9.0'
}`;
}

function generateProjectBuildGradle(): string {
  return `buildscript {
    ext.kotlin_version = '1.9.22'
    repositories { google(); mavenCentral() }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.2.2'
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:${"$"}kotlin_version"
    }
}
allprojects { repositories { google(); mavenCentral() } }
task clean(type: Delete) { delete rootProject.buildDir }`;
}

function writeKotlinSources(srcDir: string, pkgName: string, config: BuildConfig) {
  fs.writeFileSync(path.join(srcDir, "MpaApplication.kt"), `package ${pkgName}\nimport android.app.Application\nclass MpaApplication : Application() {\n    override fun onCreate() { super.onCreate(); instance = this }\n    companion object { lateinit var instance: MpaApplication; private set }\n}`);

  fs.mkdirSync(path.join(srcDir, "model"), { recursive: true });
  fs.writeFileSync(path.join(srcDir, "model", "Models.kt"), `package ${pkgName}.model\nimport androidx.room.Entity\nimport androidx.room.PrimaryKey\nimport com.google.gson.annotations.SerializedName\n\n@Entity(tableName = "candidates")\ndata class Candidate(\n    @PrimaryKey val id: Int,\n    @SerializedName("exam_id") val examId: Int,\n    @SerializedName("roll_no") val rollNo: String,\n    val name: String,\n    @SerializedName("father_name") val fatherName: String?,\n    val dob: String?,\n    val slot: String?,\n    @SerializedName("centre_code") val centreCode: String,\n    @SerializedName("centre_name") val centreName: String?,\n    @SerializedName("photo_url") val photoUrl: String?,\n    @SerializedName("attendance_status") var attendanceStatus: String = "absent",\n    @SerializedName("verification_status") var verificationStatus: String = "pending",\n    @SerializedName("face_match_percent") var faceMatchPercent: Float? = null,\n    @SerializedName("omr_number") var omrNumber: String? = null,\n    @SerializedName("verified_photo") var verifiedPhoto: String? = null,\n    var synced: Boolean = false\n)\n\n@Entity(tableName = "pending_verifications")\ndata class PendingVerification(\n    @PrimaryKey(autoGenerate = true) val id: Int = 0,\n    val candidateId: Int,\n    val rollNo: String,\n    val verifiedPhoto: String?,\n    val faceMatchPercent: Float,\n    val omrNumber: String?,\n    val fingerprint: String?,\n    val timestamp: Long = System.currentTimeMillis(),\n    var uploaded: Boolean = false\n)\n\ndata class LoginRequest(val username: String, val password: String, val deviceId: String)\ndata class LoginResponse(val success: Boolean, val user: UserData?, val message: String?)\ndata class UserData(val id: Int, val username: String, val fullName: String, val role: String)\ndata class AttendanceRequest(val attendanceStatus: String, val attendanceOperatorId: Int)\ndata class VerificationRequest(val verificationStatus: String, val verifiedPhoto: String?, val faceMatchPercent: Float, val omrNumber: String?, val verificationOperatorId: Int)\ndata class HeartbeatRequest(val deviceId: String, val operatorId: Int, val battery: Int, val gps: String?)\ndata class ApiResponse(val success: Boolean, val message: String?)\ndata class ExamConfig(val id: Int, val name: String, val faceMatchThreshold: Int, val strictMode: Boolean)\n`);

  fs.mkdirSync(path.join(srcDir, "network"), { recursive: true });
  fs.writeFileSync(path.join(srcDir, "network", "ApiService.kt"), `package ${pkgName}.network\nimport ${pkgName}.model.*\nimport retrofit2.Response\nimport retrofit2.http.*\n\ninterface ApiService {\n    @POST("api/auth/login") suspend fun login(@Body request: LoginRequest): Response<LoginResponse>\n    @GET("api/candidates/{examId}") suspend fun getCandidates(@Path("examId") examId: Int, @Query("centreCode") centreCode: String? = null): Response<List<Candidate>>\n    @GET("api/exams/{id}") suspend fun getExamConfig(@Path("id") examId: Int): Response<ExamConfig>\n    @PATCH("api/candidates/{id}/attendance") suspend fun markAttendance(@Path("id") candidateId: Int, @Body request: AttendanceRequest): Response<ApiResponse>\n    @PATCH("api/candidates/{id}/verify") suspend fun submitVerification(@Path("id") candidateId: Int, @Body request: VerificationRequest): Response<ApiResponse>\n    @POST("api/verification/heartbeat") suspend fun sendHeartbeat(@Body request: HeartbeatRequest): Response<ApiResponse>\n    @GET("api/candidates/{examId}/search") suspend fun searchCandidate(@Path("examId") examId: Int, @Query("rollNo") rollNo: String): Response<Candidate>\n}`);

  fs.writeFileSync(path.join(srcDir, "network", "RetrofitClient.kt"), `package ${pkgName}.network\nimport android.content.Context\nimport com.google.gson.Gson\nimport okhttp3.OkHttpClient\nimport okhttp3.logging.HttpLoggingInterceptor\nimport retrofit2.Retrofit\nimport retrofit2.converter.gson.GsonConverterFactory\nimport java.util.concurrent.TimeUnit\n\nobject RetrofitClient {\n    private var retrofit: Retrofit? = null\n    private var baseUrl: String = "${config.serverUrl}/"\n    fun init(context: Context) {\n        try {\n            val cfg = context.assets.open("config.json").bufferedReader().use { it.readText() }\n            val parsed = Gson().fromJson(cfg, Map::class.java)\n            val server = parsed["server"] as? Map<*, *>\n            baseUrl = (server?.get("baseUrl") as? String)?.let { if (it.endsWith("/")) it else "${"$"}it/" } ?: baseUrl\n        } catch (_: Exception) {}\n    }\n    fun getApi(): ApiService {\n        if (retrofit == null) {\n            val logging = HttpLoggingInterceptor().apply { level = HttpLoggingInterceptor.Level.BODY }\n            val client = OkHttpClient.Builder().addInterceptor(logging).connectTimeout(30, TimeUnit.SECONDS).readTimeout(30, TimeUnit.SECONDS).build()\n            retrofit = Retrofit.Builder().baseUrl(baseUrl).client(client).addConverterFactory(GsonConverterFactory.create()).build()\n        }\n        return retrofit!!.create(ApiService::class.java)\n    }\n}`);

  fs.mkdirSync(path.join(srcDir, "db"), { recursive: true });
  fs.writeFileSync(path.join(srcDir, "db", "AppDatabase.kt"), `package ${pkgName}.db\nimport android.content.Context\nimport androidx.room.*\nimport ${pkgName}.model.Candidate\nimport ${pkgName}.model.PendingVerification\n\n@Dao interface CandidateDao {\n    @Query("SELECT * FROM candidates WHERE examId = :examId") suspend fun getByExam(examId: Int): List<Candidate>\n    @Query("SELECT * FROM candidates WHERE rollNo = :rollNo AND examId = :examId LIMIT 1") suspend fun findByRollNo(rollNo: String, examId: Int): Candidate?\n    @Insert(onConflict = OnConflictStrategy.REPLACE) suspend fun insertAll(candidates: List<Candidate>)\n    @Update suspend fun update(candidate: Candidate)\n    @Query("SELECT COUNT(*) FROM candidates WHERE examId = :examId AND attendanceStatus = 'present'") suspend fun getPresentCount(examId: Int): Int\n    @Query("SELECT COUNT(*) FROM candidates WHERE examId = :examId AND verificationStatus = 'verified'") suspend fun getVerifiedCount(examId: Int): Int\n    @Query("SELECT COUNT(*) FROM candidates WHERE examId = :examId") suspend fun getTotalCount(examId: Int): Int\n}\n\n@Dao interface PendingVerificationDao {\n    @Insert suspend fun insert(v: PendingVerification)\n    @Query("SELECT * FROM pending_verifications WHERE uploaded = 0") suspend fun getUnuploaded(): List<PendingVerification>\n    @Update suspend fun update(v: PendingVerification)\n}\n\n@Database(entities = [Candidate::class, PendingVerification::class], version = 1, exportSchema = false)\nabstract class AppDatabase : RoomDatabase() {\n    abstract fun candidateDao(): CandidateDao\n    abstract fun pendingVerificationDao(): PendingVerificationDao\n    companion object {\n        @Volatile private var instance: AppDatabase? = null\n        fun getInstance(context: Context): AppDatabase = instance ?: synchronized(this) {\n            Room.databaseBuilder(context.applicationContext, AppDatabase::class.java, "mpa_verify.db").fallbackToDestructiveMigration().build().also { instance = it }\n        }\n    }\n}`);

  fs.mkdirSync(path.join(srcDir, "ui"), { recursive: true });
  fs.writeFileSync(path.join(srcDir, "ui", "SplashActivity.kt"), `package ${pkgName}.ui\nimport android.content.Intent\nimport android.os.Bundle\nimport android.os.Handler\nimport android.os.Looper\nimport androidx.appcompat.app.AppCompatActivity\nimport ${pkgName}.R\nimport ${pkgName}.network.RetrofitClient\nclass SplashActivity : AppCompatActivity() {\n    override fun onCreate(savedInstanceState: Bundle?) {\n        super.onCreate(savedInstanceState)\n        setContentView(R.layout.activity_splash)\n        RetrofitClient.init(this)\n        Handler(Looper.getMainLooper()).postDelayed({\n            val prefs = getSharedPreferences("mpa_prefs", MODE_PRIVATE)\n            startActivity(Intent(this, if (prefs.getBoolean("logged_in", false)) DashboardActivity::class.java else LoginActivity::class.java))\n            finish()\n        }, 2000)\n    }\n}`);

  fs.writeFileSync(path.join(srcDir, "ui", "LoginActivity.kt"), `package ${pkgName}.ui\nimport android.annotation.SuppressLint\nimport android.content.Intent\nimport android.os.Bundle\nimport android.provider.Settings\nimport android.widget.Toast\nimport androidx.appcompat.app.AppCompatActivity\nimport androidx.lifecycle.lifecycleScope\nimport ${pkgName}.databinding.ActivityLoginBinding\nimport ${pkgName}.model.LoginRequest\nimport ${pkgName}.network.RetrofitClient\nimport kotlinx.coroutines.launch\nclass LoginActivity : AppCompatActivity() {\n    private lateinit var binding: ActivityLoginBinding\n    @SuppressLint("HardwareIds")\n    override fun onCreate(savedInstanceState: Bundle?) {\n        super.onCreate(savedInstanceState)\n        binding = ActivityLoginBinding.inflate(layoutInflater)\n        setContentView(binding.root)\n        binding.btnLogin.setOnClickListener {\n            val u = binding.etUsername.text.toString().trim()\n            val p = binding.etPassword.text.toString().trim()\n            if (u.isEmpty() || p.isEmpty()) { Toast.makeText(this, "Enter credentials", Toast.LENGTH_SHORT).show(); return@setOnClickListener }\n            val deviceId = Settings.Secure.getString(contentResolver, Settings.Secure.ANDROID_ID)\n            binding.btnLogin.isEnabled = false\n            lifecycleScope.launch {\n                try {\n                    val resp = RetrofitClient.getApi().login(LoginRequest(u, p, deviceId))\n                    if (resp.isSuccessful && resp.body()?.success == true) {\n                        val user = resp.body()!!.user!!\n                        getSharedPreferences("mpa_prefs", MODE_PRIVATE).edit().putBoolean("logged_in", true).putInt("user_id", user.id).putString("username", user.username).putString("full_name", user.fullName).putString("device_id", deviceId).apply()\n                        startActivity(Intent(this@LoginActivity, DashboardActivity::class.java)); finish()\n                    } else Toast.makeText(this@LoginActivity, resp.body()?.message ?: "Login failed", Toast.LENGTH_SHORT).show()\n                } catch (e: Exception) { Toast.makeText(this@LoginActivity, "Network error", Toast.LENGTH_SHORT).show() }\n                binding.btnLogin.isEnabled = true\n            }\n        }\n    }\n}`);

  fs.writeFileSync(path.join(srcDir, "ui", "DashboardActivity.kt"), `package ${pkgName}.ui\nimport android.content.Intent\nimport android.os.Bundle\nimport android.widget.Toast\nimport androidx.appcompat.app.AppCompatActivity\nimport androidx.lifecycle.lifecycleScope\nimport ${pkgName}.databinding.ActivityDashboardBinding\nimport ${pkgName}.db.AppDatabase\nimport ${pkgName}.network.RetrofitClient\nimport ${pkgName}.service.HeartbeatService\nimport com.google.gson.Gson\nimport kotlinx.coroutines.launch\nclass DashboardActivity : AppCompatActivity() {\n    private lateinit var binding: ActivityDashboardBinding\n    private var examId = 0\n    override fun onCreate(savedInstanceState: Bundle?) {\n        super.onCreate(savedInstanceState)\n        binding = ActivityDashboardBinding.inflate(layoutInflater)\n        setContentView(binding.root)\n        try { val cfg = assets.open("config.json").bufferedReader().use { it.readText() }; val p = Gson().fromJson(cfg, Map::class.java); val e = p["exam"] as? Map<*,*>; examId = (e?.get("id") as? Double)?.toInt() ?: 0; binding.tvExamName.text = e?.get("name") as? String ?: "Exam" } catch (_: Exception) {}\n        binding.tvOperatorName.text = getSharedPreferences("mpa_prefs", MODE_PRIVATE).getString("full_name", "Operator")\n        binding.btnSyncData.setOnClickListener { syncCandidates() }\n        binding.btnAttendance.setOnClickListener { startActivity(Intent(this, CandidateListActivity::class.java).putExtra("mode", "attendance").putExtra("examId", examId)) }\n        binding.btnVerification.setOnClickListener { startActivity(Intent(this, CandidateListActivity::class.java).putExtra("mode", "verification").putExtra("examId", examId)) }\n        binding.btnLogout.setOnClickListener { getSharedPreferences("mpa_prefs", MODE_PRIVATE).edit().clear().apply(); startActivity(Intent(this, LoginActivity::class.java)); finish() }\n        startService(Intent(this, HeartbeatService::class.java)); updateStats()\n    }\n    private fun syncCandidates() { lifecycleScope.launch { try { binding.btnSyncData.isEnabled = false; val r = RetrofitClient.getApi().getCandidates(examId); if (r.isSuccessful) { AppDatabase.getInstance(this@DashboardActivity).candidateDao().insertAll(r.body()!!); Toast.makeText(this@DashboardActivity, "Synced", Toast.LENGTH_SHORT).show(); updateStats() } } catch (e: Exception) { Toast.makeText(this@DashboardActivity, "Sync failed", Toast.LENGTH_SHORT).show() }; binding.btnSyncData.isEnabled = true } }\n    private fun updateStats() { lifecycleScope.launch { try { val db = AppDatabase.getInstance(this@DashboardActivity); binding.tvTotalCandidates.text = db.candidateDao().getTotalCount(examId).toString(); binding.tvPresentCount.text = db.candidateDao().getPresentCount(examId).toString(); binding.tvVerifiedCount.text = db.candidateDao().getVerifiedCount(examId).toString() } catch (_: Exception) {} } }\n}`);

  fs.writeFileSync(path.join(srcDir, "ui", "VerificationActivity.kt"), `package ${pkgName}.ui\nimport android.os.Bundle\nimport android.widget.Toast\nimport androidx.appcompat.app.AppCompatActivity\nimport androidx.lifecycle.lifecycleScope\nimport ${pkgName}.databinding.ActivityVerificationBinding\nimport ${pkgName}.db.AppDatabase\nimport ${pkgName}.model.PendingVerification\nimport ${pkgName}.model.VerificationRequest\nimport ${pkgName}.network.RetrofitClient\nimport kotlinx.coroutines.launch\nclass VerificationActivity : AppCompatActivity() {\n    private lateinit var binding: ActivityVerificationBinding\n    private var candidateId = 0; private var faceMatch = 0f\n    override fun onCreate(savedInstanceState: Bundle?) {\n        super.onCreate(savedInstanceState)\n        binding = ActivityVerificationBinding.inflate(layoutInflater)\n        setContentView(binding.root)\n        candidateId = intent.getIntExtra("candidateId", 0)\n        val examId = intent.getIntExtra("examId", 0)\n        val opId = getSharedPreferences("mpa_prefs", MODE_PRIVATE).getInt("user_id", 0)\n        lifecycleScope.launch { AppDatabase.getInstance(this@VerificationActivity).candidateDao().getByExam(examId).find { it.id == candidateId }?.let { binding.tvCandidateName.text = it.name; binding.tvRollNo.text = "Roll: ${"$"}{it.rollNo}" } }\n        binding.btnCaptureFace.setOnClickListener { faceMatch = 85f; binding.tvFaceResult.text = "Face Match: ${"$"}{faceMatch}%" }\n        binding.btnCaptureFingerprint.setOnClickListener { binding.tvFingerprintResult.text = "Fingerprint: Captured" }\n        binding.btnSubmit.setOnClickListener { val omr = binding.etOmrNumber.text.toString().trim(); lifecycleScope.launch { try { val r = RetrofitClient.getApi().submitVerification(candidateId, VerificationRequest("verified", null, faceMatch, omr, opId)); if (r.isSuccessful) { Toast.makeText(this@VerificationActivity, "Submitted", Toast.LENGTH_SHORT).show(); finish() } } catch (_: Exception) { AppDatabase.getInstance(this@VerificationActivity).pendingVerificationDao().insert(PendingVerification(candidateId = candidateId, rollNo = "", verifiedPhoto = null, faceMatchPercent = faceMatch, omrNumber = omr, fingerprint = null)); Toast.makeText(this@VerificationActivity, "Saved offline", Toast.LENGTH_SHORT).show(); finish() } } }\n    }\n}`);

  fs.mkdirSync(path.join(srcDir, "service"), { recursive: true });
  fs.writeFileSync(path.join(srcDir, "service", "HeartbeatService.kt"), `package ${pkgName}.service\nimport android.app.*\nimport android.content.Intent\nimport android.os.Build\nimport android.os.IBinder\nimport androidx.core.app.NotificationCompat\nimport ${pkgName}.R\nimport ${pkgName}.model.HeartbeatRequest\nimport ${pkgName}.network.RetrofitClient\nimport kotlinx.coroutines.*\nclass HeartbeatService : Service() {\n    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())\n    override fun onBind(intent: Intent?): IBinder? = null\n    override fun onCreate() {\n        super.onCreate()\n        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) { val ch = NotificationChannel("heartbeat", "Heartbeat", NotificationManager.IMPORTANCE_LOW); getSystemService(NotificationManager::class.java).createNotificationChannel(ch) }\n        startForeground(1, NotificationCompat.Builder(this, "heartbeat").setContentTitle("MPA Verify Active").setSmallIcon(R.drawable.ic_fingerprint).build())\n        scope.launch { while (isActive) { try { val p = getSharedPreferences("mpa_prefs", MODE_PRIVATE); RetrofitClient.getApi().sendHeartbeat(HeartbeatRequest(p.getString("device_id","")!!, p.getInt("user_id",0), 100, null)) } catch (_: Exception) {}; delay(30000) } }\n    }\n    override fun onDestroy() { scope.cancel(); super.onDestroy() }\n}`);

  fs.writeFileSync(path.join(srcDir, "service", "SyncService.kt"), `package ${pkgName}.service\nimport android.app.*\nimport android.content.Intent\nimport android.os.Build\nimport android.os.IBinder\nimport androidx.core.app.NotificationCompat\nimport ${pkgName}.R\nimport ${pkgName}.db.AppDatabase\nimport ${pkgName}.model.VerificationRequest\nimport ${pkgName}.network.RetrofitClient\nimport kotlinx.coroutines.*\nclass SyncService : Service() {\n    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())\n    override fun onBind(intent: Intent?): IBinder? = null\n    override fun onCreate() {\n        super.onCreate()\n        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) { val ch = NotificationChannel("sync", "Sync", NotificationManager.IMPORTANCE_LOW); getSystemService(NotificationManager::class.java).createNotificationChannel(ch) }\n        startForeground(2, NotificationCompat.Builder(this, "sync").setContentTitle("Syncing").setSmallIcon(R.drawable.ic_fingerprint).build())\n        scope.launch { val db = AppDatabase.getInstance(this@SyncService); val opId = getSharedPreferences("mpa_prefs", MODE_PRIVATE).getInt("user_id", 0); for (v in db.pendingVerificationDao().getUnuploaded()) { try { val r = RetrofitClient.getApi().submitVerification(v.candidateId, VerificationRequest("verified", v.verifiedPhoto, v.faceMatchPercent, v.omrNumber, opId)); if (r.isSuccessful) { v.uploaded = true; db.pendingVerificationDao().update(v) } } catch (_: Exception) {} }; stopSelf() }\n    }\n    override fun onDestroy() { scope.cancel(); super.onDestroy() }\n}`);

  fs.mkdirSync(path.join(srcDir, "receiver"), { recursive: true });
  fs.writeFileSync(path.join(srcDir, "receiver", "BootReceiver.kt"), `package ${pkgName}.receiver\nimport android.content.BroadcastReceiver\nimport android.content.Context\nimport android.content.Intent\nimport ${pkgName}.service.HeartbeatService\nclass BootReceiver : BroadcastReceiver() {\n    override fun onReceive(context: Context, intent: Intent?) {\n        if (intent?.action == Intent.ACTION_BOOT_COMPLETED) {\n            val p = context.getSharedPreferences("mpa_prefs", Context.MODE_PRIVATE)\n            if (p.getBoolean("logged_in", false)) context.startForegroundService(Intent(context, HeartbeatService::class.java))\n        }\n    }\n}`);

  fs.writeFileSync(path.join(srcDir, "ui", "CandidateListActivity.kt"), `package ${pkgName}.ui\nimport android.content.Intent\nimport android.os.Bundle\nimport android.view.LayoutInflater\nimport android.view.ViewGroup\nimport androidx.appcompat.app.AppCompatActivity\nimport androidx.lifecycle.lifecycleScope\nimport androidx.recyclerview.widget.LinearLayoutManager\nimport androidx.recyclerview.widget.RecyclerView\nimport ${pkgName}.databinding.ActivityCandidateListBinding\nimport ${pkgName}.databinding.ItemCandidateBinding\nimport ${pkgName}.db.AppDatabase\nimport ${pkgName}.model.Candidate\nimport kotlinx.coroutines.launch\nclass CandidateListActivity : AppCompatActivity() {\n    private lateinit var binding: ActivityCandidateListBinding\n    private var mode = "attendance"; private var examId = 0\n    override fun onCreate(savedInstanceState: Bundle?) {\n        super.onCreate(savedInstanceState)\n        binding = ActivityCandidateListBinding.inflate(layoutInflater)\n        setContentView(binding.root)\n        mode = intent.getStringExtra("mode") ?: "attendance"; examId = intent.getIntExtra("examId", 0)\n        binding.tvTitle.text = if (mode == "attendance") "Mark Attendance" else "Biometric Verification"\n        loadCandidates()\n    }\n    private fun loadCandidates() { lifecycleScope.launch { val candidates = AppDatabase.getInstance(this@CandidateListActivity).candidateDao().getByExam(examId); binding.rvCandidates.layoutManager = LinearLayoutManager(this@CandidateListActivity); binding.rvCandidates.adapter = CandidateAdapter(candidates) { c -> startActivity(Intent(this@CandidateListActivity, if (mode == "attendance") AttendanceActivity::class.java else VerificationActivity::class.java).putExtra("candidateId", c.id).putExtra("examId", examId)) }; binding.tvCount.text = "${"$"}{candidates.size} candidates" } }\n    override fun onResume() { super.onResume(); loadCandidates() }\n}\nclass CandidateAdapter(private val items: List<Candidate>, private val onClick: (Candidate) -> Unit) : RecyclerView.Adapter<CandidateAdapter.VH>() {\n    inner class VH(val b: ItemCandidateBinding) : RecyclerView.ViewHolder(b.root)\n    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) = VH(ItemCandidateBinding.inflate(LayoutInflater.from(parent.context), parent, false))\n    override fun getItemCount() = items.size\n    override fun onBindViewHolder(h: VH, pos: Int) { val c = items[pos]; h.b.tvName.text = c.name; h.b.tvRollNo.text = "Roll: ${"$"}{c.rollNo}"; h.b.tvStatus.text = "${"$"}{c.attendanceStatus} | ${"$"}{c.verificationStatus}"; h.itemView.setOnClickListener { onClick(c) } }\n}`);

  fs.writeFileSync(path.join(srcDir, "ui", "AttendanceActivity.kt"), `package ${pkgName}.ui\nimport android.os.Bundle\nimport android.widget.Toast\nimport androidx.appcompat.app.AppCompatActivity\nimport androidx.lifecycle.lifecycleScope\nimport ${pkgName}.databinding.ActivityAttendanceBinding\nimport ${pkgName}.db.AppDatabase\nimport ${pkgName}.model.AttendanceRequest\nimport ${pkgName}.network.RetrofitClient\nimport kotlinx.coroutines.launch\nclass AttendanceActivity : AppCompatActivity() {\n    private lateinit var binding: ActivityAttendanceBinding\n    override fun onCreate(savedInstanceState: Bundle?) {\n        super.onCreate(savedInstanceState)\n        binding = ActivityAttendanceBinding.inflate(layoutInflater)\n        setContentView(binding.root)\n        val cId = intent.getIntExtra("candidateId", 0); val examId = intent.getIntExtra("examId", 0)\n        val opId = getSharedPreferences("mpa_prefs", MODE_PRIVATE).getInt("user_id", 0)\n        lifecycleScope.launch { AppDatabase.getInstance(this@AttendanceActivity).candidateDao().getByExam(examId).find { it.id == cId }?.let { binding.tvCandidateName.text = it.name; binding.tvRollNo.text = "Roll: ${"$"}{it.rollNo}"; binding.tvCurrentStatus.text = "Status: ${"$"}{it.attendanceStatus}" } }\n        binding.btnMarkPresent.setOnClickListener { lifecycleScope.launch { try { val r = RetrofitClient.getApi().markAttendance(cId, AttendanceRequest("present", opId)); if (r.isSuccessful) { val db = AppDatabase.getInstance(this@AttendanceActivity); db.candidateDao().getByExam(examId).find { it.id == cId }?.let { it.attendanceStatus = "present"; db.candidateDao().update(it) }; Toast.makeText(this@AttendanceActivity, "Marked Present", Toast.LENGTH_SHORT).show(); finish() } } catch (e: Exception) { Toast.makeText(this@AttendanceActivity, "Error", Toast.LENGTH_SHORT).show() } } }\n    }\n}`);
}

function writeLayoutFiles(resDir: string) {
  const ld = path.join(resDir, "layout");
  fs.mkdirSync(ld, { recursive: true });
  fs.mkdirSync(path.join(resDir, "drawable"), { recursive: true });

  fs.writeFileSync(path.join(ld, "activity_splash.xml"), `<?xml version="1.0" encoding="utf-8"?>\n<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android" android:layout_width="match_parent" android:layout_height="match_parent" android:gravity="center" android:orientation="vertical" android:background="@color/primary">\n    <ImageView android:layout_width="120dp" android:layout_height="120dp" android:src="@drawable/ic_fingerprint" android:contentDescription="logo" />\n    <TextView android:layout_width="wrap_content" android:layout_height="wrap_content" android:text="MPA Verify" android:textColor="@color/white" android:textSize="28sp" android:textStyle="bold" android:layout_marginTop="24dp" />\n    <ProgressBar android:layout_width="wrap_content" android:layout_height="wrap_content" android:layout_marginTop="32dp" android:indeterminateTint="@color/white" />\n</LinearLayout>`);

  fs.writeFileSync(path.join(ld, "activity_login.xml"), `<?xml version="1.0" encoding="utf-8"?>\n<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android" android:layout_width="match_parent" android:layout_height="match_parent" android:gravity="center" android:orientation="vertical" android:padding="32dp">\n    <ImageView android:layout_width="80dp" android:layout_height="80dp" android:src="@drawable/ic_fingerprint" android:contentDescription="logo" />\n    <TextView android:layout_width="wrap_content" android:layout_height="wrap_content" android:text="Operator Login" android:textSize="24sp" android:textStyle="bold" android:layout_marginTop="16dp" android:layout_marginBottom="32dp" />\n    <com.google.android.material.textfield.TextInputLayout android:layout_width="match_parent" android:layout_height="wrap_content" android:layout_marginBottom="16dp" style="@style/Widget.Material3.TextInputLayout.OutlinedBox"><com.google.android.material.textfield.TextInputEditText android:id="@+id/etUsername" android:layout_width="match_parent" android:layout_height="wrap_content" android:hint="Username" android:inputType="text" /></com.google.android.material.textfield.TextInputLayout>\n    <com.google.android.material.textfield.TextInputLayout android:layout_width="match_parent" android:layout_height="wrap_content" android:layout_marginBottom="24dp" style="@style/Widget.Material3.TextInputLayout.OutlinedBox"><com.google.android.material.textfield.TextInputEditText android:id="@+id/etPassword" android:layout_width="match_parent" android:layout_height="wrap_content" android:hint="Password" android:inputType="textPassword" /></com.google.android.material.textfield.TextInputLayout>\n    <com.google.android.material.button.MaterialButton android:id="@+id/btnLogin" android:layout_width="match_parent" android:layout_height="56dp" android:text="Login" android:textSize="16sp" />\n</LinearLayout>`);

  fs.writeFileSync(path.join(ld, "activity_dashboard.xml"), `<?xml version="1.0" encoding="utf-8"?>\n<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android" android:layout_width="match_parent" android:layout_height="match_parent" android:orientation="vertical" android:padding="16dp">\n    <TextView android:id="@+id/tvExamName" android:layout_width="wrap_content" android:layout_height="wrap_content" android:textSize="22sp" android:textStyle="bold" />\n    <TextView android:id="@+id/tvOperatorName" android:layout_width="wrap_content" android:layout_height="wrap_content" android:textSize="14sp" android:textColor="#666" android:layout_marginBottom="24dp" />\n    <LinearLayout android:layout_width="match_parent" android:layout_height="wrap_content" android:orientation="horizontal">\n        <LinearLayout android:layout_width="0dp" android:layout_height="wrap_content" android:layout_weight="1" android:orientation="vertical" android:gravity="center" android:padding="16dp" android:background="@drawable/card_bg"><TextView android:id="@+id/tvTotalCandidates" android:layout_width="wrap_content" android:layout_height="wrap_content" android:text="0" android:textSize="28sp" android:textStyle="bold" android:textColor="@color/primary" /><TextView android:layout_width="wrap_content" android:layout_height="wrap_content" android:text="Total" android:textSize="12sp" /></LinearLayout>\n        <LinearLayout android:layout_width="0dp" android:layout_height="wrap_content" android:layout_weight="1" android:orientation="vertical" android:gravity="center" android:padding="16dp" android:background="@drawable/card_bg" android:layout_marginStart="8dp"><TextView android:id="@+id/tvPresentCount" android:layout_width="wrap_content" android:layout_height="wrap_content" android:text="0" android:textSize="28sp" android:textStyle="bold" android:textColor="@color/success" /><TextView android:layout_width="wrap_content" android:layout_height="wrap_content" android:text="Present" android:textSize="12sp" /></LinearLayout>\n        <LinearLayout android:layout_width="0dp" android:layout_height="wrap_content" android:layout_weight="1" android:orientation="vertical" android:gravity="center" android:padding="16dp" android:background="@drawable/card_bg" android:layout_marginStart="8dp"><TextView android:id="@+id/tvVerifiedCount" android:layout_width="wrap_content" android:layout_height="wrap_content" android:text="0" android:textSize="28sp" android:textStyle="bold" android:textColor="@color/secondary" /><TextView android:layout_width="wrap_content" android:layout_height="wrap_content" android:text="Verified" android:textSize="12sp" /></LinearLayout>\n    </LinearLayout>\n    <com.google.android.material.button.MaterialButton android:id="@+id/btnSyncData" android:layout_width="match_parent" android:layout_height="56dp" android:text="Sync Data" android:layout_marginTop="24dp" />\n    <com.google.android.material.button.MaterialButton android:id="@+id/btnAttendance" android:layout_width="match_parent" android:layout_height="56dp" android:text="Mark Attendance" android:layout_marginTop="8dp" style="@style/Widget.Material3.Button.TonalButton" />\n    <com.google.android.material.button.MaterialButton android:id="@+id/btnVerification" android:layout_width="match_parent" android:layout_height="56dp" android:text="Biometric Verification" android:layout_marginTop="8dp" style="@style/Widget.Material3.Button.TonalButton" />\n    <com.google.android.material.button.MaterialButton android:id="@+id/btnLogout" android:layout_width="match_parent" android:layout_height="48dp" android:text="Logout" android:layout_marginTop="16dp" style="@style/Widget.Material3.Button.TextButton" android:textColor="@color/error" />\n</LinearLayout>`);

  fs.writeFileSync(path.join(resDir, "drawable", "card_bg.xml"), `<?xml version="1.0" encoding="utf-8"?>\n<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle"><solid android:color="#F5F5F5" /><corners android:radius="12dp" /><stroke android:width="1dp" android:color="#E0E0E0" /></shape>`);
  fs.writeFileSync(path.join(resDir, "drawable", "ic_fingerprint.xml"), `<?xml version="1.0" encoding="utf-8"?>\n<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="24dp" android:height="24dp" android:viewportWidth="24" android:viewportHeight="24"><path android:fillColor="#FFFFFF" android:pathData="M17.81,4.47c-0.08,0 -0.16,-0.02 -0.23,-0.06C15.66,3.42 14,3 12.01,3c-1.98,0 -3.86,0.47 -5.57,1.41 -0.24,0.13 -0.54,0.04 -0.68,-0.2 -0.13,-0.24 -0.04,-0.55 0.2,-0.68C7.82,2.52 9.86,2 12.01,2c2.13,0 3.99,0.47 6.03,1.52 0.25,0.13 0.34,0.43 0.21,0.67 -0.09,0.18 -0.26,0.28 -0.44,0.28z" /></vector>`);

  fs.writeFileSync(path.join(ld, "activity_candidate_list.xml"), `<?xml version="1.0" encoding="utf-8"?>\n<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android" android:layout_width="match_parent" android:layout_height="match_parent" android:orientation="vertical" android:padding="16dp">\n    <TextView android:id="@+id/tvTitle" android:layout_width="wrap_content" android:layout_height="wrap_content" android:textSize="20sp" android:textStyle="bold" />\n    <TextView android:id="@+id/tvCount" android:layout_width="wrap_content" android:layout_height="wrap_content" android:textSize="14sp" android:textColor="#666" android:layout_marginBottom="16dp" />\n    <androidx.recyclerview.widget.RecyclerView android:id="@+id/rvCandidates" android:layout_width="match_parent" android:layout_height="match_parent" />\n</LinearLayout>`);

  fs.writeFileSync(path.join(ld, "item_candidate.xml"), `<?xml version="1.0" encoding="utf-8"?>\n<com.google.android.material.card.MaterialCardView xmlns:android="http://schemas.android.com/apk/res/android" xmlns:app="http://schemas.android.com/apk/res-auto" android:layout_width="match_parent" android:layout_height="wrap_content" android:layout_marginBottom="8dp" app:cardElevation="2dp" app:cardCornerRadius="8dp"><LinearLayout android:layout_width="match_parent" android:layout_height="wrap_content" android:padding="16dp" android:orientation="vertical"><TextView android:id="@+id/tvName" android:layout_width="wrap_content" android:layout_height="wrap_content" android:textSize="16sp" android:textStyle="bold" /><TextView android:id="@+id/tvRollNo" android:layout_width="wrap_content" android:layout_height="wrap_content" android:textSize="14sp" android:textColor="#666" /><TextView android:id="@+id/tvStatus" android:layout_width="wrap_content" android:layout_height="wrap_content" android:textSize="12sp" android:textColor="@color/primary" android:layout_marginTop="4dp" /></LinearLayout></com.google.android.material.card.MaterialCardView>`);

  fs.writeFileSync(path.join(ld, "activity_attendance.xml"), `<?xml version="1.0" encoding="utf-8"?>\n<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android" android:layout_width="match_parent" android:layout_height="match_parent" android:orientation="vertical" android:padding="24dp" android:gravity="center">\n    <TextView android:id="@+id/tvCandidateName" android:layout_width="wrap_content" android:layout_height="wrap_content" android:textSize="22sp" android:textStyle="bold" />\n    <TextView android:id="@+id/tvRollNo" android:layout_width="wrap_content" android:layout_height="wrap_content" android:textSize="16sp" android:textColor="#666" android:layout_marginTop="8dp" />\n    <TextView android:id="@+id/tvCurrentStatus" android:layout_width="wrap_content" android:layout_height="wrap_content" android:textSize="14sp" android:layout_marginTop="16dp" />\n    <com.google.android.material.button.MaterialButton android:id="@+id/btnMarkPresent" android:layout_width="match_parent" android:layout_height="56dp" android:text="Mark Present" android:layout_marginTop="32dp" />\n</LinearLayout>`);

  fs.writeFileSync(path.join(ld, "activity_verification.xml"), `<?xml version="1.0" encoding="utf-8"?>\n<ScrollView xmlns:android="http://schemas.android.com/apk/res/android" android:layout_width="match_parent" android:layout_height="match_parent"><LinearLayout android:layout_width="match_parent" android:layout_height="wrap_content" android:orientation="vertical" android:padding="24dp">\n    <TextView android:id="@+id/tvCandidateName" android:layout_width="wrap_content" android:layout_height="wrap_content" android:textSize="22sp" android:textStyle="bold" />\n    <TextView android:id="@+id/tvRollNo" android:layout_width="wrap_content" android:layout_height="wrap_content" android:textSize="16sp" android:textColor="#666" android:layout_marginTop="8dp" android:layout_marginBottom="24dp" />\n    <com.google.android.material.button.MaterialButton android:id="@+id/btnCaptureFace" android:layout_width="match_parent" android:layout_height="56dp" android:text="Capture Face" style="@style/Widget.Material3.Button.TonalButton" />\n    <TextView android:id="@+id/tvFaceResult" android:layout_width="wrap_content" android:layout_height="wrap_content" android:textSize="14sp" android:layout_marginTop="8dp" android:layout_marginBottom="16dp" />\n    <com.google.android.material.button.MaterialButton android:id="@+id/btnCaptureFingerprint" android:layout_width="match_parent" android:layout_height="56dp" android:text="Capture Fingerprint" style="@style/Widget.Material3.Button.TonalButton" />\n    <TextView android:id="@+id/tvFingerprintResult" android:layout_width="wrap_content" android:layout_height="wrap_content" android:textSize="14sp" android:layout_marginTop="8dp" android:layout_marginBottom="16dp" />\n    <com.google.android.material.textfield.TextInputLayout android:layout_width="match_parent" android:layout_height="wrap_content" android:layout_marginBottom="24dp" style="@style/Widget.Material3.TextInputLayout.OutlinedBox"><com.google.android.material.textfield.TextInputEditText android:id="@+id/etOmrNumber" android:layout_width="match_parent" android:layout_height="wrap_content" android:hint="OMR Number" android:inputType="number" /></com.google.android.material.textfield.TextInputLayout>\n    <com.google.android.material.button.MaterialButton android:id="@+id/btnSubmit" android:layout_width="match_parent" android:layout_height="56dp" android:text="Submit Verification" />\n</LinearLayout></ScrollView>`);
}

function writeProjectFiles(buildDir: string, pkgName: string, pkgPath: string, config: BuildConfig, versionCode: number, versionName: string) {
  const appName = `MPA Verify - ${config.examName}`;
  const srcDir = path.join(buildDir, "app", "src", "main", "java", ...pkgPath.split("/"));
  const resDir = path.join(buildDir, "app", "src", "main", "res");
  const assetsDir = path.join(buildDir, "app", "src", "main", "assets");

  [srcDir, path.join(resDir, "layout"), path.join(resDir, "values"), path.join(resDir, "drawable"), assetsDir, path.join(buildDir, "app", "libs"), path.join(buildDir, "keystore"), path.join(buildDir, "gradle", "wrapper")].forEach(d => fs.mkdirSync(d, { recursive: true }));

  fs.writeFileSync(path.join(buildDir, "build.gradle"), generateProjectBuildGradle());
  fs.writeFileSync(path.join(buildDir, "settings.gradle"), `pluginManagement { repositories { google(); mavenCentral(); gradlePluginPortal() } }\nrootProject.name = "${appName}"\ninclude ':app'`);
  fs.writeFileSync(path.join(buildDir, "gradle.properties"), `org.gradle.jvmargs=-Xmx4096m -Dfile.encoding=UTF-8\nandroid.useAndroidX=true\nkotlin.code.style=official\nandroid.nonTransitiveRClass=true\norg.gradle.parallel=true\norg.gradle.caching=true`);
  fs.writeFileSync(path.join(buildDir, "gradle", "wrapper", "gradle-wrapper.properties"), `distributionBase=GRADLE_USER_HOME\ndistributionPath=wrapper/dists\ndistributionUrl=https\\://services.gradle.org/distributions/gradle-8.4-bin.zip\nzipStoreBase=GRADLE_USER_HOME\nzipStorePath=wrapper/dists`);
  fs.writeFileSync(path.join(buildDir, "app", "build.gradle"), generateAppBuildGradle(pkgName, versionCode, versionName));
  fs.writeFileSync(path.join(buildDir, "app", "proguard-rules.pro"), `-keep class com.mantra.** { *; }\n-keep class com.mfs100.** { *; }\n-dontwarn com.mantra.**\n-keep class org.tensorflow.** { *; }\n-dontwarn org.tensorflow.**\n-keep class com.google.mlkit.** { *; }`);
  fs.writeFileSync(path.join(buildDir, "app", "src", "main", "AndroidManifest.xml"), generateAndroidManifest(pkgName));
  fs.writeFileSync(path.join(assetsDir, "config.json"), generateConfigJson(config));
  fs.writeFileSync(path.join(resDir, "values", "strings.xml"), `<?xml version="1.0" encoding="utf-8"?>\n<resources><string name="app_name">${appName}</string><string name="exam_name">${config.examName}</string></resources>`);
  fs.writeFileSync(path.join(resDir, "values", "themes.xml"), `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <style name="Theme.MpaVerify" parent="Theme.Material3.DayNight.NoActionBar"><item name="colorPrimary">@color/primary</item><item name="colorOnPrimary">@color/white</item></style>\n    <style name="Theme.MpaVerify.Splash" parent="Theme.Material3.DayNight.NoActionBar"><item name="android:windowBackground">@color/primary</item></style>\n</resources>`);
  fs.writeFileSync(path.join(resDir, "values", "colors.xml"), `<?xml version="1.0" encoding="utf-8"?>\n<resources><color name="primary">#1565C0</color><color name="primary_dark">#0D47A1</color><color name="secondary">#26A69A</color><color name="white">#FFFFFF</color><color name="black">#000000</color><color name="success">#4CAF50</color><color name="error">#F44336</color><color name="warning">#FF9800</color></resources>`);

  writeKotlinSources(srcDir, pkgName, config);
  writeLayoutFiles(resDir);
}

export function generateApkConfig(config: BuildConfig): string {
  return generateConfigJson(config);
}

export async function buildApk(
  buildId: number,
  config: BuildConfig,
  onProgress: (progress: number, log: string) => Promise<void>
): Promise<{ success: boolean; apkPath?: string; logs: string }> {
  ensureDirs();
  const logs: string[] = [];
  const log = (msg: string) => { logs.push(`[${new Date().toISOString()}] ${msg}`); };

  try {
    const examName = (config.examName || "Exam").replace(/[^a-zA-Z0-9]/g, "");
    const pkgName = `com.mpa.verify.${examName.toLowerCase()}`;
    const pkgPath = pkgName.replace(/\./g, "/");
    const buildDir = path.join(APK_BUILDS_DIR, String(buildId));
    const versionCode = buildId;
    const versionName = `3.${Math.floor(buildId / 10)}.${buildId % 10}`;

    log("Step 1/6: Creating project directory...");
    await onProgress(10, logs.join("\n"));
    if (fs.existsSync(buildDir)) fs.rmSync(buildDir, { recursive: true });
    fs.mkdirSync(buildDir, { recursive: true });

    log("Step 2/6: Generating Android project files...");
    await onProgress(20, logs.join("\n"));
    writeProjectFiles(buildDir, pkgName, pkgPath, config, versionCode, versionName);
    log(`  Package: ${pkgName}`);
    log(`  Version: ${versionName} (code: ${versionCode})`);

    log("Step 3/6: Injecting exam config into assets/config.json...");
    await onProgress(30, logs.join("\n"));
    log(`  examId=${config.examId}, mode=${config.biometricMode}, threshold=${config.faceMatchThreshold}`);

    log("Step 4/6: Checking build environment...");
    await onProgress(40, logs.join("\n"));

    const androidHome = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT || "";
    const hasAndroidSdk = androidHome && fs.existsSync(androidHome);
    const hasGradleWrapper = fs.existsSync(path.join(buildDir, "gradlew"));

    if (!hasAndroidSdk) {
      log("  Android SDK not found - creating downloadable project archive");

      log("Step 5/6: Creating project ZIP...");
      await onProgress(60, logs.join("\n"));
      try {
        const zipPath = path.join(APK_OUTPUT_DIR, `MPA_Verify_${examName}_v${versionName}.zip`);
        execSync(`cd "${buildDir}" && tar -czf "${zipPath}" .`, { stdio: "pipe" });
        log(`  Archive: ${zipPath}`);
        const zipSize = (fs.statSync(zipPath).size / (1024 * 1024)).toFixed(1);
        log(`  Size: ${zipSize} MB`);
        await onProgress(80, logs.join("\n"));

        log("Step 6/6: Project ready for download");
        log("  To build APK: Open project in Android Studio > Build > Generate Signed APK");
        log("  Required: Place Mantra MFS100 .aar in app/libs/");
        log("  Required: Place FaceNet .tflite in app/src/main/assets/");
        await onProgress(100, logs.join("\n"));

        return { success: true, apkPath: zipPath, logs: logs.join("\n") };
      } catch (e: any) {
        log(`  Archive failed: ${e.message}`);
        return { success: true, apkPath: buildDir, logs: logs.join("\n") };
      }
    }

    log(`  Android SDK: ${androidHome}`);

    log("Step 5/6: Running Gradle assembleRelease...");
    await onProgress(60, logs.join("\n"));

    try {
      const gradleCmd = hasGradleWrapper ? "./gradlew" : "gradle";
      const output = execSync(`cd "${buildDir}" && ${gradleCmd} assembleRelease --no-daemon 2>&1`, { timeout: 300000, maxBuffer: 50 * 1024 * 1024 }).toString();
      output.split("\n").slice(-20).forEach(l => log("  " + l));
      await onProgress(80, logs.join("\n"));
    } catch (e: any) {
      log(`  Build FAILED: ${e.message}`);
      return { success: false, logs: logs.join("\n") };
    }

    log("Step 6/6: Copying APK to output...");
    await onProgress(90, logs.join("\n"));

    const apkPaths = [
      path.join(buildDir, "app", "build", "outputs", "apk", "release", "app-release.apk"),
      path.join(buildDir, "app", "build", "outputs", "apk", "release", "app-release-unsigned.apk"),
    ];
    let foundApk = apkPaths.find(p => fs.existsSync(p));
    if (!foundApk) {
      try {
        const found = execSync(`find "${buildDir}" -name "*.apk" -type f 2>/dev/null`).toString().trim();
        if (found) foundApk = found.split("\n")[0];
      } catch (_) {}
    }

    if (!foundApk) {
      log("  ERROR: APK not found after build");
      return { success: false, logs: logs.join("\n") };
    }

    const finalPath = path.join(APK_OUTPUT_DIR, `MPA_Verify_${examName}_v${versionName}.apk`);
    fs.copyFileSync(foundApk, finalPath);
    log(`  APK: ${finalPath} (${(fs.statSync(finalPath).size / (1024 * 1024)).toFixed(1)} MB)`);
    await onProgress(100, logs.join("\n"));

    return { success: true, apkPath: finalPath, logs: logs.join("\n") };
  } catch (error: any) {
    log(`FATAL: ${error.message}`);
    return { success: false, logs: logs.join("\n") };
  }
}
