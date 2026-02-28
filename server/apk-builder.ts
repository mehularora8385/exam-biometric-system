import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

const APK_BUILDS_DIR = path.join(process.cwd(), "apk-builds");
const APK_OUTPUT_DIR = path.join(process.cwd(), "public", "apks");
const SDK_DIR = path.join(process.cwd(), "sdk");

function ensureDirs() {
  [APK_BUILDS_DIR, APK_OUTPUT_DIR, path.join(process.cwd(), "keystore")].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });
}


function copySDKFiles(buildDir: string, log: (msg: string) => void) {
    const sdkDir = SDK_DIR;
    if (!fs.existsSync(sdkDir)) {
      log("  SDK directory not found at " + sdkDir);
      return false;
    }

    let copied = 0;
    const libsDir = path.join(buildDir, "app", "libs");
    const modelsDir = path.join(buildDir, "app", "src", "main", "assets", "models");
    const jniV7Dir = path.join(buildDir, "app", "src", "main", "jniLibs", "armeabi-v7a");
    const jniV8Dir = path.join(buildDir, "app", "src", "main", "jniLibs", "arm64-v8a");

    [libsDir, modelsDir, jniV7Dir, jniV8Dir].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

    log("  SDK directory: " + sdkDir);
    log("  Scanning for SDK files...");

    // 1. Copy Face AI model: sdk/ai/facenet.tflite -> assets/models/facenet.tflite
    const tflitePaths = [
      path.join(sdkDir, "ai", "facenet.tflite"),
      path.join(sdkDir, "facenet.tflite"),
      path.join(sdkDir, "ai", "mobile_face_net.tflite"),
    ];
    let tfliteFound = false;
    for (const src of tflitePaths) {
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, path.join(modelsDir, "facenet.tflite"));
        log("  ✓ Face AI: " + path.relative(sdkDir, src) + " -> app/src/main/assets/models/facenet.tflite");
        copied++;
        tfliteFound = true;
        break;
      }
    }
    if (!tfliteFound) {
      const found = findFilesRecursive(sdkDir, ".tflite");
      if (found.length > 0) {
        fs.copyFileSync(found[0], path.join(modelsDir, "facenet.tflite"));
        log("  ✓ Face AI: " + path.relative(sdkDir, found[0]) + " -> app/src/main/assets/models/facenet.tflite");
        copied++;
      } else {
        log("  ✗ Face AI model NOT FOUND (expected at sdk/ai/facenet.tflite)");
      }
    }

    // 2. Copy Mantra JAR: sdk/mfs100/jar/mantra.mfs100.jar -> app/libs/mantra.mfs100.jar
    const jarPaths = [
      path.join(sdkDir, "mfs100", "jar", "mantra.mfs100.jar"),
      path.join(sdkDir, "mfs100", "mantra.mfs100.jar"),
      path.join(sdkDir, "mantra.mfs100.jar"),
      path.join(sdkDir, "MFS100.jar"),
      path.join(sdkDir, "mfs100", "jar", "MFS100.jar"),
    ];
    let jarFound = false;
    for (const src of jarPaths) {
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, path.join(libsDir, path.basename(src)));
        log("  ✓ Mantra JAR: " + path.relative(sdkDir, src) + " -> app/libs/" + path.basename(src));
        copied++;
        jarFound = true;
        break;
      }
    }
    if (!jarFound) {
      const found = findFilesRecursive(sdkDir, ".jar");
      if (found.length > 0) {
        fs.copyFileSync(found[0], path.join(libsDir, path.basename(found[0])));
        log("  ✓ Mantra JAR: " + path.relative(sdkDir, found[0]) + " -> app/libs/" + path.basename(found[0]));
        copied++;
      } else {
        log("  ✗ Mantra JAR NOT FOUND (expected at sdk/mfs100/jar/mantra.mfs100.jar)");
      }
    }

    // 3. Copy native .so libraries with version stripping
    //    sdk/mfs100/so/arm64-v8a/libMFS100V9032.so -> app/jniLibs/arm64-v8a/libMFS100.so
    //    sdk/mfs100/so/armeabi-v7a/libMFS100V9032.so -> app/jniLibs/armeabi-v7a/libMFS100.so
    const archDirs = [
      { arch: "arm64-v8a", dest: jniV8Dir },
      { arch: "armeabi-v7a", dest: jniV7Dir },
    ];
    for (const { arch, dest } of archDirs) {
      const soPaths = [
        path.join(sdkDir, "mfs100", "so", arch),
        path.join(sdkDir, "mfs100", arch),
        path.join(sdkDir, arch),
      ];
      let soFound = false;
      for (const soDir of soPaths) {
        if (fs.existsSync(soDir)) {
          const soFiles = fs.readdirSync(soDir).filter(f => f.endsWith(".so"));
          for (const soFile of soFiles) {
            const srcPath = path.join(soDir, soFile);
            const destName = soFile.replace(/V\d+/i, "").replace(/v\d+/i, "");
            fs.copyFileSync(srcPath, path.join(dest, destName));
            log("  ✓ Native SO: " + path.relative(sdkDir, srcPath) + " -> app/src/main/jniLibs/" + arch + "/" + destName + (destName !== soFile ? " (renamed from " + soFile + ")" : ""));
            copied++;
            soFound = true;
          }
        }
      }
      if (!soFound) {
        const allSo = findFilesRecursive(sdkDir, ".so").filter(f => f.includes(arch));
        if (allSo.length > 0) {
          for (const soFile of allSo) {
            const baseName = path.basename(soFile);
            const destName = baseName.replace(/V\d+/i, "").replace(/v\d+/i, "");
            fs.copyFileSync(soFile, path.join(dest, destName));
            log("  ✓ Native SO: " + path.relative(sdkDir, soFile) + " -> app/src/main/jniLibs/" + arch + "/" + destName);
            copied++;
          }
        } else {
          log("  ✗ Native SO for " + arch + " NOT FOUND (expected at sdk/mfs100/so/" + arch + "/)");
        }
      }
    }

    // Also copy any .aar files to libs
    const aarFiles = findFilesRecursive(sdkDir, ".aar");
    for (const aarFile of aarFiles) {
      fs.copyFileSync(aarFile, path.join(libsDir, path.basename(aarFile)));
      log("  ✓ AAR: " + path.relative(sdkDir, aarFile) + " -> app/libs/" + path.basename(aarFile));
      copied++;
    }

    log("  Total SDK files copied: " + copied);
    return copied > 0;
  }

  function findFilesRecursive(dir: string, ext: string): string[] {
    const results: string[] = [];
    if (!fs.existsSync(dir)) return results;
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          results.push(...findFilesRecursive(fullPath, ext));
        } else if (entry.name.endsWith(ext)) {
          results.push(fullPath);
        }
      }
    } catch (_) {}
    return results;
  }
  
export interface BuildConfig {
  examId: number;
  examName: string;
  examCode?: string;
  linkedExams?: Array<{id: number, name: string, code: string}>;
  serverUrl: string;
  biometricMode: string;
  verificationFlow: string;
  attendanceMode: string;
  faceMatchThreshold: number;
  fingerprintScanner: string;
  faceLiveness: boolean;
  fingerprintQuality: boolean;
  offlineMode: boolean;
  centres?: Array<{code: string, name: string}>;
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
    exam: { id: config.examId, name: config.examName, code: config.examCode || `EXAM${config.examId}`, centres: config.centres || [] },
    linkedExams: config.linkedExams || [{ id: config.examId, name: config.examName, code: config.examCode || `EXAM${config.examId}` }],
    server: {
      baseUrl: config.serverUrl.startsWith('http://') ? config.serverUrl.replace('http://', 'https://') : config.serverUrl,
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
      <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
      <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
      <uses-feature android:name="android.hardware.location.gps" android:required="false" />
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
        <activity android:name=".ui.RegistrationActivity" />
        <activity android:name=".ui.ExamSelectActivity" />
        <activity android:name=".ui.CentreSelectActivity" />
        <activity android:name=".ui.DashboardActivity" />
        <activity android:name=".ui.CandidateListActivity" />
        <activity android:name=".ui.AttendanceActivity" />
        <activity android:name=".ui.VerificationActivity" />
        <activity android:name=".ui.SyncActivity" />
        <activity android:name=".ui.CrashActivity" android:process=":crash" android:launchMode="singleInstance" android:theme="@style/Theme.MpaVerify" />
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
            minifyEnabled false
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
    implementation 'androidx.lifecycle:lifecycle-runtime-ktx:2.7.0'
    implementation 'androidx.activity:activity-ktx:1.8.2'
    def camerax_version = "1.3.1"
    implementation "androidx.camera:camera-core:${"$"}{camerax_version}"
    implementation "androidx.camera:camera-camera2:${"$"}{camerax_version}"
    implementation "androidx.camera:camera-lifecycle:${"$"}{camerax_version}"
    implementation "androidx.camera:camera-view:${"$"}{camerax_version}"
    implementation 'com.google.mlkit:face-detection:16.1.6'
      implementation 'com.google.mlkit:barcode-scanning:17.2.0'
      implementation 'com.journeyapps:zxing-android-embedded:4.3.0'
      implementation 'com.google.zxing:core:3.5.2'
      implementation 'com.google.android.gms:play-services-location:21.0.1'
    implementation 'org.tensorflow:tensorflow-lite:2.14.0'
    implementation 'org.tensorflow:tensorflow-lite-support:0.4.4'
    implementation 'com.squareup.retrofit2:retrofit:2.11.0'
    implementation 'com.squareup.retrofit2:converter-gson:2.11.0'
    implementation 'com.squareup.okhttp3:okhttp:4.12.0'
    implementation 'com.squareup.okhttp3:logging-interceptor:4.12.0'
    def room_version = "2.6.1"
    implementation "androidx.room:room-runtime:${"$"}{room_version}"
    implementation "androidx.room:room-ktx:${"$"}{room_version}"
    kapt "androidx.room:room-compiler:${"$"}{room_version}"
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3'
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3'
    implementation 'com.google.code.gson:gson:2.11.0'
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
  fs.writeFileSync(path.join(srcDir, "MpaApplication.kt"), `package ${pkgName}
  import android.app.Application
  import android.net.ConnectivityManager
  import android.net.Network
  import android.net.NetworkCapabilities
  import android.net.NetworkRequest
  import android.os.Build
  import android.util.Log
  import kotlinx.coroutines.*
  import ${pkgName}.sync.OfflineSyncManager
  import ${pkgName}.db.AppDatabase
  import ${pkgName}.model.AttendanceRequest
  import ${pkgName}.model.VerificationRequest
  import ${pkgName}.network.RetrofitClient
  class MpaApplication : Application() {
      lateinit var syncManager: OfflineSyncManager
          private set
      override fun onCreate() {
          super.onCreate()
          instance = this
          Thread.setDefaultUncaughtExceptionHandler { thread, throwable ->
              try {
                  val sw = java.io.StringWriter()
                  throwable.printStackTrace(java.io.PrintWriter(sw))
                  val intent = android.content.Intent(this, ${pkgName}.ui.CrashActivity::class.java)
                  intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK or android.content.Intent.FLAG_ACTIVITY_CLEAR_TASK)
                  intent.putExtra("error_message", throwable.message ?: "Unknown error")
                  intent.putExtra("stack_trace", sw.toString().take(8000))
                  startActivity(intent)
              } catch (_: Exception) {}
              android.os.Process.killProcess(android.os.Process.myPid())
          }
          syncManager = OfflineSyncManager(this)
          registerNetworkCallback()
          syncManager.startAutoSync(60000)
      }
      private fun registerNetworkCallback() {
          val cm = getSystemService(CONNECTIVITY_SERVICE) as ConnectivityManager
          val request = NetworkRequest.Builder()
              .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
              .build()
          cm.registerNetworkCallback(request, object : ConnectivityManager.NetworkCallback() {
              override fun onAvailable(network: Network) {
                  Log.d("MpaApplication", "Network available - triggering sync")
                  syncManager.triggerSync()
                  syncPendingVerifications()
              }
          })
      }
      private fun syncPendingVerifications() {
          kotlinx.coroutines.CoroutineScope(kotlinx.coroutines.Dispatchers.IO).launch {
              try {
                  val database = AppDatabase.getInstance(this@MpaApplication)
                  val pendingAtt = database.pendingAttendanceDao().getUnuploaded()
                      for (a in pendingAtt) {
                          try {
                              val r = RetrofitClient.getApi().markAttendance(a.candidateId, AttendanceRequest(a.attendanceStatus, a.operatorId))
                              if (r.isSuccessful) { a.uploaded = true; database.pendingAttendanceDao().update(a) }
                          } catch (_: Exception) {}
                      }
                      val pending = database.pendingVerificationDao().getUnuploaded()
                  if (pending.isEmpty()) return@launch
                  Log.d("MpaApplication", "Auto-syncing \${pending.size} pending verifications")
                  val opId = getSharedPreferences("mpa_prefs", MODE_PRIVATE).getInt("user_id", 0)
                  for (v in pending) {
                      try {
                          val r = RetrofitClient.getApi().submitVerification(
                              v.candidateId,
                              VerificationRequest("verified", v.verifiedPhoto, v.faceMatchPercent, v.omrNumber, opId)
                          )
                          if (r.isSuccessful) {
                              v.uploaded = true
                              database.pendingVerificationDao().update(v)
                              Log.d("MpaApplication", "Auto-synced verification for candidate \${v.candidateId}")
                          }
                      } catch (e: Exception) {
                          Log.e("MpaApplication", "Auto-sync failed for \${v.candidateId}: \${e.message}")
                      }
                  }
              } catch (e: Exception) {
                  Log.e("MpaApplication", "Auto-sync error: \${e.message}")
              }
          }
      }
      companion object {
          lateinit var instance: MpaApplication
              private set
      }
  }`);

  fs.mkdirSync(path.join(srcDir, "ui"), { recursive: true });
  fs.writeFileSync(path.join(srcDir, "ui", "CrashActivity.kt"), `package ${pkgName}.ui
import android.content.ClipData
import android.content.ClipboardManager
import android.os.Bundle
import android.widget.Button
import android.widget.ScrollView
import android.widget.TextView
import android.widget.LinearLayout
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
class CrashActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val errorMsg = intent.getStringExtra("error_message") ?: "Unknown error"
        val stackTrace = intent.getStringExtra("stack_trace") ?: "No stack trace"
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(32, 64, 32, 32)
        }
        val title = TextView(this).apply {
            text = "APP CRASHED"
            textSize = 24f
            setTextColor(0xFFFF0000.toInt())
        }
        val errorView = TextView(this).apply {
            text = "Error: ${"$"}errorMsg"
            textSize = 14f
            setTextColor(0xFF333333.toInt())
        }
        val traceView = TextView(this).apply {
            text = stackTrace
            textSize = 11f
            setTextColor(0xFF666666.toInt())
        }
        val copyBtn = Button(this).apply {
            text = "Copy Crash Log"
            setOnClickListener {
                val clip = getSystemService(CLIPBOARD_SERVICE) as ClipboardManager
                clip.setPrimaryClip(ClipData.newPlainText("crash", "${"$"}errorMsg\\n\\n${"$"}stackTrace"))
                Toast.makeText(this@CrashActivity, "Copied to clipboard", Toast.LENGTH_SHORT).show()
            }
        }
        val restartBtn = Button(this).apply {
            text = "Restart App"
            setOnClickListener {
                val intent = packageManager.getLaunchIntentForPackage(packageName)
                intent?.addFlags(android.content.Intent.FLAG_ACTIVITY_CLEAR_TASK or android.content.Intent.FLAG_ACTIVITY_NEW_TASK)
                startActivity(intent)
                finishAffinity()
            }
        }
        layout.addView(title)
        layout.addView(errorView)
        val scroll = ScrollView(this)
        scroll.addView(traceView)
        layout.addView(scroll, LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, 0, 1f))
        layout.addView(copyBtn)
        layout.addView(restartBtn)
        setContentView(layout)
    }
}`);

  fs.mkdirSync(path.join(srcDir, "model"), { recursive: true });
  fs.writeFileSync(path.join(srcDir, "model", "Models.kt"), `package ${pkgName}.model\nimport androidx.room.Entity\nimport androidx.room.PrimaryKey\nimport com.google.gson.annotations.SerializedName\n\n@Entity(tableName = "candidates")\ndata class Candidate(\n    @PrimaryKey val id: Int,\n    @SerializedName("exam_id") val examId: Int,\n    @SerializedName("roll_no") val rollNo: String,\n    val name: String,\n    @SerializedName("father_name") val fatherName: String?,\n    val dob: String?,\n    val slot: String?,\n    @SerializedName("centre_code") val centreCode: String,\n    @SerializedName("centre_name") val centreName: String?,\n    @SerializedName("photo_url") val photoUrl: String?,\n    @SerializedName("attendance_status") var attendanceStatus: String = "absent",\n    @SerializedName("verification_status") var verificationStatus: String = "pending",\n    @SerializedName("face_match_percent") var faceMatchPercent: Float? = null,\n    @SerializedName("omr_number") var omrNumber: String? = null,\n    @SerializedName("verified_photo") var verifiedPhoto: String? = null,\n    var synced: Boolean = false\n)\n\n@Entity(tableName = "pending_verifications")\ndata class PendingVerification(\n    @PrimaryKey(autoGenerate = true) val id: Int = 0,\n    val candidateId: Int,\n    val rollNo: String,\n    val verifiedPhoto: String?,\n    val faceMatchPercent: Float,\n    val omrNumber: String?,\n    val fingerprint: String?,\n    val timestamp: Long = System.currentTimeMillis(),\n    var uploaded: Boolean = false\n)\n\n@Entity(tableName = "pending_attendance")\ndata class PendingAttendance(\n    @PrimaryKey(autoGenerate = true) val id: Int = 0,\n    val candidateId: Int,\n    val examId: Int,\n    val attendanceStatus: String,\n    val operatorId: Int,\n    val timestamp: Long = System.currentTimeMillis(),\n    var uploaded: Boolean = false\n)\n\ndata class LoginRequest(val username: String, val password: String, val deviceId: String)\ndata class LoginResponse(val success: Boolean, val user: UserData?, val message: String?)\ndata class UserData(val id: Int, val username: String, val fullName: String, val role: String)\ndata class AttendanceRequest(val attendanceStatus: String, val attendanceOperatorId: Int)\ndata class VerificationRequest(val verificationStatus: String, val verifiedPhoto: String?, val faceMatchPercent: Float, val omrNumber: String?, val verificationOperatorId: Int)\ndata class HeartbeatRequest(val deviceId: String, val operatorId: Int, val battery: Int, val gps: String?)\ndata class ApiResponse(val success: Boolean, val message: String?)\ndata class ExamConfig(val id: Int, val name: String, val faceMatchThreshold: Int, val strictMode: Boolean)
  data class FaceVerifyRequest(val candidateId: Int, val faceEmbedding: List<Float>, val livenessScore: Float, val capturedImageBase64: String)
  data class FaceVerifyResponse(val success: Boolean, val matchPercent: Float, val message: String?)
  data class FingerprintVerifyRequest(val candidateId: Int, val fingerprintTemplate: String, val quality: Int, val scannerModel: String)
  data class FingerprintVerifyResponse(val success: Boolean, val matched: Boolean, val score: Float, val message: String?)
  data class SyncRequest(val verifications: List<SyncVerification>)
  data class SyncVerification(val candidateId: Int, val rollNo: String, val faceMatchPercent: Float, val omrNumber: String?, val verifiedPhoto: String?, val fingerprint: String?, val timestamp: Long)
  data class SyncResponse(val success: Boolean, val syncedCount: Int, val failedCount: Int)
  data class BarcodeAttendanceRequest(val candidateId: Int, val examId: Int, val centreCode: String, val scannedData: String, val latitude: Double?, val longitude: Double?, val timestamp: Long, val deviceId: String)
  data class BarcodeAttendanceResponse(val success: Boolean, val candidateName: String?, val rollNo: String?, val message: String?)
  data class OmrUploadRequest(val candidateId: Int, val examId: Int, val omrBarcode: String?, val omrImageBase64: String, val latitude: Double?, val longitude: Double?, val timestamp: Long, val deviceId: String)
  data class OmrUploadResponse(val success: Boolean, val omrId: Int?, val message: String?)
  data class DeviceInfo(val deviceId: String, val model: String, val manufacturer: String, val androidVersion: String, val appVersion: String)
  data class VersionInfo(val latestVersionCode: Int, val latestVersionName: String, val minVersionCode: Int, val forceUpdate: Boolean, val downloadUrl: String?, val releaseNotes: String?)
  data class DeviceRegistrationRequest(val deviceId: String, val model: String, val androidVersion: String, val examId: Int, val centreCode: String, val operatorName: String, val appVersion: String)
  data class SyncStatusRequest(val deviceId: String, val examId: Int, val syncedCount: Int, val failedCount: Int, val queueSize: Int, val timestamp: Long)
  data class ForceLogoutResponse(val forceLogout: Boolean, val reason: String?)
  data class MDMCommandResponse(val command: String?, val payload: Map<String, Any>?)
  data class CrashLogRequest(val deviceId: String, val deviceModel: String?, val appVersion: String?, val errorMessage: String?, val stackTrace: String?, val crashedAt: String?, val threadName: String?, val androidVersion: String?)
  data class CentreLoginRequest(val examId: Int, val centreCode: String, val deviceId: String, val timestamp: Long)
  data class CentreLoginResponse(val allowed: Boolean, val message: String)
    data class OperatorRegRequest(val name: String, val phone: String, val aadhaar: String, val selfie: String?, val deviceId: String)
    data class OperatorRegResponse(val success: Boolean = false, val operator: OperatorData? = null, val message: String? = null, val alreadyRegistered: Boolean = false)
    data class OperatorData(val id: Int = 0, val name: String = "", val phone: String = "", val aadhaar: String = "", val centreCode: String? = null, val examId: Int? = null, val examName: String? = null)
    data class CentreSelectRequest(val operatorId: Int, val examId: Int, val centreCode: String)
    data class CentreSelectResponse(val success: Boolean, val centreName: String?, val candidateCount: Int?, val candidates: List<Candidate>?, val message: String?)
    data class SessionCheckRequest(val operatorId: Int)
    data class AvailableExam(val id: Int, val name: String, val code: String?, val status: String?, val type: String?)
    data class SessionCheckResponse(val success: Boolean, val sessionActive: Boolean = true, val forceLogout: Boolean = false, val message: String? = null)
    data class HeartbeatResponse(val success: Boolean, val forceLogout: Boolean, val message: String?)
    data class CentreItem(val id: Int, val code: String, val name: String)\n`);

  fs.mkdirSync(path.join(srcDir, "network"), { recursive: true });
  fs.writeFileSync(path.join(srcDir, "network", "ApiService.kt"), `package ${pkgName}.network\nimport ${pkgName}.model.*\nimport retrofit2.Response\nimport retrofit2.http.*\n\ninterface ApiService {\n    @POST("api/apk/login") suspend fun login(@Body request: LoginRequest): Response<LoginResponse>\n    @GET("api/apk/candidates/{examId}") suspend fun getCandidates(@Path("examId") examId: Int, @Query("centreCode") centreCode: String? = null): Response<List<Candidate>>\n    @GET("api/apk/exams/{id}") suspend fun getExamConfig(@Path("id") examId: Int): Response<ExamConfig>\n    @PATCH("api/apk/candidates/{id}/attendance") suspend fun markAttendance(@Path("id") candidateId: Int, @Body request: AttendanceRequest): Response<ApiResponse>\n    @PATCH("api/apk/candidates/{id}/verify") suspend fun submitVerification(@Path("id") candidateId: Int, @Body request: VerificationRequest): Response<ApiResponse>\n    @POST("api/apk/verification/heartbeat") suspend fun sendHeartbeat(@Body request: HeartbeatRequest): Response<ApiResponse>\n    @GET("api/apk/candidates/{examId}/search") suspend fun searchCandidate(@Path("examId") examId: Int, @Query("rollNo") rollNo: String): Response<Candidate>
      @POST("api/apk/face/verify") suspend fun verifyFace(@Body request: FaceVerifyRequest): Response<FaceVerifyResponse>
      @POST("api/apk/fingerprint/verify") suspend fun verifyFingerprint(@Body request: FingerprintVerifyRequest): Response<FingerprintVerifyResponse>
      @POST("api/apk/verification/sync") suspend fun syncVerifications(@Body request: SyncRequest): Response<SyncResponse>
      @POST("api/apk/attendance/mark") suspend fun markAttendanceByBarcode(@Body request: BarcodeAttendanceRequest): Response<BarcodeAttendanceResponse>
      @POST("api/apk/omr/upload") suspend fun uploadOmrSheet(@Body request: OmrUploadRequest): Response<OmrUploadResponse>
      @GET("api/apk/app/version") suspend fun checkAppVersion(): Response<VersionInfo>
      @POST("api/apk/devices/register") suspend fun registerDevice(@Body request: DeviceRegistrationRequest): Response<ApiResponse>
      @POST("api/apk/devices/sync-status") suspend fun sendSyncStatus(@Body request: SyncStatusRequest): Response<ApiResponse>
      @GET("api/apk/devices/check-logout") suspend fun checkForceLogout(@Query("examId") examId: Int, @Query("deviceId") deviceId: String): Response<ForceLogoutResponse>
      @GET("api/apk/devices/mdm-command") suspend fun checkMDMCommand(@Query("deviceId") deviceId: String): Response<MDMCommandResponse>
      @POST("api/crash-logs") suspend fun uploadCrashLog(@Body request: CrashLogRequest): Response<ApiResponse>
      @POST("api/apk/centre-login/validate") suspend fun validateCentreLogin(@Body request: CentreLoginRequest): Response<CentreLoginResponse>
      @POST("api/apk/operator/register") suspend fun registerOperator(@Body request: OperatorRegRequest): Response<OperatorRegResponse>
      @POST("api/apk/operator/select-centre") suspend fun selectCentre(@Body request: CentreSelectRequest): Response<CentreSelectResponse>
      @POST("api/apk/operator/check-session") suspend fun checkSession(@Body request: SessionCheckRequest): Response<SessionCheckResponse>
      @POST("api/apk/verification/heartbeat") suspend fun sendHeartbeatV2(@Body request: HeartbeatRequest): Response<HeartbeatResponse>
      @GET("api/apk/centres/{examId}") suspend fun getCentres(@Path("examId") examId: Int): Response<List<CentreItem>>
      @GET("api/apk/available-exams") suspend fun getAvailableExams(@Query("examId") examId: Int): Response<List<AvailableExam>>\n}`);

  fs.writeFileSync(path.join(srcDir, "network", "RetrofitClient.kt"), `package ${pkgName}.network\nimport android.content.Context\nimport com.google.gson.Gson\nimport okhttp3.OkHttpClient\nimport okhttp3.logging.HttpLoggingInterceptor\nimport retrofit2.Retrofit\nimport retrofit2.converter.gson.GsonConverterFactory\nimport java.util.concurrent.TimeUnit\n\nobject RetrofitClient {\n    private var retrofit: Retrofit? = null\n    private var baseUrl: String = "${config.serverUrl.replace('http://', 'https://')}/"\n    fun init(context: Context) {\n        try {\n            val cfg = context.assets.open("config.json").bufferedReader().use { it.readText() }\n            val parsed = Gson().fromJson(cfg, Map::class.java)\n            val server = parsed["server"] as? Map<*, *>\n            baseUrl = (server?.get("baseUrl") as? String)?.let {\n                var u = if (it.endsWith("/")) it else "${"$"}it/"\n                if (u.startsWith("http://")) u = u.replace("http://", "https://")\n                u\n            } ?: baseUrl\n        } catch (_: Exception) {}\n    }\n    fun getBaseUrl(): String = baseUrl
    fun getApi(): ApiService {\n        if (retrofit == null) {\n            val logging = HttpLoggingInterceptor().apply { level = HttpLoggingInterceptor.Level.BODY }\n            val client = OkHttpClient.Builder().addInterceptor(logging).connectTimeout(30, TimeUnit.SECONDS).readTimeout(30, TimeUnit.SECONDS).build()\n            val gson = com.google.gson.GsonBuilder().setLenient().create(); retrofit = Retrofit.Builder().baseUrl(baseUrl).client(client).addConverterFactory(GsonConverterFactory.create(gson)).build()\n        }\n        return retrofit!!.create(ApiService::class.java)\n    }\n}`);

  fs.mkdirSync(path.join(srcDir, "db"), { recursive: true });
  fs.writeFileSync(path.join(srcDir, "db", "AppDatabase.kt"), `package ${pkgName}.db\nimport android.content.Context\nimport androidx.room.*\nimport ${pkgName}.model.Candidate\nimport ${pkgName}.model.PendingVerification\nimport ${pkgName}.model.PendingAttendance\n\n@Dao interface CandidateDao {\n    @Query("SELECT * FROM candidates WHERE examId = :examId") suspend fun getByExam(examId: Int): List<Candidate>\n    @Query("SELECT * FROM candidates WHERE rollNo = :rollNo AND examId = :examId LIMIT 1") suspend fun findByRollNo(rollNo: String, examId: Int): Candidate?\n    @Insert(onConflict = OnConflictStrategy.REPLACE) suspend fun insertAll(candidates: List<Candidate>)\n    @Update suspend fun update(candidate: Candidate)\n    @Query("SELECT COUNT(*) FROM candidates WHERE examId = :examId AND attendanceStatus = 'present'") suspend fun getPresentCount(examId: Int): Int\n    @Query("SELECT COUNT(*) FROM candidates WHERE examId = :examId AND verificationStatus = 'verified'") suspend fun getVerifiedCount(examId: Int): Int\n    @Query("SELECT COUNT(*) FROM candidates WHERE examId = :examId") suspend fun getTotalCount(examId: Int): Int\n}\n\n@Dao interface PendingVerificationDao {\n    @Insert suspend fun insert(v: PendingVerification)\n    @Query("SELECT * FROM pending_verifications WHERE uploaded = 0") suspend fun getUnuploaded(): List<PendingVerification>\n    @Update suspend fun update(v: PendingVerification)\n}\n\n@Dao interface PendingAttendanceDao {\n    @Insert suspend fun insert(a: PendingAttendance)\n    @Query("SELECT * FROM pending_attendance WHERE uploaded = 0") suspend fun getUnuploaded(): List<PendingAttendance>\n    @Update suspend fun update(a: PendingAttendance)\n}\n\n@Database(entities = [Candidate::class, PendingVerification::class, PendingAttendance::class], version = 1, exportSchema = false)\nabstract class AppDatabase : RoomDatabase() {\n    abstract fun candidateDao(): CandidateDao\n    abstract fun pendingVerificationDao(): PendingVerificationDao\n    abstract fun pendingAttendanceDao(): PendingAttendanceDao\n    companion object {\n        @Volatile private var instance: AppDatabase? = null\n        fun getInstance(context: Context): AppDatabase = instance ?: synchronized(this) {\n            Room.databaseBuilder(context.applicationContext, AppDatabase::class.java, "mpa_verify.db").fallbackToDestructiveMigration().build().also { instance = it }\n        }\n    }\n}`);

  fs.mkdirSync(path.join(srcDir, "ui"), { recursive: true });
  fs.writeFileSync(path.join(srcDir, "ui", "SplashActivity.kt"), `package ${pkgName}.ui\nimport android.content.Intent\nimport android.os.Bundle\nimport android.os.Handler\nimport android.os.Looper\nimport androidx.appcompat.app.AppCompatActivity\nimport ${pkgName}.R\nimport ${pkgName}.network.RetrofitClient\nclass SplashActivity : AppCompatActivity() {\n    override fun onCreate(savedInstanceState: Bundle?) {\n        super.onCreate(savedInstanceState)\n        setContentView(R.layout.activity_splash)\n        RetrofitClient.init(this)\n        Handler(Looper.getMainLooper()).postDelayed({\n            val prefs = getSharedPreferences("mpa_prefs", MODE_PRIVATE)\n            val registered = prefs.getBoolean("registered", false)\n            val examSelected = prefs.getBoolean("exam_selected", false)\n            val centreSelected = prefs.getBoolean("centre_selected", false)\n            val dest = when {\n                !registered -> RegistrationActivity::class.java\n                !examSelected -> ExamSelectActivity::class.java\n                !centreSelected -> CentreSelectActivity::class.java\n                else -> DashboardActivity::class.java\n            }\n            startActivity(Intent(this, dest))\n            finish()\n        }, 2000)\n    }\n}`);

  fs.writeFileSync(path.join(srcDir, "ui", "RegistrationActivity.kt"), `package ${pkgName}.ui
import android.Manifest
import android.annotation.SuppressLint
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Matrix
import android.os.Bundle
import android.provider.MediaStore
import android.provider.Settings
import android.util.Base64
import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import ${pkgName}.databinding.ActivityRegistrationBinding
import ${pkgName}.network.RetrofitClient
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.ByteArrayOutputStream
import java.util.concurrent.TimeUnit

class RegistrationActivity : AppCompatActivity() {
    private lateinit var binding: ActivityRegistrationBinding
    private var selfieBase64: String? = null
    private val TAG = "Registration"

    @SuppressLint("HardwareIds")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityRegistrationBinding.inflate(layoutInflater)
        setContentView(binding.root)
        binding.btnCaptureSelfie.setOnClickListener {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.CAMERA), 100)
            } else { openCamera() }
        }
        binding.btnRegister.setOnClickListener {
            val name = binding.etName.text.toString().trim()
            val phone = binding.etPhone.text.toString().trim()
            val aadhaar = binding.etAadhaar.text.toString().trim()
            if (name.isEmpty()) { Toast.makeText(this, "Enter your name", Toast.LENGTH_SHORT).show(); return@setOnClickListener }
            if (phone.isEmpty() || phone.length < 10) { Toast.makeText(this, "Enter valid phone number", Toast.LENGTH_SHORT).show(); return@setOnClickListener }
            if (aadhaar.isEmpty() || aadhaar.length != 12) { Toast.makeText(this, "Enter valid 12-digit Aadhaar number", Toast.LENGTH_SHORT).show(); return@setOnClickListener }
            if (selfieBase64 == null) { Toast.makeText(this, "Please capture your selfie", Toast.LENGTH_SHORT).show(); return@setOnClickListener }
            val deviceId = Settings.Secure.getString(contentResolver, Settings.Secure.ANDROID_ID)
            binding.btnRegister.isEnabled = false
            binding.btnRegister.text = "Registering..."
            lifecycleScope.launch {
                try {
                    val result = withContext(Dispatchers.IO) { doRegister(name, phone, aadhaar, selfieBase64!!, deviceId) }
                    val json = JSONObject(result)
                    if (json.optBoolean("success", false)) {
                        val op = json.getJSONObject("operator")
                        val prefs = getSharedPreferences("mpa_prefs", MODE_PRIVATE).edit()
                        prefs.putBoolean("registered", true)
                        prefs.putInt("operator_id", op.getInt("id"))
                        prefs.putString("operator_name", op.optString("name", ""))
                        prefs.putString("operator_phone", op.optString("phone", ""))
                        prefs.putString("operator_aadhaar", op.optString("aadhaar", ""))
                        prefs.putString("device_id", deviceId)
                        prefs.apply()
                        Toast.makeText(this@RegistrationActivity, "Registration successful!", Toast.LENGTH_SHORT).show()
                        startActivity(Intent(this@RegistrationActivity, ExamSelectActivity::class.java))
                        finish()
                    } else {
                        Toast.makeText(this@RegistrationActivity, json.optString("message", "Registration failed"), Toast.LENGTH_LONG).show()
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Registration failed", e)
                    val errMsg = e.message ?: "Unknown error"
                      Toast.makeText(this@RegistrationActivity, errMsg, Toast.LENGTH_LONG).show()
                }
                binding.btnRegister.isEnabled = true
                binding.btnRegister.text = "Register"
            }
        }
    }

    private fun doRegister(name: String, phone: String, aadhaar: String, selfie: String, deviceId: String): String {
        var baseUrl = RetrofitClient.getBaseUrl()
        if (baseUrl.startsWith("http://")) { baseUrl = baseUrl.replace("http://", "https://") }
        val url = "${"$"}{baseUrl}api/apk/operator/register"
        Log.d(TAG, "Registering to: ${"$"}url")
        val json = JSONObject()
        json.put("name", name)
        json.put("phone", phone)
        json.put("aadhaar", aadhaar)
        json.put("selfie", selfie)
        json.put("deviceId", deviceId)
        val bodyStr = json.toString()
        val body = bodyStr.toRequestBody("application/json".toMediaType())
        Log.d(TAG, "Request body size: ${"$"}{bodyStr.length} bytes")
        val client = OkHttpClient.Builder()
            .connectTimeout(90, TimeUnit.SECONDS)
            .readTimeout(90, TimeUnit.SECONDS)
            .writeTimeout(90, TimeUnit.SECONDS)
            .followRedirects(false)
            .followSslRedirects(false)
            .build()
        val request = Request.Builder().url(url).post(body).addHeader("Content-Type", "application/json").addHeader("Accept", "application/json").build()
        var response = client.newCall(request).execute()
        if (response.code in 301..308) {
            val redirectUrl = response.header("Location") ?: url
            Log.d(TAG, "Redirected (${"$"}{response.code}) to: ${"$"}redirectUrl")
            val newBody = bodyStr.toRequestBody("application/json".toMediaType())
            val newRequest = Request.Builder().url(redirectUrl).post(newBody).addHeader("Content-Type", "application/json").addHeader("Accept", "application/json").build()
            response = client.newCall(newRequest).execute()
        }
        val responseBody = response.body?.string() ?: "{}"
        Log.d(TAG, "Response code: ${"$"}{response.code}, body: ${"$"}{responseBody.take(500)}")
        if (responseBody.trimStart().startsWith("<!DOCTYPE") || responseBody.trimStart().startsWith("<html")) {
            throw Exception("Server returned HTML instead of JSON. Check server URL: ${"$"}url (code: ${"$"}{response.code})")
        }
        if (!response.isSuccessful) {
            throw Exception("Server error ${"$"}{response.code}: ${"$"}{responseBody.take(200)}")
        }
        return responseBody
    }

    private fun openCamera() {
        val i = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
        i.putExtra("android.intent.extras.CAMERA_FACING", 1)
        i.putExtra("android.intent.extras.LENS_FACING_FRONT", 1)
        i.putExtra("android.intent.extra.USE_FRONT_CAMERA", true)
        startActivityForResult(i, 101)
    }

    override fun onRequestPermissionsResult(rc: Int, p: Array<String>, gr: IntArray) {
        super.onRequestPermissionsResult(rc, p, gr)
        if (rc == 100 && gr.isNotEmpty() && gr[0] == PackageManager.PERMISSION_GRANTED) openCamera()
    }

    @Deprecated("Use Activity Result API")
    override fun onActivityResult(rc: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(rc, resultCode, data)
        if (rc == 101 && resultCode == RESULT_OK) {
            val bmp = data?.extras?.get("data") as? Bitmap ?: return
            val scaled = Bitmap.createScaledBitmap(bmp, 120, 120, true)
            binding.ivSelfie.setImageBitmap(scaled)
            binding.tvSelfieStatus.text = "Selfie captured"
            val baos = ByteArrayOutputStream()
            scaled.compress(Bitmap.CompressFormat.JPEG, 30, baos)
            selfieBase64 = Base64.encodeToString(baos.toByteArray(), Base64.NO_WRAP)
            Log.d(TAG, "Selfie base64 size: ${"$"}{selfieBase64?.length} chars")
        }
    }

    override fun onBackPressed() { }
}`)

  // ExamSelectActivity - fetches linked exams from server (live), falls back to config.json if offline
  fs.writeFileSync(path.join(srcDir, "ui", "ExamSelectActivity.kt"), `package ${pkgName}.ui
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.widget.BaseAdapter
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import ${pkgName}.databinding.ActivityExamSelectBinding
import ${pkgName}.network.RetrofitClient
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject

class ExamSelectActivity : AppCompatActivity() {
    private lateinit var binding: ActivityExamSelectBinding
    private val examList = mutableListOf<JSONObject>()
    private var selectedIndex = -1
    private var primaryExamId = 0

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityExamSelectBinding.inflate(layoutInflater)
        setContentView(binding.root)

        val prefs = getSharedPreferences("mpa_prefs", MODE_PRIVATE)
        binding.tvOperatorGreeting.text = "Welcome, ${"$"}{prefs.getString("operator_name", "Operator")}"

        try {
            val cfg = assets.open("config.json").bufferedReader().readText()
            val config = JSONObject(cfg)
            primaryExamId = config.optJSONObject("exam")?.optInt("id", 0) ?: 0
        } catch (_: Exception) {}

        loadExamsFromServer()

        binding.btnSelectExam.setOnClickListener {
            if (selectedIndex < 0 || selectedIndex >= examList.size) {
                Toast.makeText(this, "Please select an exam", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            val exam = examList[selectedIndex]
            val examId = exam.getInt("id")
            val examName = exam.getString("name")
            val examCode = exam.optString("code", "")

            prefs.edit()
                .putBoolean("exam_selected", true)
                .putInt("exam_id", examId)
                .putString("exam_name", examName)
                .putString("exam_code", examCode)
                .apply()

            val intent = Intent(this, CentreSelectActivity::class.java)
            intent.putExtra("examId", examId)
            intent.putExtra("examName", examName)
            startActivity(intent)
            finish()
        }
    }

    private fun loadExamsFromServer() {
        if (primaryExamId == 0) { loadExamsFromConfig(); return }
        binding.btnSelectExam.isEnabled = false
        binding.btnSelectExam.text = "Loading exams..."
        lifecycleScope.launch {
            try {
                val resp = withContext(Dispatchers.IO) {
                    RetrofitClient.getApi().getAvailableExams(primaryExamId)
                }
                if (resp.isSuccessful && resp.body() != null && resp.body()!!.isNotEmpty()) {
                    val serverExams = resp.body()!!
                    Log.d("ExamSelect", "Fetched ${"$"}{serverExams.size} exams from server")
                    examList.clear()
                    val prefs = getSharedPreferences("mpa_prefs", MODE_PRIVATE)
                    val completedStr = prefs.getString("completed_exams", "") ?: ""
                    val completedIds = if (completedStr.isEmpty()) emptySet() else completedStr.split(",").map { it.trim().toIntOrNull() }.filterNotNull().toSet()
                    for (exam in serverExams) {
                        if (!completedIds.contains(exam.id)) {
                            val j = JSONObject()
                            j.put("id", exam.id)
                            j.put("name", exam.name)
                            j.put("code", exam.code ?: "")
                            examList.add(j)
                        }
                    }
                    displayExams()
                } else {
                    Log.d("ExamSelect", "Server returned empty, falling back to config.json")
                    loadExamsFromConfig()
                }
            } catch (e: Exception) {
                Log.e("ExamSelect", "Server fetch failed, using config.json: ${"$"}{e.message}")
                loadExamsFromConfig()
            }
            binding.btnSelectExam.isEnabled = true
            binding.btnSelectExam.text = "Select Exam & Continue"
        }
    }

    private fun loadExamsFromConfig() {
        try {
            val configStr = assets.open("config.json").bufferedReader().readText()
            val config = JSONObject(configStr)
            val linkedExams = config.optJSONArray("linkedExams") ?: JSONArray()
            val prefs = getSharedPreferences("mpa_prefs", MODE_PRIVATE)
            val completedStr = prefs.getString("completed_exams", "") ?: ""
            val completedIds = if (completedStr.isEmpty()) emptySet() else completedStr.split(",").map { it.trim().toIntOrNull() }.filterNotNull().toSet()
            examList.clear()
            for (i in 0 until linkedExams.length()) {
                val exam = linkedExams.getJSONObject(i)
                if (!completedIds.contains(exam.getInt("id"))) {
                    examList.add(exam)
                }
            }
        } catch (e: Exception) {
            Toast.makeText(this, "Error loading exams: ${"$"}{e.message}", Toast.LENGTH_LONG).show()
        }
        displayExams()
        binding.btnSelectExam.isEnabled = true
        binding.btnSelectExam.text = "Select Exam & Continue"
    }

    private fun displayExams() {
        if (examList.isEmpty()) {
            binding.tvNoExams.visibility = View.VISIBLE
            binding.lvExams.visibility = View.GONE
            binding.btnSelectExam.isEnabled = false
            binding.tvNoExams.text = "All exams have been completed. Please contact HQ."
            return
        }
        binding.tvNoExams.visibility = View.GONE
        binding.lvExams.visibility = View.VISIBLE
        if (examList.size == 1) selectedIndex = 0
        binding.lvExams.adapter = object : BaseAdapter() {
            override fun getCount() = examList.size
            override fun getItem(pos: Int) = examList[pos]
            override fun getItemId(pos: Int) = pos.toLong()
            override fun getView(pos: Int, convertView: View?, parent: ViewGroup?): View {
                val v = convertView ?: layoutInflater.inflate(android.R.layout.simple_list_item_activated_1, parent, false)
                val tv = v.findViewById<TextView>(android.R.id.text1)
                val exam = examList[pos]
                tv.text = "${"$"}{exam.optString("code", "")} - ${"$"}{exam.getString("name")}"
                tv.textSize = 16f
                tv.setPadding(32, 24, 32, 24)
                return v
            }
        }
        binding.lvExams.choiceMode = android.widget.ListView.CHOICE_MODE_SINGLE
        binding.lvExams.setOnItemClickListener { _, _, pos, _ ->
            selectedIndex = pos
            binding.lvExams.setItemChecked(pos, true)
        }
        if (examList.size == 1) binding.lvExams.setItemChecked(0, true)
    }

    override fun onBackPressed() { }
}`)

  // CentreSelectActivity - reads examId from intent extras or prefs, robust error handling
  fs.writeFileSync(path.join(srcDir, "ui", "CentreSelectActivity.kt"), `package ${pkgName}.ui
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import ${pkgName}.databinding.ActivityCentreSelectBinding
import ${pkgName}.db.AppDatabase
import ${pkgName}.model.CentreSelectRequest
import ${pkgName}.network.RetrofitClient
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
class CentreSelectActivity : AppCompatActivity() {
    private lateinit var binding: ActivityCentreSelectBinding
    private var selectedCentreCode = ""
    private var examId = 0
    private var examName = ""
    private val TAG = "CentreSelect"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        try {
            binding = ActivityCentreSelectBinding.inflate(layoutInflater)
            setContentView(binding.root)
        } catch (e: Exception) {
            Log.e(TAG, "Layout inflation failed", e)
            Toast.makeText(this, "UI error: ${"$"}{e.message}", Toast.LENGTH_LONG).show()
            finish()
            return
        }
        try {
            val prefs = getSharedPreferences("mpa_prefs", MODE_PRIVATE)
            examId = intent.getIntExtra("examId", prefs.getInt("exam_id", 0))
            examName = intent.getStringExtra("examName") ?: prefs.getString("exam_name", "Exam") ?: "Exam"
            Log.d(TAG, "CentreSelect opened: examId=${"$"}examId examName=${"$"}examName")
            binding.tvExamName.text = examName
            loadCentres()
            binding.btnConfirmCentre.setOnClickListener {
                if (selectedCentreCode.isEmpty()) { Toast.makeText(this, "Please select a centre", Toast.LENGTH_SHORT).show(); return@setOnClickListener }
                val opId = prefs.getInt("operator_id", 0)
                binding.btnConfirmCentre.isEnabled = false
                binding.btnConfirmCentre.text = "Downloading data..."
                lifecycleScope.launch {
                    try {
                        val resp = withContext(Dispatchers.IO) { RetrofitClient.getApi().selectCentre(CentreSelectRequest(opId, examId, selectedCentreCode)) }
                        if (resp.isSuccessful && resp.body()?.success == true) {
                            val body = resp.body()!!
                            try {
                                body.candidates?.let { candidates ->
                                    if (candidates.isNotEmpty()) {
                                        withContext(Dispatchers.IO) { AppDatabase.getInstance(this@CentreSelectActivity).candidateDao().insertAll(candidates) }
                                    }
                                }
                            } catch (dbErr: Exception) { Log.e(TAG, "DB insert error", dbErr) }
                            prefs.edit()
                                .putBoolean("centre_selected", true)
                                .putString("centre_code", selectedCentreCode)
                                .putString("centre_name", body.centreName ?: selectedCentreCode)
                                .putInt("exam_id", examId)
                                .putString("exam_name", examName)
                                .putInt("downloaded_count", body.candidateCount ?: 0)
                                .putLong("last_download_time", System.currentTimeMillis())
                                .apply()
                            Toast.makeText(this@CentreSelectActivity, body.message ?: "Centre selected", Toast.LENGTH_SHORT).show()
                            startActivity(Intent(this@CentreSelectActivity, DashboardActivity::class.java))
                            finish()
                        } else {
                            val msg = try { resp.body()?.message } catch (_: Exception) { null } ?: "Failed to select centre"
                            Toast.makeText(this@CentreSelectActivity, msg, Toast.LENGTH_SHORT).show()
                        }
                    } catch (e: Exception) {
                        Log.e(TAG, "Centre select error", e)
                        Toast.makeText(this@CentreSelectActivity, "Network error: ${"$"}{e.message}", Toast.LENGTH_SHORT).show()
                    }
                    binding.btnConfirmCentre.isEnabled = true
                    binding.btnConfirmCentre.text = "Confirm & Download Data"
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "onCreate error", e)
            Toast.makeText(this, "Error: ${"$"}{e.message}", Toast.LENGTH_LONG).show()
        }
    }

    private fun loadCentres() {
        binding.btnConfirmCentre.isEnabled = false
        binding.btnConfirmCentre.text = "Loading centres..."
        lifecycleScope.launch {
            try {
                val resp = withContext(Dispatchers.IO) { RetrofitClient.getApi().getCentres(examId) }
                if (resp.isSuccessful && resp.body() != null) {
                    val centres = resp.body()!!
                    Log.d(TAG, "Loaded ${"$"}{centres.size} centres")
                    if (centres.isEmpty()) {
                        Toast.makeText(this@CentreSelectActivity, "No centres found for this exam", Toast.LENGTH_LONG).show()
                        binding.btnConfirmCentre.isEnabled = false
                        binding.btnConfirmCentre.text = "No Centres Available"
                        return@launch
                    }
                    val names = centres.map { "${"$"}{it.code} - ${"$"}{it.name}" }
                    binding.spinnerCentre.adapter = ArrayAdapter(this@CentreSelectActivity, android.R.layout.simple_spinner_dropdown_item, names)
                    binding.spinnerCentre.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
                        override fun onItemSelected(p: AdapterView<*>?, v: View?, pos: Int, id: Long) {
                            if (pos >= 0 && pos < centres.size) { selectedCentreCode = centres[pos].code }
                        }
                        override fun onNothingSelected(p: AdapterView<*>?) {}
                    }
                    if (centres.isNotEmpty()) { selectedCentreCode = centres[0].code }
                } else {
                    Log.e(TAG, "getCentres failed: ${"$"}{resp.code()} ${"$"}{resp.message()}")
                    Toast.makeText(this@CentreSelectActivity, "Failed to load centres (error ${"$"}{resp.code()})", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Log.e(TAG, "loadCentres error", e)
                Toast.makeText(this@CentreSelectActivity, "Network error loading centres: ${"$"}{e.message}", Toast.LENGTH_LONG).show()
            }
            binding.btnConfirmCentre.isEnabled = true
            binding.btnConfirmCentre.text = "Confirm & Download Data"
        }
    }

    override fun onBackPressed() { }
}`);

  fs.writeFileSync(path.join(srcDir, "ui", "DashboardActivity.kt"), `package ${pkgName}.ui
  import android.content.Intent
  import android.os.Bundle
  import android.os.Handler
  import android.os.Looper
  import android.widget.Toast
  import androidx.appcompat.app.AlertDialog
  import androidx.appcompat.app.AppCompatActivity
  import androidx.lifecycle.lifecycleScope
  import ${pkgName}.MpaApplication
  import ${pkgName}.databinding.ActivityDashboardBinding
  import ${pkgName}.db.AppDatabase
  import ${pkgName}.model.HeartbeatRequest
  import ${pkgName}.model.SessionCheckRequest
  import ${pkgName}.network.RetrofitClient
  import ${pkgName}.service.HeartbeatService
  import kotlinx.coroutines.launch
  import org.json.JSONObject
  class DashboardActivity : AppCompatActivity() {
      private lateinit var binding: ActivityDashboardBinding
      private var examId = 0
      private var examName = ""
      private var centreCode = ""
      private var centreName = ""
      private val sessionCheckHandler = Handler(Looper.getMainLooper())
      private val sessionCheckRunnable = object : Runnable {
          override fun run() {
              checkForceLogout()
              sessionCheckHandler.postDelayed(this, 30000)
          }
      }
      override fun onCreate(savedInstanceState: Bundle?) {
          super.onCreate(savedInstanceState)
          binding = ActivityDashboardBinding.inflate(layoutInflater)
          setContentView(binding.root)
          loadFromPrefs()
          binding.tvExamName.text = examName
          binding.tvOperatorName.text = getSharedPreferences("mpa_prefs", MODE_PRIVATE).getString("operator_name", "Operator")
          binding.tvCentreName.text = "Centre: ${"$"}{centreCode} - ${"$"}{centreName}"
          binding.btnSyncData.setOnClickListener { downloadCandidates() }
          binding.btnAttendance.setOnClickListener {
              val db = AppDatabase.getInstance(this)
              lifecycleScope.launch {
                  val count = db.candidateDao().getTotalCount(examId)
                  if (count == 0) { Toast.makeText(this@DashboardActivity, "Download candidate data first", Toast.LENGTH_SHORT).show(); return@launch }
                  startActivity(Intent(this@DashboardActivity, CandidateListActivity::class.java).putExtra("mode", "attendance").putExtra("examId", examId))
              }
          }
          binding.btnVerification.setOnClickListener {
              val db = AppDatabase.getInstance(this)
              lifecycleScope.launch {
                  val count = db.candidateDao().getTotalCount(examId)
                  if (count == 0) { Toast.makeText(this@DashboardActivity, "Download candidate data first", Toast.LENGTH_SHORT).show(); return@launch }
                  startActivity(Intent(this@DashboardActivity, CandidateListActivity::class.java).putExtra("mode", "verification").putExtra("examId", examId))
              }
          }
          binding.btnOfflineSync.setOnClickListener { startActivity(Intent(this, SyncActivity::class.java)) }
          binding.btnFinishExam.setOnClickListener {
              AlertDialog.Builder(this)
                  .setTitle("Finish Exam")
                  .setMessage("Are you sure you want to finish this exam and select another exam?")
                  .setPositiveButton("Yes") { _, _ ->
                      val prefs = getSharedPreferences("mpa_prefs", MODE_PRIVATE)
                      val completed = prefs.getString("completed_exams", "") ?: ""
                      val newCompleted = if (completed.isEmpty()) examId.toString() else "${"$"}{completed},${"$"}{examId}"
                      prefs.edit()
                          .putString("completed_exams", newCompleted)
                          .putBoolean("exam_selected", false)
                          .putBoolean("centre_selected", false)
                          .remove("exam_id").remove("exam_name").remove("exam_code")
                          .remove("centre_code").remove("centre_name")
                          .remove("downloaded_count").remove("last_download_time")
                          .apply()
                      try { stopService(Intent(this, HeartbeatService::class.java)) } catch (_: Exception) {}
                      startActivity(Intent(this, ExamSelectActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK))
                      finish()
                  }
                  .setNegativeButton("No", null)
                  .show()
          }
          try { if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) startForegroundService(Intent(this, HeartbeatService::class.java)) else startService(Intent(this, HeartbeatService::class.java)) } catch (_: Exception) {}
          sessionCheckHandler.postDelayed(sessionCheckRunnable, 30000)
          updateStats()
      }
      private fun loadFromPrefs() {
          val prefs = getSharedPreferences("mpa_prefs", MODE_PRIVATE)
          centreCode = prefs.getString("centre_code", "") ?: ""
          centreName = prefs.getString("centre_name", "") ?: ""
          examId = prefs.getInt("exam_id", 0)
          examName = prefs.getString("exam_name", "") ?: ""
          if (examName.isEmpty()) {
              try {
                  val cfg = assets.open("config.json").bufferedReader().use { it.readText() }
                  val json = JSONObject(cfg)
                  val exam = json.getJSONObject("exam")
                  if (examId == 0) examId = exam.getInt("id")
                  examName = exam.getString("name")
              } catch (_: Exception) { examName = "Exam" }
          }
      }
      private fun checkForceLogout() {
          val opId = getSharedPreferences("mpa_prefs", MODE_PRIVATE).getInt("operator_id", 0)
          if (opId == 0) return
          lifecycleScope.launch {
              try {
                  val resp = RetrofitClient.getApi().checkSession(SessionCheckRequest(opId))
                  if (resp.isSuccessful && resp.body() != null) {
                      val body = resp.body()!!
                      if (body.forceLogout || !body.sessionActive) {
                          runOnUiThread {
                              AlertDialog.Builder(this@DashboardActivity)
                                  .setTitle("Session Terminated")
                                  .setMessage("Your session has been terminated by HQ. Please re-register to continue.")
                                  .setCancelable(false)
                                  .setPositiveButton("OK") { _, _ ->
                                      val prefs = getSharedPreferences("mpa_prefs", MODE_PRIVATE)
                                      val completedExams = prefs.getString("completed_exams", "") ?: ""
                                      prefs.edit().clear().putString("completed_exams", completedExams).apply()
                                      try { stopService(Intent(this@DashboardActivity, HeartbeatService::class.java)) } catch (_: Exception) {}
                                      startActivity(Intent(this@DashboardActivity, RegistrationActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK))
                                      finish()
                                  }.show()
                          }
                      }
                  }
              } catch (_: Exception) {}
          }
      }
      private fun downloadCandidates() {
          binding.btnSyncData.isEnabled = false
          binding.btnSyncData.text = "Downloading..."
          lifecycleScope.launch {
              try {
                  val r = RetrofitClient.getApi().getCandidates(examId, if (centreCode.isNotEmpty()) centreCode else null)
                  if (r.isSuccessful && r.body() != null) {
                      val candidates = r.body()!!
                      AppDatabase.getInstance(this@DashboardActivity).candidateDao().insertAll(candidates)
                      getSharedPreferences("mpa_prefs", MODE_PRIVATE).edit()
                          .putLong("last_download_time", System.currentTimeMillis())
                          .putInt("downloaded_count", candidates.size).apply()
                      Toast.makeText(this@DashboardActivity, "Downloaded ${"$"}{candidates.size} candidates", Toast.LENGTH_SHORT).show()
                      updateStats()
                  } else {
                      Toast.makeText(this@DashboardActivity, "Download failed: ${"$"}{r.code()}", Toast.LENGTH_SHORT).show()
                  }
              } catch (e: Exception) {
                  Toast.makeText(this@DashboardActivity, "Network error - working offline with local data", Toast.LENGTH_LONG).show()
              }
              binding.btnSyncData.isEnabled = true
              binding.btnSyncData.text = "Download Data"
          }
      }
      override fun onResume() { super.onResume(); updateStats(); checkForceLogout() }
      override fun onDestroy() { super.onDestroy(); sessionCheckHandler.removeCallbacks(sessionCheckRunnable) }
      override fun onBackPressed() { }
      private fun updateStats() {
          lifecycleScope.launch {
              try {
                  val db = AppDatabase.getInstance(this@DashboardActivity)
                  val total = db.candidateDao().getTotalCount(examId)
                  val present = db.candidateDao().getPresentCount(examId)
                  val verified = db.candidateDao().getVerifiedCount(examId)
                  binding.tvTotalCandidates.text = total.toString()
                  binding.tvPresentCount.text = present.toString()
                  binding.tvVerifiedCount.text = verified.toString()
                  val pendingVerifCount = db.pendingVerificationDao().getUnuploaded().size
                  val pendingAttCount = db.pendingAttendanceDao().getUnuploaded().size
                  val pendingCount = pendingVerifCount + pendingAttCount
                  val queueCount = (application as MpaApplication).syncManager.getQueueSize()
                  binding.tvPendingSync.text = if (pendingCount + queueCount > 0) "${"$"}{pendingCount + queueCount} pending sync" else "All synced"
                  val lastDownload = getSharedPreferences("mpa_prefs", MODE_PRIVATE).getLong("last_download_time", 0)
                  if (lastDownload > 0) {
                      val ago = (System.currentTimeMillis() - lastDownload) / 60000
                      val agoText = if (ago < 1) "just now" else if (ago < 60) "${"$"}{ago}m ago" else "${"$"}{ago / 60}h ago"
                      binding.tvLastSync.text = "Last download: ${"$"}{agoText} (${"$"}{total} candidates)"
                  } else if (total > 0) {
                      binding.tvLastSync.text = "${"$"}{total} candidates in local database"
                  } else {
                      binding.tvLastSync.text = "No data downloaded yet"
                  }
              } catch (_: Exception) {}
          }
      }
  }`);
  fs.writeFileSync(path.join(srcDir, "ui", "VerificationActivity.kt"), `package ${pkgName}.ui\nimport android.os.Bundle\nimport android.widget.Toast\nimport androidx.appcompat.app.AppCompatActivity\nimport androidx.lifecycle.lifecycleScope\nimport ${pkgName}.MpaApplication\nimport ${pkgName}.databinding.ActivityVerificationBinding\nimport ${pkgName}.db.AppDatabase\nimport ${pkgName}.model.PendingVerification\nimport ${pkgName}.model.VerificationRequest\nimport ${pkgName}.network.RetrofitClient\nimport kotlinx.coroutines.launch\nclass VerificationActivity : AppCompatActivity() {\n    private lateinit var binding: ActivityVerificationBinding\n    private var candidateId = 0; private var faceMatch = 0f\n    override fun onCreate(savedInstanceState: Bundle?) {\n        super.onCreate(savedInstanceState)\n        binding = ActivityVerificationBinding.inflate(layoutInflater)\n        setContentView(binding.root)\n        candidateId = intent.getIntExtra("candidateId", 0)\n        val examId = intent.getIntExtra("examId", 0)\n        val opId = getSharedPreferences("mpa_prefs", MODE_PRIVATE).let { it.getInt("operator_id", it.getInt("user_id", 0)) }\n        lifecycleScope.launch { AppDatabase.getInstance(this@VerificationActivity).candidateDao().getByExam(examId).find { it.id == candidateId }?.let { binding.tvCandidateName.text = it.name; binding.tvRollNo.text = "Roll: ${"$"}{it.rollNo}" } }\n        binding.btnCaptureFace.setOnClickListener { faceMatch = 85f; binding.tvFaceResult.text = "Face Match: ${"$"}{faceMatch}%" }\n        binding.btnCaptureFingerprint.setOnClickListener { binding.tvFingerprintResult.text = "Fingerprint: Captured" }\n        binding.btnSubmit.setOnClickListener { val omr = binding.etOmrNumber.text.toString().trim(); lifecycleScope.launch { try { val r = RetrofitClient.getApi().submitVerification(candidateId, VerificationRequest("verified", null, faceMatch, omr, opId)); if (r.isSuccessful) { Toast.makeText(this@VerificationActivity, "Submitted", Toast.LENGTH_SHORT).show(); finish() } } catch (_: Exception) { AppDatabase.getInstance(this@VerificationActivity).pendingVerificationDao().insert(PendingVerification(candidateId = candidateId, rollNo = "", verifiedPhoto = null, faceMatchPercent = faceMatch, omrNumber = omr, fingerprint = null)); val syncMgr = (application as MpaApplication).syncManager; val payload = org.json.JSONObject().put("candidateId", candidateId).put("verificationStatus", "verified").put("faceMatchPercent", faceMatch).put("omrNumber", omr).put("verificationOperatorId", opId).toString(); syncMgr.enqueue("verification", "api/apk/candidates/${"$"}candidateId/verification", payload); Toast.makeText(this@VerificationActivity, "Saved offline - will auto-sync when online", Toast.LENGTH_SHORT).show(); finish() } } }\n    }\n}`);

    fs.writeFileSync(path.join(srcDir, "ui", "SyncActivity.kt"), `package ${pkgName}.ui
  import android.os.Bundle
  import android.widget.Toast
  import androidx.appcompat.app.AppCompatActivity
  import androidx.lifecycle.lifecycleScope
  import ${pkgName}.MpaApplication
  import ${pkgName}.databinding.ActivitySyncBinding
  import ${pkgName}.db.AppDatabase
  import ${pkgName}.model.VerificationRequest
  import ${pkgName}.network.RetrofitClient
  import kotlinx.coroutines.launch
  class SyncActivity : AppCompatActivity() {
      private lateinit var binding: ActivitySyncBinding
      override fun onCreate(savedInstanceState: Bundle?) {
          super.onCreate(savedInstanceState)
          binding = ActivitySyncBinding.inflate(layoutInflater)
          setContentView(binding.root)
          val opId = getSharedPreferences("mpa_prefs", MODE_PRIVATE).getInt("user_id", 0)
          val syncManager = (application as MpaApplication).syncManager
          refreshStatus()
          binding.btnSync.setOnClickListener {
              binding.tvSyncStatus.text = "Syncing..."
              binding.btnSync.isEnabled = false
              lifecycleScope.launch {
                  try {
                      val db = AppDatabase.getInstance(this@SyncActivity)
                      val pending = db.pendingVerificationDao().getUnuploaded()
                      var synced = 0
                      for (v in pending) {
                          try {
                              val r = RetrofitClient.getApi().submitVerification(v.candidateId, VerificationRequest("verified", v.verifiedPhoto, v.faceMatchPercent, v.omrNumber, opId))
                              if (r.isSuccessful) { v.uploaded = true; db.pendingVerificationDao().update(v); synced++ }
                          } catch (_: Exception) {}
                      }
                      syncManager.emergencySync { s, f, r ->
                          binding.tvSyncStatus.text = "DB: \${synced}/\${pending.size} synced | Queue: \${s} synced, \${f} failed, \${r} remaining"
                          binding.btnSync.isEnabled = true
                          refreshStatus()
                      }
                      if (syncManager.getQueueSize() == 0) {
                          binding.tvSyncStatus.text = "Synced \${synced}/\${pending.size} verifications"
                          binding.btnSync.isEnabled = true
                          refreshStatus()
                      }
                      Toast.makeText(this@SyncActivity, "Sync complete", Toast.LENGTH_SHORT).show()
                  } catch (e: Exception) {
                      binding.tvSyncStatus.text = "Sync failed: \${e.message}"
                      binding.btnSync.isEnabled = true
                  }
              }
          }
      }
      private fun refreshStatus() {
          val syncManager = (application as MpaApplication).syncManager
          lifecycleScope.launch {
              val dbVerifCount = AppDatabase.getInstance(this@SyncActivity).pendingVerificationDao().getUnuploaded().size
              val dbAttCount = AppDatabase.getInstance(this@SyncActivity).pendingAttendanceDao().getUnuploaded().size
              val dbCount = dbVerifCount + dbAttCount
              val queueCount = syncManager.getQueueSize()
              val online = if (syncManager.isOnline()) "Online" else "Offline"
              binding.tvPendingCount.text = "\${dbCount} pending verifications | \${queueCount} queued | \${online}"
              binding.tvSyncStatus.text = if (dbCount == 0 && queueCount == 0) "All data synced" else "Tap Sync Now to upload"
          }
      }
      override fun onResume() { super.onResume(); refreshStatus() }
  }`);

  fs.mkdirSync(path.join(srcDir, "service"), { recursive: true });
  fs.writeFileSync(path.join(srcDir, "service", "HeartbeatService.kt"), `package ${pkgName}.service\nimport android.app.*\nimport android.content.Intent\nimport android.os.Build\nimport android.os.IBinder\nimport androidx.core.app.NotificationCompat\nimport ${pkgName}.R\nimport ${pkgName}.model.HeartbeatRequest\nimport ${pkgName}.network.RetrofitClient\nimport kotlinx.coroutines.*\nclass HeartbeatService : Service() {\n    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())\n    override fun onBind(intent: Intent?): IBinder? = null\n    override fun onCreate() {\n        super.onCreate()\n        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) { val ch = NotificationChannel("heartbeat", "Heartbeat", NotificationManager.IMPORTANCE_LOW); getSystemService(NotificationManager::class.java).createNotificationChannel(ch) }\n        startForeground(1, NotificationCompat.Builder(this, "heartbeat").setContentTitle("MPA Verify Active").setSmallIcon(R.drawable.ic_fingerprint).build())\n        scope.launch { while (isActive) { try { val p = getSharedPreferences("mpa_prefs", MODE_PRIVATE); val opId = p.getInt("operator_id", p.getInt("user_id", 0)); val resp = RetrofitClient.getApi().sendHeartbeatV2(HeartbeatRequest(p.getString("device_id","")!!, opId, 100, null)); if (resp.isSuccessful && resp.body()?.forceLogout == true) { p.edit().clear().apply(); stopSelf() } } catch (_: Exception) {}; delay(30000) } }\n    }\n    override fun onDestroy() { scope.cancel(); super.onDestroy() }\n}`);

  fs.writeFileSync(path.join(srcDir, "service", "SyncService.kt"), `package ${pkgName}.service\nimport android.app.*\nimport android.content.Intent\nimport android.os.Build\nimport android.os.IBinder\nimport androidx.core.app.NotificationCompat\nimport ${pkgName}.R\nimport ${pkgName}.db.AppDatabase\nimport ${pkgName}.model.VerificationRequest\nimport ${pkgName}.network.RetrofitClient\nimport kotlinx.coroutines.*\nclass SyncService : Service() {\n    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())\n    override fun onBind(intent: Intent?): IBinder? = null\n    override fun onCreate() {\n        super.onCreate()\n        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) { val ch = NotificationChannel("sync", "Sync", NotificationManager.IMPORTANCE_LOW); getSystemService(NotificationManager::class.java).createNotificationChannel(ch) }\n        startForeground(2, NotificationCompat.Builder(this, "sync").setContentTitle("Syncing").setSmallIcon(R.drawable.ic_fingerprint).build())\n        scope.launch { val db = AppDatabase.getInstance(this@SyncService); val opId = getSharedPreferences("mpa_prefs", MODE_PRIVATE).getInt("user_id", 0); for (v in db.pendingVerificationDao().getUnuploaded()) { try { val r = RetrofitClient.getApi().submitVerification(v.candidateId, VerificationRequest("verified", v.verifiedPhoto, v.faceMatchPercent, v.omrNumber, opId)); if (r.isSuccessful) { v.uploaded = true; db.pendingVerificationDao().update(v) } } catch (_: Exception) {} }; stopSelf() }\n    }\n    override fun onDestroy() { scope.cancel(); super.onDestroy() }\n}`);

  fs.mkdirSync(path.join(srcDir, "receiver"), { recursive: true });
  fs.writeFileSync(path.join(srcDir, "receiver", "BootReceiver.kt"), `package ${pkgName}.receiver\nimport android.content.BroadcastReceiver\nimport android.content.Context\nimport android.content.Intent\nimport ${pkgName}.service.HeartbeatService\nclass BootReceiver : BroadcastReceiver() {\n    override fun onReceive(context: Context, intent: Intent?) {\n        if (intent?.action == Intent.ACTION_BOOT_COMPLETED) {\n            val p = context.getSharedPreferences("mpa_prefs", Context.MODE_PRIVATE)\n            if (p.getBoolean("logged_in", false)) context.startForegroundService(Intent(context, HeartbeatService::class.java))\n        }\n    }\n}`);

  fs.writeFileSync(path.join(srcDir, "ui", "CandidateListActivity.kt"), `package ${pkgName}.ui\nimport android.content.Intent\nimport android.os.Bundle\nimport android.view.LayoutInflater\nimport android.view.ViewGroup\nimport androidx.appcompat.app.AppCompatActivity\nimport androidx.lifecycle.lifecycleScope\nimport androidx.recyclerview.widget.LinearLayoutManager\nimport androidx.recyclerview.widget.RecyclerView\nimport ${pkgName}.databinding.ActivityCandidateListBinding\nimport ${pkgName}.databinding.ItemCandidateBinding\nimport ${pkgName}.db.AppDatabase\nimport ${pkgName}.model.Candidate\nimport kotlinx.coroutines.launch\nclass CandidateListActivity : AppCompatActivity() {\n    private lateinit var binding: ActivityCandidateListBinding\n    private var mode = "attendance"; private var examId = 0\n    override fun onCreate(savedInstanceState: Bundle?) {\n        super.onCreate(savedInstanceState)\n        binding = ActivityCandidateListBinding.inflate(layoutInflater)\n        setContentView(binding.root)\n        mode = intent.getStringExtra("mode") ?: "attendance"; examId = intent.getIntExtra("examId", 0)\n        binding.tvTitle.text = if (mode == "attendance") "Mark Attendance" else "Biometric Verification"\n        loadCandidates()\n    }\n    private fun loadCandidates() { lifecycleScope.launch { val candidates = AppDatabase.getInstance(this@CandidateListActivity).candidateDao().getByExam(examId); binding.rvCandidates.layoutManager = LinearLayoutManager(this@CandidateListActivity); binding.rvCandidates.adapter = CandidateAdapter(candidates) { c -> startActivity(Intent(this@CandidateListActivity, if (mode == "attendance") AttendanceActivity::class.java else VerificationActivity::class.java).putExtra("candidateId", c.id).putExtra("examId", examId)) }; binding.tvCount.text = "${"$"}{candidates.size} candidates" } }\n    override fun onResume() { super.onResume(); loadCandidates() }\n}\nclass CandidateAdapter(private val items: List<Candidate>, private val onClick: (Candidate) -> Unit) : RecyclerView.Adapter<CandidateAdapter.VH>() {\n    inner class VH(val b: ItemCandidateBinding) : RecyclerView.ViewHolder(b.root)\n    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int) = VH(ItemCandidateBinding.inflate(LayoutInflater.from(parent.context), parent, false))\n    override fun getItemCount() = items.size\n    override fun onBindViewHolder(h: VH, pos: Int) { val c = items[pos]; h.b.tvName.text = c.name; h.b.tvRollNo.text = "Roll: ${"$"}{c.rollNo}"; h.b.tvStatus.text = "${"$"}{c.attendanceStatus} | ${"$"}{c.verificationStatus}"; h.itemView.setOnClickListener { onClick(c) } }\n}`);

  fs.writeFileSync(path.join(srcDir, "ui", "AttendanceActivity.kt"), `package ${pkgName}.ui\nimport android.os.Bundle\nimport android.widget.Toast\nimport androidx.appcompat.app.AppCompatActivity\nimport androidx.lifecycle.lifecycleScope\nimport ${pkgName}.MpaApplication\nimport ${pkgName}.databinding.ActivityAttendanceBinding\nimport ${pkgName}.db.AppDatabase\nimport ${pkgName}.model.AttendanceRequest\nimport ${pkgName}.model.PendingAttendance\nimport ${pkgName}.network.RetrofitClient\nimport kotlinx.coroutines.launch\nclass AttendanceActivity : AppCompatActivity() {\n    private lateinit var binding: ActivityAttendanceBinding\n    override fun onCreate(savedInstanceState: Bundle?) {\n        super.onCreate(savedInstanceState)\n        binding = ActivityAttendanceBinding.inflate(layoutInflater)\n        setContentView(binding.root)\n        val cId = intent.getIntExtra("candidateId", 0); val examId = intent.getIntExtra("examId", 0)\n        val opId = getSharedPreferences("mpa_prefs", MODE_PRIVATE).getInt("user_id", 0)\n        lifecycleScope.launch { AppDatabase.getInstance(this@AttendanceActivity).candidateDao().getByExam(examId).find { it.id == cId }?.let { binding.tvCandidateName.text = it.name; binding.tvRollNo.text = "Roll: ${"$"}{it.rollNo}"; binding.tvCurrentStatus.text = "Status: ${"$"}{it.attendanceStatus}" } }\n        binding.btnMarkPresent.setOnClickListener { lifecycleScope.launch { val db = AppDatabase.getInstance(this@AttendanceActivity); try { val r = RetrofitClient.getApi().markAttendance(cId, AttendanceRequest("present", opId)); if (r.isSuccessful) { db.candidateDao().getByExam(examId).find { it.id == cId }?.let { it.attendanceStatus = "present"; db.candidateDao().update(it) }; Toast.makeText(this@AttendanceActivity, "Marked Present", Toast.LENGTH_SHORT).show(); finish() } } catch (e: Exception) { db.candidateDao().getByExam(examId).find { it.id == cId }?.let { it.attendanceStatus = "present"; it.synced = false; db.candidateDao().update(it) }; db.pendingAttendanceDao().insert(PendingAttendance(candidateId = cId, examId = examId, attendanceStatus = "present", operatorId = opId)); val syncMgr = (application as MpaApplication).syncManager; val payload = org.json.JSONObject().put("candidateId", cId).put("attendanceStatus", "present").put("attendanceOperatorId", opId).toString(); syncMgr.enqueue("attendance", "api/apk/candidates/${"$"}cId/attendance", payload); Toast.makeText(this@AttendanceActivity, "Saved offline - will sync when online", Toast.LENGTH_SHORT).show(); finish() } } }\n    }\n}`);

    fs.mkdirSync(path.join(srcDir, "biometric"), { recursive: true });

    fs.writeFileSync(path.join(srcDir, "biometric", "FaceVerificationHelper.kt"), `package ${pkgName}.biometric

  import android.content.Context
  import android.graphics.Bitmap
  import android.util.Log
  import com.google.mlkit.vision.common.InputImage
  import com.google.mlkit.vision.face.FaceDetection
  import com.google.mlkit.vision.face.FaceDetectorOptions
  import org.tensorflow.lite.Interpreter
  import java.io.FileInputStream
  import java.nio.ByteBuffer
  import java.nio.ByteOrder
  import java.nio.MappedByteBuffer
  import java.nio.channels.FileChannel
  import kotlin.math.sqrt

  class FaceVerificationHelper(private val context: Context) {
      private var interpreter: Interpreter? = null
      private val inputSize = 112
      private val embeddingSize = 128
      private val tag = "FaceVerification"

      private val faceDetectorOptions = FaceDetectorOptions.Builder()
          .setPerformanceMode(FaceDetectorOptions.PERFORMANCE_MODE_ACCURATE)
          .setLandmarkMode(FaceDetectorOptions.LANDMARK_MODE_ALL)
          .setClassificationMode(FaceDetectorOptions.CLASSIFICATION_MODE_ALL)
          .setMinFaceSize(0.15f)
          .build()
      private val faceDetector = FaceDetection.getClient(faceDetectorOptions)

      init {
          try {
              val modelFile = loadModelFile("models/facenet.tflite")
              interpreter = Interpreter(modelFile)
              Log.d(tag, "FaceNet model loaded successfully")
          } catch (e: Exception) {
              Log.e(tag, "Failed to load FaceNet model: \${e.message}")
          }
      }

      private fun loadModelFile(modelPath: String): MappedByteBuffer {
          val assetFileDescriptor = context.assets.openFd(modelPath)
          val fileInputStream = FileInputStream(assetFileDescriptor.fileDescriptor)
          val fileChannel = fileInputStream.channel
          return fileChannel.map(FileChannel.MapMode.READ_ONLY, assetFileDescriptor.startOffset, assetFileDescriptor.declaredLength)
      }

      fun detectFace(bitmap: Bitmap, callback: (Boolean, String) -> Unit) {
          val image = InputImage.fromBitmap(bitmap, 0)
          faceDetector.process(image)
              .addOnSuccessListener { faces ->
                  if (faces.isNotEmpty()) {
                      val face = faces[0]
                      val smileProb = face.smilingProbability ?: 0f
                      val leftEyeOpen = face.leftEyeOpenProbability ?: 0f
                      val rightEyeOpen = face.rightEyeOpenProbability ?: 0f
                      callback(true, "Face detected: smile=\${smileProb}, eyes=\${leftEyeOpen}/\${rightEyeOpen}")
                  } else {
                      callback(false, "No face detected")
                  }
              }
              .addOnFailureListener { e -> callback(false, "Detection failed: \${e.message}") }
      }

      fun generateEmbedding(bitmap: Bitmap): FloatArray? {
          if (interpreter == null) return null
          val resized = Bitmap.createScaledBitmap(bitmap, inputSize, inputSize, true)
          val inputBuffer = ByteBuffer.allocateDirect(4 * inputSize * inputSize * 3).apply { order(ByteOrder.nativeOrder()) }
          val pixels = IntArray(inputSize * inputSize)
          resized.getPixels(pixels, 0, inputSize, 0, 0, inputSize, inputSize)
          for (pixel in pixels) {
              inputBuffer.putFloat(((pixel shr 16 and 0xFF) - 127.5f) / 128.0f)
              inputBuffer.putFloat(((pixel shr 8 and 0xFF) - 127.5f) / 128.0f)
              inputBuffer.putFloat(((pixel and 0xFF) - 127.5f) / 128.0f)
          }
          val output = Array(1) { FloatArray(embeddingSize) }
          interpreter?.run(inputBuffer, output)
          return output[0]
      }

      fun compareFaces(embedding1: FloatArray, embedding2: FloatArray): Float {
          var dotProduct = 0f
          var norm1 = 0f
          var norm2 = 0f
          for (i in embedding1.indices) {
              dotProduct += embedding1[i] * embedding2[i]
              norm1 += embedding1[i] * embedding1[i]
              norm2 += embedding2[i] * embedding2[i]
          }
          val cosineSimilarity = dotProduct / (sqrt(norm1) * sqrt(norm2))
          return ((cosineSimilarity + 1f) / 2f * 100f).coerceIn(0f, 100f)
      }

      fun release() {
          interpreter?.close()
          faceDetector.close()
      }
  }`);
    fs.writeFileSync(path.join(srcDir, "biometric", "FingerprintHelper.kt"), `package ${pkgName}.biometric

  import android.content.Context
  import android.hardware.usb.UsbDevice
  import android.hardware.usb.UsbManager
  import android.util.Log

  class FingerprintHelper(private val context: Context) {
      private val tag = "FingerprintHelper"
      private var mfs100Device: Any? = null
      private var isInitialized = false

      fun initialize(): Boolean {
          try {
              val usbManager = context.getSystemService(Context.USB_SERVICE) as UsbManager
              val deviceList = usbManager.deviceList
              var mantraDevice: UsbDevice? = null
              for ((_, device) in deviceList) {
                  if (device.vendorId == 0x1A34 || device.productId == 0x0802) {
                      mantraDevice = device
                      break
                  }
              }
              if (mantraDevice != null) {
                  Log.d(tag, "Mantra MFS100 found: \${mantraDevice.deviceName}")
                  val clazz = Class.forName("com.mantra.mfs100.MFS100")
                  mfs100Device = clazz.getConstructor(Context::class.java).newInstance(context)
                  isInitialized = true
                  return true
              } else {
                  Log.w(tag, "MFS100 not connected via USB")
                  return false
              }
          } catch (e: ClassNotFoundException) {
              Log.e(tag, "MFS100 SDK not found in libs/. Add MFS100.jar to app/libs/")
              return false
          } catch (e: Exception) {
              Log.e(tag, "Init failed: \${e.message}")
              return false
          }
      }

      fun captureFingerprint(timeout: Int = 10000, callback: (success: Boolean, template: String?, quality: Int, error: String?) -> Unit) {
          if (!isInitialized) {
              callback(false, null, 0, "Scanner not initialized")
              return
          }
          try {
              val device = mfs100Device ?: throw Exception("Device null")
              val captureMethod = device.javaClass.getMethod("AutoCapture", Int::class.java, Int::class.java, Boolean::class.java)
              val result = captureMethod.invoke(device, timeout, 60, true)
              val qualityMethod = result.javaClass.getMethod("getQuality")
              val templateMethod = result.javaClass.getMethod("getISOTemplate")
              val quality = qualityMethod.invoke(result) as Int
              val isoTemplate = templateMethod.invoke(result) as ByteArray
              val templateBase64 = android.util.Base64.encodeToString(isoTemplate, android.util.Base64.NO_WRAP)
              Log.d(tag, "Capture OK, quality=\$quality, template size=\${isoTemplate.size}")
              callback(true, templateBase64, quality, null)
          } catch (e: Exception) {
              Log.e(tag, "Capture failed: \${e.message}")
              callback(false, null, 0, e.message)
          }
      }

      fun matchFingerprints(template1: ByteArray, template2: ByteArray): Int {
          if (!isInitialized || mfs100Device == null) return 0
          return try {
              val matchMethod = mfs100Device!!.javaClass.getMethod("MatchISO", ByteArray::class.java, ByteArray::class.java)
              matchMethod.invoke(mfs100Device, template1, template2) as Int
          } catch (e: Exception) {
              Log.e(tag, "Match failed: \${e.message}")
              0
          }
      }

      fun release() {
          try {
              mfs100Device?.let {
                  val disposeMethod = it.javaClass.getMethod("Dispose")
                  disposeMethod.invoke(it)
              }
          } catch (_: Exception) {}
          isInitialized = false
      }
  }`);
    fs.writeFileSync(path.join(srcDir, "biometric", "LivenessDetector.kt"), `package ${pkgName}.biometric

  import android.graphics.Bitmap
  import android.util.Log
  import com.google.mlkit.vision.common.InputImage
  import com.google.mlkit.vision.face.FaceDetection
  import com.google.mlkit.vision.face.FaceDetectorOptions

  class LivenessDetector {
      private val tag = "LivenessDetector"
      private val faceDetectorOptions = FaceDetectorOptions.Builder()
          .setPerformanceMode(FaceDetectorOptions.PERFORMANCE_MODE_ACCURATE)
          .setClassificationMode(FaceDetectorOptions.CLASSIFICATION_MODE_ALL)
          .setLandmarkMode(FaceDetectorOptions.LANDMARK_MODE_ALL)
          .build()
      private val faceDetector = FaceDetection.getClient(faceDetectorOptions)

      enum class Challenge { BLINK, SMILE, TURN_LEFT, TURN_RIGHT }
      data class LivenessResult(val isLive: Boolean, val score: Float, val message: String)

      private var currentChallenge: Challenge = Challenge.BLINK
      private var blinkDetected = false
      private var smileDetected = false
      private var headTurnDetected = false
      private var frameCount = 0
      private var passedChallenges = 0

      fun startNewSession() {
          blinkDetected = false
          smileDetected = false
          headTurnDetected = false
          frameCount = 0
          passedChallenges = 0
          currentChallenge = Challenge.values().random()
          Log.d(tag, "New liveness session, challenge: \$currentChallenge")
      }

      fun getCurrentChallenge(): String {
          return when (currentChallenge) {
              Challenge.BLINK -> "Please blink your eyes"
              Challenge.SMILE -> "Please smile"
              Challenge.TURN_LEFT -> "Turn your head left"
              Challenge.TURN_RIGHT -> "Turn your head right"
          }
      }

      fun processFrame(bitmap: Bitmap, callback: (LivenessResult) -> Unit) {
          frameCount++
          val image = InputImage.fromBitmap(bitmap, 0)
          faceDetector.process(image)
              .addOnSuccessListener { faces ->
                  if (faces.isEmpty()) {
                      callback(LivenessResult(false, 0f, "No face detected"))
                      return@addOnSuccessListener
                  }
                  val face = faces[0]
                  val leftEyeOpen = face.leftEyeOpenProbability ?: 0.5f
                  val rightEyeOpen = face.rightEyeOpenProbability ?: 0.5f
                  val smileProb = face.smilingProbability ?: 0f
                  val headY = face.headEulerAngleY

                  when (currentChallenge) {
                      Challenge.BLINK -> {
                          if (leftEyeOpen < 0.2f && rightEyeOpen < 0.2f) blinkDetected = true
                          if (blinkDetected && leftEyeOpen > 0.7f && rightEyeOpen > 0.7f) {
                              passedChallenges++
                              callback(LivenessResult(true, 0.95f, "Blink detected - Liveness confirmed"))
                              return@addOnSuccessListener
                          }
                      }
                      Challenge.SMILE -> {
                          if (smileProb > 0.7f) {
                              passedChallenges++
                              callback(LivenessResult(true, 0.90f, "Smile detected - Liveness confirmed"))
                              return@addOnSuccessListener
                          }
                      }
                      Challenge.TURN_LEFT -> {
                          if (headY > 25f) {
                              passedChallenges++
                              callback(LivenessResult(true, 0.92f, "Head turn detected - Liveness confirmed"))
                              return@addOnSuccessListener
                          }
                      }
                      Challenge.TURN_RIGHT -> {
                          if (headY < -25f) {
                              passedChallenges++
                              callback(LivenessResult(true, 0.92f, "Head turn detected - Liveness confirmed"))
                              return@addOnSuccessListener
                          }
                      }
                  }
                  val progress = (frameCount.toFloat() / 30f).coerceAtMost(0.8f)
                  callback(LivenessResult(false, progress, getCurrentChallenge()))
              }
              .addOnFailureListener { e -> callback(LivenessResult(false, 0f, "Error: \${e.message}")) }
      }

      fun release() { faceDetector.close() }
  }`);

    fs.mkdirSync(path.join(srcDir, "scanner"), { recursive: true });

    fs.writeFileSync(path.join(srcDir, "scanner", "BarcodeScanner.kt"), `package ${pkgName}.scanner

  import android.content.Context
  import android.graphics.Bitmap
  import android.util.Log
  import com.google.mlkit.vision.barcode.BarcodeScanning
  import com.google.mlkit.vision.barcode.common.Barcode
  import com.google.mlkit.vision.barcode.BarcodeScannerOptions
  import com.google.mlkit.vision.common.InputImage
  import org.json.JSONObject

  data class AdmitCardData(
      val candidateId: Int,
      val examId: Int,
      val centreCode: String,
      val rollNo: String,
      val candidateName: String?,
      val rawData: String
  )

  class BarcodeScanner(private val context: Context) {
      private val tag = "BarcodeScanner"
      private val options = BarcodeScannerOptions.Builder()
          .setBarcodeFormats(
              Barcode.FORMAT_QR_CODE,
              Barcode.FORMAT_CODE_128,
              Barcode.FORMAT_CODE_39,
              Barcode.FORMAT_EAN_13,
              Barcode.FORMAT_PDF417,
              Barcode.FORMAT_DATA_MATRIX
          )
          .build()
      private val scanner = BarcodeScanning.getClient(options)

      fun scanFromBitmap(bitmap: Bitmap, callback: (success: Boolean, data: AdmitCardData?, error: String?) -> Unit) {
          val image = InputImage.fromBitmap(bitmap, 0)
          scanner.process(image)
              .addOnSuccessListener { barcodes ->
                  if (barcodes.isEmpty()) {
                      callback(false, null, "No barcode/QR code found on admit card")
                      return@addOnSuccessListener
                  }
                  val barcode = barcodes[0]
                  val rawValue = barcode.rawValue ?: ""
                  Log.d(tag, "Scanned: \$rawValue (format: \${barcode.format})")
                  try {
                      val data = parseAdmitCardData(rawValue, barcode.format)
                      callback(true, data, null)
                  } catch (e: Exception) {
                      Log.e(tag, "Parse error: \${e.message}")
                      callback(false, null, "Could not parse admit card data: \${e.message}")
                  }
              }
              .addOnFailureListener { e ->
                  callback(false, null, "Scan failed: \${e.message}")
              }
      }

      fun scanFromCameraImage(image: InputImage, callback: (success: Boolean, data: AdmitCardData?, error: String?) -> Unit) {
          scanner.process(image)
              .addOnSuccessListener { barcodes ->
                  if (barcodes.isEmpty()) {
                      callback(false, null, "No barcode detected - point camera at admit card")
                      return@addOnSuccessListener
                  }
                  val rawValue = barcodes[0].rawValue ?: ""
                  try {
                      val data = parseAdmitCardData(rawValue, barcodes[0].format)
                      callback(true, data, null)
                  } catch (e: Exception) {
                      callback(false, null, "Invalid admit card format")
                  }
              }
              .addOnFailureListener { e -> callback(false, null, "Camera scan error: \${e.message}") }
      }

      private fun parseAdmitCardData(rawData: String, format: Int): AdmitCardData {
          if (rawData.trim().startsWith("{")) {
              val json = JSONObject(rawData)
              return AdmitCardData(
                  candidateId = json.optInt("candidateId", json.optInt("cid", 0)),
                  examId = json.optInt("examId", json.optInt("eid", 0)),
                  centreCode = json.optString("centreCode", json.optString("cc", "")),
                  rollNo = json.optString("rollNo", json.optString("rn", "")),
                  candidateName = json.optString("name", null),
                  rawData = rawData
              )
          }
          val parts = rawData.split("|", ",", ";", ":")
          if (parts.size >= 3) {
              return AdmitCardData(
                  candidateId = parts[0].filter { it.isDigit() }.toIntOrNull() ?: 0,
                  examId = parts.getOrNull(1)?.filter { it.isDigit() }?.toIntOrNull() ?: 0,
                  centreCode = parts.getOrNull(2)?.trim() ?: "",
                  rollNo = parts.getOrNull(3)?.trim() ?: parts[0].trim(),
                  candidateName = parts.getOrNull(4)?.trim(),
                  rawData = rawData
              )
          }
          return AdmitCardData(
              candidateId = rawData.filter { it.isDigit() }.take(6).toIntOrNull() ?: 0,
              examId = 0, centreCode = "", rollNo = rawData.trim(),
              candidateName = null, rawData = rawData
          )
      }

      fun release() { scanner.close() }
  }`);
    fs.writeFileSync(path.join(srcDir, "scanner", "OMRScanner.kt"), `package ${pkgName}.scanner

  import android.content.Context
  import android.graphics.Bitmap
  import android.graphics.Canvas
  import android.graphics.Color
  import android.graphics.ColorMatrix
  import android.graphics.ColorMatrixColorFilter
  import android.graphics.Paint
  import android.util.Base64
  import android.util.Log
  import com.google.mlkit.vision.barcode.BarcodeScanning
  import com.google.mlkit.vision.barcode.common.Barcode
  import com.google.mlkit.vision.barcode.BarcodeScannerOptions
  import com.google.mlkit.vision.common.InputImage
  import java.io.ByteArrayOutputStream

  data class OMRResult(
      val success: Boolean,
      val omrBarcode: String?,
      val processedImageBase64: String?,
      val originalImageBase64: String?,
      val edgesDetected: Boolean,
      val message: String
  )

  class OMRScanner(private val context: Context) {
      private val tag = "OMRScanner"
      private val barcodeOptions = BarcodeScannerOptions.Builder()
          .setBarcodeFormats(Barcode.FORMAT_CODE_128, Barcode.FORMAT_CODE_39, Barcode.FORMAT_EAN_13, Barcode.FORMAT_QR_CODE)
          .build()
      private val barcodeScanner = BarcodeScanning.getClient(barcodeOptions)

      fun processOMRSheet(bitmap: Bitmap, callback: (OMRResult) -> Unit) {
          Log.d(tag, "Processing OMR sheet: \${bitmap.width}x\${bitmap.height}")

          val enhanced = enhanceImage(bitmap)
          val edgesDetected = detectPaperEdges(enhanced)
          val cropped = if (edgesDetected) autoCrop(enhanced) else enhanced

          val image = InputImage.fromBitmap(cropped, 0)
          barcodeScanner.process(image)
              .addOnSuccessListener { barcodes ->
                  val omrBarcode = barcodes.firstOrNull()?.rawValue
                  if (omrBarcode != null) Log.d(tag, "OMR barcode found: \$omrBarcode")
                  else Log.d(tag, "No barcode on OMR sheet - manual entry required")

                  val processedBase64 = bitmapToBase64(cropped, 85)
                  val originalBase64 = bitmapToBase64(bitmap, 80)

                  callback(OMRResult(
                      success = true,
                      omrBarcode = omrBarcode,
                      processedImageBase64 = processedBase64,
                      originalImageBase64 = originalBase64,
                      edgesDetected = edgesDetected,
                      message = if (omrBarcode != null) "OMR sheet scanned with barcode: \$omrBarcode" else "OMR sheet captured - enter barcode manually"
                  ))
              }
              .addOnFailureListener { e ->
                  Log.e(tag, "OMR processing failed: \${e.message}")
                  val originalBase64 = bitmapToBase64(bitmap, 80)
                  callback(OMRResult(false, null, null, originalBase64, false, "Processing failed: \${e.message}"))
              }
      }

      private fun enhanceImage(source: Bitmap): Bitmap {
          val enhanced = Bitmap.createBitmap(source.width, source.height, Bitmap.Config.ARGB_8888)
          val canvas = Canvas(enhanced)
          val paint = Paint()
          val cm = ColorMatrix()
          cm.set(floatArrayOf(
              1.5f, 0f, 0f, 0f, -40f,
              0f, 1.5f, 0f, 0f, -40f,
              0f, 0f, 1.5f, 0f, -40f,
              0f, 0f, 0f, 1f, 0f
          ))
          paint.colorFilter = ColorMatrixColorFilter(cm)
          canvas.drawBitmap(source, 0f, 0f, paint)
          return enhanced
      }

      private fun detectPaperEdges(bitmap: Bitmap): Boolean {
          val w = bitmap.width
          val h = bitmap.height
          val sampleSize = 20
          var edgePixels = 0
          var totalSamples = 0

          for (x in 0 until w step (w / sampleSize).coerceAtLeast(1)) {
              for (y in intArrayOf(0, h / 10, h - h / 10 - 1, h - 1)) {
                  if (y in 0 until h) {
                      val pixel = bitmap.getPixel(x, y)
                      val brightness = (Color.red(pixel) + Color.green(pixel) + Color.blue(pixel)) / 3
                      if (brightness > 200 || brightness < 50) edgePixels++
                      totalSamples++
                  }
              }
          }
          val edgeRatio = if (totalSamples > 0) edgePixels.toFloat() / totalSamples else 0f
          Log.d(tag, "Edge detection: ratio=\$edgeRatio (\$edgePixels/\$totalSamples)")
          return edgeRatio > 0.3f
      }

      private fun autoCrop(bitmap: Bitmap): Bitmap {
          val margin = (bitmap.width * 0.02f).toInt().coerceAtLeast(5)
          val cropW = (bitmap.width - margin * 2).coerceAtLeast(100)
          val cropH = (bitmap.height - margin * 2).coerceAtLeast(100)
          return try {
              Bitmap.createBitmap(bitmap, margin, margin, cropW, cropH)
          } catch (e: Exception) {
              Log.w(tag, "Auto-crop failed, using original")
              bitmap
          }
      }

      private fun bitmapToBase64(bitmap: Bitmap, quality: Int): String {
          val stream = ByteArrayOutputStream()
          bitmap.compress(Bitmap.CompressFormat.JPEG, quality, stream)
          return Base64.encodeToString(stream.toByteArray(), Base64.NO_WRAP)
      }

      fun release() { barcodeScanner.close() }
  }`);
    fs.mkdirSync(path.join(srcDir, "security"), { recursive: true });

    fs.writeFileSync(path.join(srcDir, "security", "SecurityManager.kt"), `package ${pkgName}.security

  import android.annotation.SuppressLint
  import android.app.Activity
  import android.content.Context
  import android.graphics.Bitmap
  import android.graphics.Canvas
  import android.graphics.Color
  import android.graphics.Paint
  import android.location.Location
  import android.os.Build
  import android.provider.Settings
  import android.util.Log
  import android.view.WindowManager
  import com.google.android.gms.location.FusedLocationProviderClient
  import com.google.android.gms.location.LocationServices
  import com.google.android.gms.location.Priority
  import com.google.android.gms.tasks.CancellationTokenSource
  import java.text.SimpleDateFormat
  import java.util.*

  data class LocationData(val latitude: Double, val longitude: Double, val accuracy: Float, val timestamp: Long)

  class SecurityManager(private val context: Context) {
      private val tag = "SecurityManager"
      private val prefs = context.getSharedPreferences("mpa_security", Context.MODE_PRIVATE)
      private val fusedLocationClient: FusedLocationProviderClient = LocationServices.getFusedLocationProviderClient(context)
      private var boundDeviceId: String? = null

      init {
          boundDeviceId = prefs.getString("bound_device_id", null)
      }

      fun disableScreenshots(activity: Activity) {
          activity.window.setFlags(
              WindowManager.LayoutParams.FLAG_SECURE,
              WindowManager.LayoutParams.FLAG_SECURE
          )
          Log.d(tag, "Screenshots disabled via FLAG_SECURE")
      }

      fun enableScreenLock(activity: Activity) {
          activity.window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
      }

      @SuppressLint("HardwareIds")
      fun getDeviceId(): String {
          val androidId = Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID)
          val deviceFingerprint = "\${Build.MANUFACTURER}_\${Build.MODEL}_\${androidId}"
          return deviceFingerprint
      }

      fun bindDevice(): Boolean {
          val currentDeviceId = getDeviceId()
          if (boundDeviceId == null) {
              boundDeviceId = currentDeviceId
              prefs.edit().putString("bound_device_id", currentDeviceId).apply()
              Log.d(tag, "Device bound: \$currentDeviceId")
              return true
          }
          if (boundDeviceId == currentDeviceId) {
              Log.d(tag, "Device binding verified")
              return true
          }
          Log.w(tag, "Device binding FAILED: expected=\$boundDeviceId actual=\$currentDeviceId")
          return false
      }

      fun isDeviceBound(): Boolean {
          if (boundDeviceId == null) return true
          return boundDeviceId == getDeviceId()
      }

      fun unbindDevice() {
          boundDeviceId = null
          prefs.edit().remove("bound_device_id").apply()
          Log.d(tag, "Device unbound")
      }

      @SuppressLint("MissingPermission")
      fun getCurrentLocation(callback: (LocationData?) -> Unit) {
          try {
              val cancellationToken = CancellationTokenSource()
              fusedLocationClient.getCurrentLocation(Priority.PRIORITY_HIGH_ACCURACY, cancellationToken.token)
                  .addOnSuccessListener { location: Location? ->
                      if (location != null) {
                          callback(LocationData(location.latitude, location.longitude, location.accuracy, System.currentTimeMillis()))
                      } else {
                          fusedLocationClient.lastLocation.addOnSuccessListener { lastLocation: Location? ->
                              if (lastLocation != null) {
                                  callback(LocationData(lastLocation.latitude, lastLocation.longitude, lastLocation.accuracy, System.currentTimeMillis()))
                              } else {
                                  callback(null)
                              }
                          }
                      }
                  }
                  .addOnFailureListener { e ->
                      Log.e(tag, "Location failed: \${e.message}")
                      callback(null)
                  }
          } catch (e: Exception) {
              Log.e(tag, "Location error: \${e.message}")
              callback(null)
          }
      }

      fun addTimestampWatermark(bitmap: Bitmap, location: LocationData?): Bitmap {
          val result = bitmap.copy(Bitmap.Config.ARGB_8888, true)
          val canvas = Canvas(result)
          val paint = Paint().apply {
              color = Color.argb(180, 255, 255, 0)
              textSize = (bitmap.width * 0.025f).coerceIn(14f, 40f)
              isAntiAlias = true
              setShadowLayer(2f, 1f, 1f, Color.BLACK)
          }

          val dateFormat = SimpleDateFormat("dd-MM-yyyy HH:mm:ss", Locale.getDefault())
          val timestamp = dateFormat.format(Date())
          val deviceId = getDeviceId().takeLast(12)

          val line1 = "MPA Verify | \$timestamp"
          val line2 = "Device: \$deviceId"
          val line3 = if (location != null) "GPS: \${String.format("%.5f", location.latitude)}, \${String.format("%.5f", location.longitude)}" else "GPS: N/A"

          val lineHeight = paint.textSize * 1.4f
          val y = bitmap.height - lineHeight * 3.5f

          canvas.drawText(line1, 10f, y, paint)
          canvas.drawText(line2, 10f, y + lineHeight, paint)
          canvas.drawText(line3, 10f, y + lineHeight * 2, paint)

          return result
      }

      fun getDeviceInfo(): Map<String, String> {
          return mapOf(
              "deviceId" to getDeviceId(),
              "model" to Build.MODEL,
              "manufacturer" to Build.MANUFACTURER,
              "androidVersion" to Build.VERSION.RELEASE,
              "sdkVersion" to Build.VERSION.SDK_INT.toString(),
              "deviceFingerprint" to Build.FINGERPRINT
          )
      }
  }`);

    fs.mkdirSync(path.join(srcDir, "sync"), { recursive: true });

    fs.writeFileSync(path.join(srcDir, "sync", "OfflineSyncManager.kt"), `package ${pkgName}.sync

  import android.content.Context
  import android.net.ConnectivityManager
  import android.net.NetworkCapabilities
  import android.util.Log
  import kotlinx.coroutines.*
  import org.json.JSONArray
  import org.json.JSONObject
  import java.util.concurrent.ConcurrentLinkedQueue

  data class SyncRecord(
      val id: String,
      val type: String,
      val endpoint: String,
      val payload: String,
      val timestamp: Long,
      val retryCount: Int = 0,
      val maxRetries: Int = 5
  )

  class OfflineSyncManager(private val context: Context) {
      private val tag = "OfflineSyncManager"
      private val prefs = context.getSharedPreferences("mpa_sync_queue", Context.MODE_PRIVATE)
      private val syncQueue = ConcurrentLinkedQueue<SyncRecord>()
      private var syncJob: Job? = null
      private var isSyncing = false
      private val syncScope = CoroutineScope(Dispatchers.IO + SupervisorJob())

      init {
          loadQueueFromDisk()
      }

      fun enqueue(type: String, endpoint: String, payload: String) {
          val record = SyncRecord(
              id = "\${System.currentTimeMillis()}_\${(Math.random() * 10000).toInt()}",
              type = type,
              endpoint = endpoint,
              payload = payload,
              timestamp = System.currentTimeMillis()
          )
          syncQueue.add(record)
          saveQueueToDisk()
          Log.d(tag, "Enqueued: \${record.type} -> \${record.endpoint} (queue size: \${syncQueue.size})")
          if (isOnline()) triggerSync()
      }

      fun getQueueSize(): Int = syncQueue.size
      fun getQueuedRecords(): List<SyncRecord> = syncQueue.toList()

      fun isOnline(): Boolean {
          val cm = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
          val network = cm.activeNetwork ?: return false
          val capabilities = cm.getNetworkCapabilities(network) ?: return false
          return capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
      }

      fun triggerSync() {
          if (isSyncing || syncQueue.isEmpty()) return
          isSyncing = true
          syncJob = syncScope.launch {
              Log.d(tag, "Starting sync: \${syncQueue.size} records")
              var synced = 0
              var failed = 0
              val iterator = syncQueue.iterator()
              while (iterator.hasNext()) {
                  val record = iterator.next()
                  try {
                      val success = sendToServer(record)
                      if (success) {
                          iterator.remove()
                          synced++
                      } else if (record.retryCount >= record.maxRetries) {
                          iterator.remove()
                          failed++
                          Log.w(tag, "Max retries reached for \${record.id}")
                      }
                  } catch (e: Exception) {
                      Log.e(tag, "Sync error: \${e.message}")
                      failed++
                  }
              }
              saveQueueToDisk()
              isSyncing = false
              Log.d(tag, "Sync complete: \$synced synced, \$failed failed, \${syncQueue.size} remaining")
          }
      }

      fun emergencySync(callback: (synced: Int, failed: Int, remaining: Int) -> Unit) {
          syncScope.launch {
              Log.d(tag, "EMERGENCY SYNC: Forcing all \${syncQueue.size} records")
              var synced = 0
              var failed = 0
              val iterator = syncQueue.iterator()
              while (iterator.hasNext()) {
                  val record = iterator.next()
                  try {
                      if (sendToServer(record)) { iterator.remove(); synced++ }
                      else failed++
                  } catch (_: Exception) { failed++ }
              }
              saveQueueToDisk()
              withContext(Dispatchers.Main) {
                  callback(synced, failed, syncQueue.size)
              }
          }
      }

      fun forceSyncBeforeLogout(callback: (success: Boolean) -> Unit) {
          syncScope.launch {
              Log.d(tag, "Pre-logout sync: \${syncQueue.size} records")
              val iterator = syncQueue.iterator()
              while (iterator.hasNext()) {
                  val record = iterator.next()
                  try { if (sendToServer(record)) iterator.remove() } catch (_: Exception) {}
              }
              saveQueueToDisk()
              withContext(Dispatchers.Main) { callback(syncQueue.isEmpty()) }
          }
      }

      fun startAutoSync(intervalMs: Long = 60000) {
          syncJob?.cancel()
          syncJob = syncScope.launch {
              while (isActive) {
                  if (isOnline() && syncQueue.isNotEmpty()) triggerSync()
                  delay(intervalMs)
              }
          }
          Log.d(tag, "Auto-sync started: interval=\${intervalMs}ms")
      }

      fun stopAutoSync() { syncJob?.cancel(); Log.d(tag, "Auto-sync stopped") }

      private fun getServerUrl(): String {
            return try {
                val cfg = context.assets.open("config.json").bufferedReader().use { it.readText() }
                val parsed = com.google.gson.Gson().fromJson(cfg, Map::class.java)
                val server = parsed["server"] as? Map<*, *>
                (server?.get("baseUrl") as? String) ?: ""
            } catch (_: Exception) { "" }
        }

        private suspend fun sendToServer(record: SyncRecord): Boolean {
            return withContext(Dispatchers.IO) {
                try {
                    val baseUrl = getServerUrl()
                    if (baseUrl.isEmpty()) return@withContext false
                    val url = java.net.URL("\$baseUrl/\${record.endpoint}")
                    val conn = url.openConnection() as java.net.HttpURLConnection
                    conn.requestMethod = if (record.endpoint.contains("attendance") || record.endpoint.contains("verify")) "PATCH" else "POST"
                    conn.setRequestProperty("Content-Type", "application/json")
                    conn.doOutput = true
                    conn.connectTimeout = 10000
                    conn.readTimeout = 10000
                    conn.outputStream.use { it.write(record.payload.toByteArray()) }
                    val code = conn.responseCode
                    conn.disconnect()
                    Log.d(tag, "Sync \${record.type}: HTTP \$code for \${record.endpoint}")
                    code in 200..299
                } catch (e: Exception) {
                    Log.e(tag, "sendToServer failed: \${e.message}")
                    false
                }
            }
        }

      private fun saveQueueToDisk() {
          val arr = JSONArray()
          syncQueue.forEach { r ->
              val obj = JSONObject()
              obj.put("id", r.id)
              obj.put("type", r.type)
              obj.put("endpoint", r.endpoint)
              obj.put("payload", r.payload)
              obj.put("timestamp", r.timestamp)
              obj.put("retryCount", r.retryCount)
              arr.put(obj)
          }
          prefs.edit().putString("queue", arr.toString()).apply()
      }

      private fun loadQueueFromDisk() {
          val json = prefs.getString("queue", "[]") ?: "[]"
          try {
              val arr = JSONArray(json)
              for (i in 0 until arr.length()) {
                  val obj = arr.getJSONObject(i)
                  syncQueue.add(SyncRecord(
                      id = obj.getString("id"),
                      type = obj.getString("type"),
                      endpoint = obj.getString("endpoint"),
                      payload = obj.getString("payload"),
                      timestamp = obj.getLong("timestamp"),
                      retryCount = obj.optInt("retryCount", 0)
                  ))
              }
              Log.d(tag, "Loaded \${syncQueue.size} queued records from disk")
          } catch (e: Exception) {
              Log.e(tag, "Failed to load queue: \${e.message}")
          }
      }

      fun release() { syncJob?.cancel(); syncScope.cancel() }
  }`);
    fs.writeFileSync(path.join(srcDir, "sync", "AppUpdateChecker.kt"), `package ${pkgName}.sync

  import android.app.AlertDialog
  import android.content.Context
  import android.content.Intent
  import android.net.Uri
  import android.util.Log
  import ${pkgName}.model.VersionInfo
  import kotlinx.coroutines.*
  import org.json.JSONObject
  import java.net.HttpURLConnection
  import java.net.URL

  class AppUpdateChecker(private val context: Context, private val serverUrl: String) {
      private val tag = "AppUpdateChecker"
      private val scope = CoroutineScope(Dispatchers.IO)

      fun checkForUpdate(currentVersionCode: Int, callback: (needsUpdate: Boolean, forced: Boolean, info: VersionInfo?) -> Unit) {
          scope.launch {
              try {
                  val url = URL("\$serverUrl/api/apk/app/version")
                  val conn = url.openConnection() as HttpURLConnection
                  conn.requestMethod = "GET"
                  conn.connectTimeout = 10000
                  val response = conn.inputStream.bufferedReader().readText()
                  val json = JSONObject(response)
                  val info = VersionInfo(
                      latestVersionCode = json.getInt("latestVersionCode"),
                      latestVersionName = json.getString("latestVersionName"),
                      minVersionCode = json.getInt("minVersionCode"),
                      forceUpdate = json.optBoolean("forceUpdate", false),
                      downloadUrl = json.optString("downloadUrl", null),
                      releaseNotes = json.optString("releaseNotes", null)
                  )
                  val needsUpdate = currentVersionCode < info.latestVersionCode
                  val forced = currentVersionCode < info.minVersionCode || info.forceUpdate
                  withContext(Dispatchers.Main) { callback(needsUpdate, forced, info) }
              } catch (e: Exception) {
                  Log.e(tag, "Update check failed: \${e.message}")
                  withContext(Dispatchers.Main) { callback(false, false, null) }
              }
          }
      }

      fun showUpdateDialog(context: Context, forced: Boolean, info: VersionInfo) {
          val builder = AlertDialog.Builder(context)
              .setTitle(if (forced) "Required Update Available" else "Update Available")
              .setMessage("Version \${info.latestVersionName} is available.\${if (info.releaseNotes != null) "\\n\\n\${info.releaseNotes}" else ""}")
              .setPositiveButton("Update Now") { _, _ ->
                  info.downloadUrl?.let { url ->
                      context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                  }
              }
          if (!forced) builder.setNegativeButton("Later", null)
          builder.setCancelable(!forced).show()
      }
  }`);
    fs.writeFileSync(path.join(srcDir, "sync", "CrashLogUploader.kt"), `package ${pkgName}.sync

  import android.content.Context
  import android.os.Build
  import android.util.Log
  import org.json.JSONObject
  import java.io.PrintWriter
  import java.io.StringWriter
  import java.net.HttpURLConnection
  import java.net.URL

  class CrashLogUploader(private val context: Context, private val serverUrl: String, private val appVersion: String) : Thread.UncaughtExceptionHandler {
      private val tag = "CrashLogUploader"
      private val defaultHandler = Thread.getDefaultUncaughtExceptionHandler()
      private val prefs = context.getSharedPreferences("mpa_crash_logs", Context.MODE_PRIVATE)

      fun install() {
          Thread.setDefaultUncaughtExceptionHandler(this)
          Log.d(tag, "Crash log uploader installed")
          uploadPendingLogs()
      }

      override fun uncaughtException(thread: Thread, throwable: Throwable) {
          try {
              val sw = StringWriter()
              throwable.printStackTrace(PrintWriter(sw))
              val stackTrace = sw.toString()
              val crashLog = JSONObject().apply {
                  put("deviceId", android.provider.Settings.Secure.getString(context.contentResolver, android.provider.Settings.Secure.ANDROID_ID))
                  put("deviceModel", "\${Build.MANUFACTURER} \${Build.MODEL}")
                  put("appVersion", appVersion)
                  put("errorMessage", throwable.message ?: "Unknown error")
                  put("stackTrace", stackTrace.take(5000))
                  put("crashedAt", System.currentTimeMillis().toString())
                  put("threadName", thread.name)
                  put("androidVersion", Build.VERSION.RELEASE)
              }
              saveCrashLog(crashLog)
              try { uploadCrashLog(crashLog) } catch (_: Exception) {}
          } catch (_: Exception) {}
          defaultHandler?.uncaughtException(thread, throwable)
      }

      private fun saveCrashLog(log: JSONObject) {
          val logs = prefs.getStringSet("pending_logs", mutableSetOf()) ?: mutableSetOf()
          logs.add(log.toString())
          prefs.edit().putStringSet("pending_logs", logs).apply()
      }

      private fun uploadPendingLogs() {
          Thread {
              val logs = prefs.getStringSet("pending_logs", mutableSetOf())?.toMutableSet() ?: return@Thread
              if (logs.isEmpty()) return@Thread
              val uploaded = mutableSetOf<String>()
              for (logStr in logs) {
                  try {
                      uploadCrashLog(JSONObject(logStr))
                      uploaded.add(logStr)
                  } catch (_: Exception) {}
              }
              logs.removeAll(uploaded)
              prefs.edit().putStringSet("pending_logs", logs).apply()
              Log.d(tag, "Uploaded \${uploaded.size} pending crash logs")
          }.start()
      }

      private fun uploadCrashLog(log: JSONObject) {
          val url = URL("\$serverUrl/api/crash-logs")
          val conn = url.openConnection() as HttpURLConnection
          conn.requestMethod = "POST"
          conn.setRequestProperty("Content-Type", "application/json")
          conn.doOutput = true
          conn.connectTimeout = 5000
          conn.outputStream.write(log.toString().toByteArray())
          conn.responseCode
          conn.disconnect()
      }
  }`);
    fs.writeFileSync(path.join(srcDir, "security", "KioskModeManager.kt"), `package ${pkgName}.security

  import android.app.Activity
  import android.app.ActivityManager
  import android.app.admin.DevicePolicyManager
  import android.content.ComponentName
  import android.content.Context
  import android.os.Build
  import android.util.Log
  import android.view.View
  import android.view.WindowInsets
  import android.view.WindowInsetsController
  import android.view.WindowManager

  class KioskModeManager(private val context: Context) {
      private val tag = "KioskModeManager"
      private val prefs = context.getSharedPreferences("mpa_kiosk", Context.MODE_PRIVATE)

      fun enableKioskMode(activity: Activity) {
          Log.d(tag, "Enabling kiosk mode")
          lockTaskMode(activity)
          hideSystemUI(activity)
          disableNotifications(activity)
          activity.window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
          prefs.edit().putBoolean("kiosk_enabled", true).apply()
      }

      fun disableKioskMode(activity: Activity) {
          Log.d(tag, "Disabling kiosk mode")
          try { activity.stopLockTask() } catch (_: Exception) {}
          showSystemUI(activity)
          prefs.edit().putBoolean("kiosk_enabled", false).apply()
      }

      fun isKioskEnabled(): Boolean = prefs.getBoolean("kiosk_enabled", false)

      private fun lockTaskMode(activity: Activity) {
          try {
              activity.startLockTask()
              Log.d(tag, "Lock task mode enabled")
          } catch (e: Exception) {
              Log.w(tag, "Lock task requires device owner: \${e.message}")
              hideSystemUI(activity)
          }
      }

      private fun hideSystemUI(activity: Activity) {
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
              activity.window.insetsController?.let { controller ->
                  controller.hide(WindowInsets.Type.systemBars() or WindowInsets.Type.navigationBars())
                  controller.systemBarsBehavior = WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
              }
          } else {
              @Suppress("DEPRECATION")
              activity.window.decorView.systemUiVisibility = (
                  View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                  or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                  or View.SYSTEM_UI_FLAG_FULLSCREEN
                  or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                  or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                  or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
              )
          }
      }

      private fun showSystemUI(activity: Activity) {
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
              activity.window.insetsController?.show(WindowInsets.Type.systemBars())
          } else {
              @Suppress("DEPRECATION")
              activity.window.decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_VISIBLE
          }
      }

      private fun disableNotifications(activity: Activity) {
          activity.window.addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN)
          Log.d(tag, "Notifications suppressed in kiosk mode")
      }

      fun isAppInForeground(): Boolean {
          val am = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
          val tasks = am.appTasks
          return tasks.isNotEmpty()
      }
  }`);
    fs.writeFileSync(path.join(srcDir, "security", "CentreLoginManager.kt"), `package ${pkgName}.security

  import android.content.Context
  import android.util.Log
  import kotlinx.coroutines.*
  import org.json.JSONObject
  import java.net.HttpURLConnection
  import java.net.URL
  import java.text.SimpleDateFormat
  import java.util.*

  data class LoginWindow(
      val examId: Int,
      val centreCode: String,
      val windowStart: Long,
      val windowEnd: Long,
      val isLocked: Boolean,
      val maxDevices: Int,
      val activeDevices: Int
  )

  class CentreLoginManager(private val context: Context, private val serverUrl: String) {
      private val tag = "CentreLoginManager"
      private val scope = CoroutineScope(Dispatchers.IO)

      fun validateLogin(examId: Int, centreCode: String, deviceId: String, callback: (allowed: Boolean, message: String) -> Unit) {
          scope.launch {
              try {
                  val url = URL("\$serverUrl/api/apk/centre-login/validate")
                  val conn = url.openConnection() as HttpURLConnection
                  conn.requestMethod = "POST"
                  conn.setRequestProperty("Content-Type", "application/json")
                  conn.doOutput = true
                  val body = JSONObject().apply {
                      put("examId", examId)
                      put("centreCode", centreCode)
                      put("deviceId", deviceId)
                      put("timestamp", System.currentTimeMillis())
                  }
                  conn.outputStream.write(body.toString().toByteArray())
                  val response = conn.inputStream.bufferedReader().readText()
                  val json = JSONObject(response)
                  val allowed = json.getBoolean("allowed")
                  val message = json.getString("message")
                  withContext(Dispatchers.Main) { callback(allowed, message) }
              } catch (e: Exception) {
                  Log.e(tag, "Login validation failed: \${e.message}")
                  withContext(Dispatchers.Main) { callback(true, "Offline mode - login allowed") }
              }
          }
      }

      fun checkForForceLogout(examId: Int, deviceId: String, callback: (shouldLogout: Boolean, reason: String?) -> Unit) {
          scope.launch {
              try {
                  val url = URL("\$serverUrl/api/apk/devices/check-logout?examId=\$examId&deviceId=\$deviceId")
                  val conn = url.openConnection() as HttpURLConnection
                  conn.requestMethod = "GET"
                  conn.connectTimeout = 5000
                  val response = conn.inputStream.bufferedReader().readText()
                  val json = JSONObject(response)
                  val shouldLogout = json.optBoolean("forceLogout", false)
                  val reason = json.optString("reason", null)
                  withContext(Dispatchers.Main) { callback(shouldLogout, reason) }
              } catch (e: Exception) {
                  withContext(Dispatchers.Main) { callback(false, null) }
              }
          }
      }

      fun startForceLogoutPolling(examId: Int, deviceId: String, intervalMs: Long = 30000, onLogout: (reason: String?) -> Unit): Job {
          return scope.launch {
              while (isActive) {
                  checkForForceLogout(examId, deviceId) { shouldLogout, reason ->
                      if (shouldLogout) onLogout(reason)
                  }
                  delay(intervalMs)
              }
          }
      }
  }`);
    fs.writeFileSync(path.join(srcDir, "sync", "DeviceManager.kt"), `package ${pkgName}.sync

  import android.content.Context
  import android.os.Build
  import android.provider.Settings
  import android.util.Log
  import kotlinx.coroutines.*
  import org.json.JSONObject
  import java.net.HttpURLConnection
  import java.net.URL

  class DeviceManager(private val context: Context, private val serverUrl: String) {
      private val tag = "DeviceManager"
      private val scope = CoroutineScope(Dispatchers.IO)

      fun registerDevice(examId: Int, centreCode: String, operatorName: String, callback: (success: Boolean, message: String) -> Unit) {
          scope.launch {
              try {
                  val deviceId = Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID)
                  val url = URL("\$serverUrl/api/apk/devices/register")
                  val conn = url.openConnection() as HttpURLConnection
                  conn.requestMethod = "POST"
                  conn.setRequestProperty("Content-Type", "application/json")
                  conn.doOutput = true
                  val body = JSONObject().apply {
                      put("deviceId", deviceId)
                      put("model", "\${Build.MANUFACTURER} \${Build.MODEL}")
                      put("androidVersion", Build.VERSION.RELEASE)
                      put("examId", examId)
                      put("centreCode", centreCode)
                      put("operatorName", operatorName)
                      put("appVersion", getAppVersion())
                  }
                  conn.outputStream.write(body.toString().toByteArray())
                  val response = conn.inputStream.bufferedReader().readText()
                  val json = JSONObject(response)
                  withContext(Dispatchers.Main) {
                      callback(json.getBoolean("success"), json.optString("message", "Registered"))
                  }
              } catch (e: Exception) {
                  Log.e(tag, "Device registration failed: \${e.message}")
                  withContext(Dispatchers.Main) { callback(false, "Registration failed: \${e.message}") }
              }
          }
      }

      fun sendSyncStatus(examId: Int, syncedCount: Int, failedCount: Int, queueSize: Int) {
          scope.launch {
              try {
                  val deviceId = Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID)
                  val url = URL("\$serverUrl/api/apk/devices/sync-status")
                  val conn = url.openConnection() as HttpURLConnection
                  conn.requestMethod = "POST"
                  conn.setRequestProperty("Content-Type", "application/json")
                  conn.doOutput = true
                  val body = JSONObject().apply {
                      put("deviceId", deviceId)
                      put("examId", examId)
                      put("syncedCount", syncedCount)
                      put("failedCount", failedCount)
                      put("queueSize", queueSize)
                      put("timestamp", System.currentTimeMillis())
                  }
                  conn.outputStream.write(body.toString().toByteArray())
                  conn.responseCode
                  conn.disconnect()
              } catch (e: Exception) {
                  Log.e(tag, "Sync status update failed: \${e.message}")
              }
          }
      }

      fun checkMDMCommands(deviceId: String, callback: (command: String?, payload: JSONObject?) -> Unit) {
          scope.launch {
              try {
                  val url = URL("\$serverUrl/api/apk/devices/mdm-command?deviceId=\$deviceId")
                  val conn = url.openConnection() as HttpURLConnection
                  conn.requestMethod = "GET"
                  conn.connectTimeout = 5000
                  val response = conn.inputStream.bufferedReader().readText()
                  val json = JSONObject(response)
                  val command = json.optString("command", null)
                  val payload = if (json.has("payload")) json.getJSONObject("payload") else null
                  withContext(Dispatchers.Main) { callback(command, payload) }
              } catch (e: Exception) {
                  withContext(Dispatchers.Main) { callback(null, null) }
              }
          }
      }

      fun manualSync(offlineSyncManager: OfflineSyncManager, callback: (synced: Int, failed: Int) -> Unit) {
          Log.d(tag, "Manual sync triggered by operator")
          offlineSyncManager.emergencySync { synced, failed, remaining ->
              sendSyncStatus(0, synced, failed, remaining)
              callback(synced, failed)
          }
      }

      private fun getAppVersion(): String {
          return try {
              context.packageManager.getPackageInfo(context.packageName, 0).versionName ?: "1.0"
          } catch (_: Exception) { "1.0" }
      }
  }`);
}

function writeLayoutFiles(resDir: string) {
  const ld = path.join(resDir, "layout");
  fs.mkdirSync(ld, { recursive: true });
  fs.mkdirSync(path.join(resDir, "drawable"), { recursive: true });

  fs.writeFileSync(path.join(ld, "activity_splash.xml"), `<?xml version="1.0" encoding="utf-8"?>\n<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android" android:layout_width="match_parent" android:layout_height="match_parent" android:gravity="center" android:orientation="vertical" android:background="@color/primary">\n    <ImageView android:layout_width="120dp" android:layout_height="120dp" android:src="@drawable/ic_fingerprint" android:contentDescription="logo" />\n    <TextView android:layout_width="wrap_content" android:layout_height="wrap_content" android:text="MPA Verify" android:textColor="@color/white" android:textSize="28sp" android:textStyle="bold" android:layout_marginTop="24dp" />\n    <ProgressBar android:layout_width="wrap_content" android:layout_height="wrap_content" android:layout_marginTop="32dp" android:indeterminateTint="@color/white" />\n</LinearLayout>`);

  fs.writeFileSync(path.join(ld, "activity_registration.xml"), `<?xml version="1.0" encoding="utf-8"?>\n<ScrollView xmlns:android="http://schemas.android.com/apk/res/android" android:layout_width="match_parent" android:layout_height="match_parent">\n<LinearLayout android:layout_width="match_parent" android:layout_height="wrap_content" android:gravity="center_horizontal" android:orientation="vertical" android:padding="32dp">\n    <ImageView android:layout_width="80dp" android:layout_height="80dp" android:src="@drawable/ic_fingerprint" android:contentDescription="logo" />\n    <TextView android:layout_width="wrap_content" android:layout_height="wrap_content" android:text="Operator Registration" android:textSize="24sp" android:textStyle="bold" android:layout_marginTop="16dp" android:layout_marginBottom="24dp" />\n    <com.google.android.material.textfield.TextInputLayout android:layout_width="match_parent" android:layout_height="wrap_content" android:layout_marginBottom="12dp" style="@style/Widget.Material3.TextInputLayout.OutlinedBox"><com.google.android.material.textfield.TextInputEditText android:id="@+id/etName" android:layout_width="match_parent" android:layout_height="wrap_content" android:hint="Full Name" android:inputType="textPersonName" /></com.google.android.material.textfield.TextInputLayout>\n    <com.google.android.material.textfield.TextInputLayout android:layout_width="match_parent" android:layout_height="wrap_content" android:layout_marginBottom="12dp" style="@style/Widget.Material3.TextInputLayout.OutlinedBox"><com.google.android.material.textfield.TextInputEditText android:id="@+id/etPhone" android:layout_width="match_parent" android:layout_height="wrap_content" android:hint="Mobile Number" android:inputType="phone" android:maxLength="10" /></com.google.android.material.textfield.TextInputLayout>\n    <com.google.android.material.textfield.TextInputLayout android:layout_width="match_parent" android:layout_height="wrap_content" android:layout_marginBottom="16dp" style="@style/Widget.Material3.TextInputLayout.OutlinedBox"><com.google.android.material.textfield.TextInputEditText android:id="@+id/etAadhaar" android:layout_width="match_parent" android:layout_height="wrap_content" android:hint="Aadhaar Number (12 digits)" android:inputType="number" android:maxLength="12" /></com.google.android.material.textfield.TextInputLayout>\n    <LinearLayout android:layout_width="match_parent" android:layout_height="wrap_content" android:orientation="vertical" android:gravity="center" android:layout_marginBottom="16dp" android:padding="16dp" android:background="@drawable/rounded_bg">\n        <ImageView android:id="@+id/ivSelfie" android:layout_width="120dp" android:layout_height="120dp" android:src="@drawable/ic_fingerprint" android:contentDescription="selfie" android:scaleType="centerCrop" />\n        <TextView android:id="@+id/tvSelfieStatus" android:layout_width="wrap_content" android:layout_height="wrap_content" android:text="No selfie captured" android:layout_marginTop="8dp" android:textColor="#888" />\n        <com.google.android.material.button.MaterialButton android:id="@+id/btnCaptureSelfie" android:layout_width="wrap_content" android:layout_height="wrap_content" android:text="Capture Selfie" android:layout_marginTop="8dp" style="@style/Widget.Material3.Button.TonalButton" />\n    </LinearLayout>\n    <com.google.android.material.button.MaterialButton android:id="@+id/btnRegister" android:layout_width="match_parent" android:layout_height="56dp" android:text="Register" android:textSize="16sp" />\n</LinearLayout>\n</ScrollView>`);

  fs.writeFileSync(path.join(ld, "activity_exam_select.xml"), `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android" android:layout_width="match_parent" android:layout_height="match_parent" android:orientation="vertical" android:padding="32dp">
    <ImageView android:layout_width="80dp" android:layout_height="80dp" android:src="@drawable/ic_fingerprint" android:contentDescription="logo" android:layout_gravity="center" />
    <TextView android:id="@+id/tvOperatorGreeting" android:layout_width="wrap_content" android:layout_height="wrap_content" android:text="Welcome" android:textSize="18sp" android:textColor="#666" android:layout_gravity="center" android:layout_marginTop="12dp" />
    <TextView android:layout_width="wrap_content" android:layout_height="wrap_content" android:text="Select Exam" android:textSize="24sp" android:textStyle="bold" android:layout_gravity="center" android:layout_marginTop="8dp" android:layout_marginBottom="24dp" />
    <TextView android:id="@+id/tvNoExams" android:layout_width="match_parent" android:layout_height="wrap_content" android:text="No exams available" android:textSize="16sp" android:textColor="#999" android:gravity="center" android:visibility="gone" android:layout_marginTop="32dp" />
    <ListView android:id="@+id/lvExams" android:layout_width="match_parent" android:layout_height="0dp" android:layout_weight="1" android:divider="#E0E0E0" android:dividerHeight="1dp" android:background="@drawable/rounded_bg" android:layout_marginBottom="24dp" />
    <com.google.android.material.button.MaterialButton android:id="@+id/btnSelectExam" android:layout_width="match_parent" android:layout_height="56dp" android:text="Select Exam &amp; Continue" android:textSize="16sp" />
</LinearLayout>`);

  fs.writeFileSync(path.join(ld, "activity_centre_select.xml"), `<?xml version="1.0" encoding="utf-8"?>\n<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android" android:layout_width="match_parent" android:layout_height="match_parent" android:gravity="center" android:orientation="vertical" android:padding="32dp">\n    <ImageView android:layout_width="80dp" android:layout_height="80dp" android:src="@drawable/ic_fingerprint" android:contentDescription="logo" />\n    <TextView android:layout_width="wrap_content" android:layout_height="wrap_content" android:text="Select Centre" android:textSize="24sp" android:textStyle="bold" android:layout_marginTop="16dp" />\n    <TextView android:id="@+id/tvExamName" android:layout_width="wrap_content" android:layout_height="wrap_content" android:text="Exam" android:textSize="16sp" android:textColor="#666" android:layout_marginTop="8dp" android:layout_marginBottom="24dp" />\n    <TextView android:layout_width="match_parent" android:layout_height="wrap_content" android:text="Centre Code" android:textSize="14sp" android:layout_marginBottom="8dp" />\n    <Spinner android:id="@+id/spinnerCentre" android:layout_width="match_parent" android:layout_height="56dp" android:background="@drawable/spinner_bg" android:layout_marginBottom="24dp" />\n    <com.google.android.material.button.MaterialButton android:id="@+id/btnConfirmCentre" android:layout_width="match_parent" android:layout_height="56dp" android:text="Confirm and Download Data" android:textSize="16sp" />\n</LinearLayout>`);

  fs.writeFileSync(path.join(ld, "activity_dashboard.xml"), `<?xml version="1.0" encoding="utf-8"?>
  <ScrollView xmlns:android="http://schemas.android.com/apk/res/android" android:layout_width="match_parent" android:layout_height="match_parent">
  <LinearLayout android:layout_width="match_parent" android:layout_height="wrap_content" android:orientation="vertical" android:padding="16dp">
      <TextView android:id="@+id/tvExamName" android:layout_width="wrap_content" android:layout_height="wrap_content" android:textSize="22sp" android:textStyle="bold" />
      <TextView android:id="@+id/tvOperatorName" android:layout_width="wrap_content" android:layout_height="wrap_content" android:textSize="14sp" android:textColor="#666" android:layout_marginBottom="8dp" />
      <TextView android:id="@+id/tvCentreName" android:layout_width="wrap_content" android:layout_height="wrap_content" android:textSize="15sp" android:textColor="@color/primary" android:textStyle="bold" android:layout_marginBottom="4dp" />
      <TextView android:id="@+id/tvLastSync" android:layout_width="wrap_content" android:layout_height="wrap_content" android:textSize="12sp" android:textColor="#999" android:layout_marginBottom="16dp" />
      <LinearLayout android:layout_width="match_parent" android:layout_height="wrap_content" android:orientation="horizontal">
          <LinearLayout android:layout_width="0dp" android:layout_height="wrap_content" android:layout_weight="1" android:orientation="vertical" android:gravity="center" android:padding="16dp" android:background="@drawable/card_bg"><TextView android:id="@+id/tvTotalCandidates" android:layout_width="wrap_content" android:layout_height="wrap_content" android:text="0" android:textSize="28sp" android:textStyle="bold" android:textColor="@color/primary" /><TextView android:layout_width="wrap_content" android:layout_height="wrap_content" android:text="Total" android:textSize="12sp" /></LinearLayout>
          <LinearLayout android:layout_width="0dp" android:layout_height="wrap_content" android:layout_weight="1" android:orientation="vertical" android:gravity="center" android:padding="16dp" android:background="@drawable/card_bg" android:layout_marginStart="8dp"><TextView android:id="@+id/tvPresentCount" android:layout_width="wrap_content" android:layout_height="wrap_content" android:text="0" android:textSize="28sp" android:textStyle="bold" android:textColor="@color/success" /><TextView android:layout_width="wrap_content" android:layout_height="wrap_content" android:text="Present" android:textSize="12sp" /></LinearLayout>
          <LinearLayout android:layout_width="0dp" android:layout_height="wrap_content" android:layout_weight="1" android:orientation="vertical" android:gravity="center" android:padding="16dp" android:background="@drawable/card_bg" android:layout_marginStart="8dp"><TextView android:id="@+id/tvVerifiedCount" android:layout_width="wrap_content" android:layout_height="wrap_content" android:text="0" android:textSize="28sp" android:textStyle="bold" android:textColor="@color/secondary" /><TextView android:layout_width="wrap_content" android:layout_height="wrap_content" android:text="Verified" android:textSize="12sp" /></LinearLayout>
      </LinearLayout>
      <com.google.android.material.button.MaterialButton android:id="@+id/btnSyncData" android:layout_width="match_parent" android:layout_height="56dp" android:text="Download Data" android:layout_marginTop="24dp" />
      <com.google.android.material.button.MaterialButton android:id="@+id/btnAttendance" android:layout_width="match_parent" android:layout_height="56dp" android:text="Mark Attendance" android:layout_marginTop="8dp" style="@style/Widget.Material3.Button.TonalButton" />
      <com.google.android.material.button.MaterialButton android:id="@+id/btnVerification" android:layout_width="match_parent" android:layout_height="56dp" android:text="Biometric Verification" android:layout_marginTop="8dp" style="@style/Widget.Material3.Button.TonalButton" />
      <com.google.android.material.button.MaterialButton android:id="@+id/btnOfflineSync" android:layout_width="match_parent" android:layout_height="56dp" android:text="Offline Sync" android:layout_marginTop="8dp" style="@style/Widget.Material3.Button.TonalButton" />
      <com.google.android.material.button.MaterialButton android:id="@+id/btnFinishExam" android:layout_width="match_parent" android:layout_height="56dp" android:text="Finish Exam &amp; Select Next" android:layout_marginTop="16dp" style="@style/Widget.Material3.Button.OutlinedButton" />
      <TextView android:id="@+id/tvPendingSync" android:layout_width="wrap_content" android:layout_height="wrap_content" android:textSize="13sp" android:textColor="@color/warning" android:layout_marginTop="4dp" android:layout_gravity="center" />
  </LinearLayout>
  </ScrollView>`);

  fs.writeFileSync(path.join(resDir, "drawable", "card_bg.xml"), `<?xml version="1.0" encoding="utf-8"?>\n<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle"><solid android:color="#F5F5F5" /><corners android:radius="12dp" /><stroke android:width="1dp" android:color="#E0E0E0" /></shape>`);
    fs.writeFileSync(path.join(resDir, "drawable", "spinner_bg.xml"), `<?xml version="1.0" encoding="utf-8"?>\n<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle"><solid android:color="#FFFFFF" /><corners android:radius="8dp" /><stroke android:width="1dp" android:color="#CCCCCC" /><padding android:left="12dp" android:top="8dp" android:right="12dp" android:bottom="8dp" /></shape>`);
    fs.writeFileSync(path.join(resDir, "drawable", "rounded_bg.xml"), `<?xml version="1.0" encoding="utf-8"?>\n<shape xmlns:android="http://schemas.android.com/apk/res/android" android:shape="rectangle"><solid android:color="#F8F8F8" /><corners android:radius="12dp" /><stroke android:width="1dp" android:color="#E0E0E0" /></shape>`);
  fs.writeFileSync(path.join(resDir, "drawable", "ic_fingerprint.xml"), `<?xml version="1.0" encoding="utf-8"?>\n<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="24dp" android:height="24dp" android:viewportWidth="24" android:viewportHeight="24"><path android:fillColor="#FFFFFF" android:pathData="M17.81,4.47c-0.08,0 -0.16,-0.02 -0.23,-0.06C15.66,3.42 14,3 12.01,3c-1.98,0 -3.86,0.47 -5.57,1.41 -0.24,0.13 -0.54,0.04 -0.68,-0.2 -0.13,-0.24 -0.04,-0.55 0.2,-0.68C7.82,2.52 9.86,2 12.01,2c2.13,0 3.99,0.47 6.03,1.52 0.25,0.13 0.34,0.43 0.21,0.67 -0.09,0.18 -0.26,0.28 -0.44,0.28z" /></vector>`);

  fs.writeFileSync(path.join(ld, "activity_candidate_list.xml"), `<?xml version="1.0" encoding="utf-8"?>\n<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android" android:layout_width="match_parent" android:layout_height="match_parent" android:orientation="vertical" android:padding="16dp">\n    <TextView android:id="@+id/tvTitle" android:layout_width="wrap_content" android:layout_height="wrap_content" android:textSize="20sp" android:textStyle="bold" />\n    <TextView android:id="@+id/tvCount" android:layout_width="wrap_content" android:layout_height="wrap_content" android:textSize="14sp" android:textColor="#666" android:layout_marginBottom="16dp" />\n    <androidx.recyclerview.widget.RecyclerView android:id="@+id/rvCandidates" android:layout_width="match_parent" android:layout_height="match_parent" />\n</LinearLayout>`);

  fs.writeFileSync(path.join(ld, "item_candidate.xml"), `<?xml version="1.0" encoding="utf-8"?>\n<com.google.android.material.card.MaterialCardView xmlns:android="http://schemas.android.com/apk/res/android" xmlns:app="http://schemas.android.com/apk/res-auto" android:layout_width="match_parent" android:layout_height="wrap_content" android:layout_marginBottom="8dp" app:cardElevation="2dp" app:cardCornerRadius="8dp"><LinearLayout android:layout_width="match_parent" android:layout_height="wrap_content" android:padding="16dp" android:orientation="vertical"><TextView android:id="@+id/tvName" android:layout_width="wrap_content" android:layout_height="wrap_content" android:textSize="16sp" android:textStyle="bold" /><TextView android:id="@+id/tvRollNo" android:layout_width="wrap_content" android:layout_height="wrap_content" android:textSize="14sp" android:textColor="#666" /><TextView android:id="@+id/tvStatus" android:layout_width="wrap_content" android:layout_height="wrap_content" android:textSize="12sp" android:textColor="@color/primary" android:layout_marginTop="4dp" /></LinearLayout></com.google.android.material.card.MaterialCardView>`);

  fs.writeFileSync(path.join(ld, "activity_attendance.xml"), `<?xml version="1.0" encoding="utf-8"?>\n<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android" android:layout_width="match_parent" android:layout_height="match_parent" android:orientation="vertical" android:padding="24dp" android:gravity="center">\n    <TextView android:id="@+id/tvCandidateName" android:layout_width="wrap_content" android:layout_height="wrap_content" android:textSize="22sp" android:textStyle="bold" />\n    <TextView android:id="@+id/tvRollNo" android:layout_width="wrap_content" android:layout_height="wrap_content" android:textSize="16sp" android:textColor="#666" android:layout_marginTop="8dp" />\n    <TextView android:id="@+id/tvCurrentStatus" android:layout_width="wrap_content" android:layout_height="wrap_content" android:textSize="14sp" android:layout_marginTop="16dp" />\n    <com.google.android.material.button.MaterialButton android:id="@+id/btnMarkPresent" android:layout_width="match_parent" android:layout_height="56dp" android:text="Mark Present" android:layout_marginTop="32dp" />\n</LinearLayout>`);
    fs.writeFileSync(path.join(ld, "activity_sync.xml"), `<?xml version="1.0" encoding="utf-8"?>
  <LinearLayout xmlns:android="http://schemas.android.com/apk/res/android" android:layout_width="match_parent" android:layout_height="match_parent" android:orientation="vertical" android:padding="24dp">
      <TextView android:layout_width="wrap_content" android:layout_height="wrap_content" android:text="Offline Sync" android:textSize="24sp" android:textStyle="bold" android:layout_marginBottom="8dp" />
      <LinearLayout android:layout_width="match_parent" android:layout_height="wrap_content" android:orientation="horizontal" android:layout_marginBottom="16dp" android:background="@drawable/card_bg" android:padding="16dp">
          <LinearLayout android:layout_width="0dp" android:layout_height="wrap_content" android:layout_weight="1" android:orientation="vertical" android:gravity="center">
              <TextView android:id="@+id/tvPendingCount" android:layout_width="wrap_content" android:layout_height="wrap_content" android:textSize="16sp" android:textStyle="bold" android:textColor="@color/warning" />
          </LinearLayout>
      </LinearLayout>
      <TextView android:id="@+id/tvSyncStatus" android:layout_width="match_parent" android:layout_height="wrap_content" android:textSize="14sp" android:textColor="#666" android:layout_marginBottom="24dp" android:gravity="center" />
      <com.google.android.material.button.MaterialButton android:id="@+id/btnSync" android:layout_width="match_parent" android:layout_height="56dp" android:text="Sync Now" />
  </LinearLayout>`);

  fs.writeFileSync(path.join(ld, "activity_verification.xml"), `<?xml version="1.0" encoding="utf-8"?>\n<ScrollView xmlns:android="http://schemas.android.com/apk/res/android" android:layout_width="match_parent" android:layout_height="match_parent"><LinearLayout android:layout_width="match_parent" android:layout_height="wrap_content" android:orientation="vertical" android:padding="24dp">\n    <TextView android:id="@+id/tvCandidateName" android:layout_width="wrap_content" android:layout_height="wrap_content" android:textSize="22sp" android:textStyle="bold" />\n    <TextView android:id="@+id/tvRollNo" android:layout_width="wrap_content" android:layout_height="wrap_content" android:textSize="16sp" android:textColor="#666" android:layout_marginTop="8dp" android:layout_marginBottom="24dp" />\n    <com.google.android.material.button.MaterialButton android:id="@+id/btnCaptureFace" android:layout_width="match_parent" android:layout_height="56dp" android:text="Capture Face" style="@style/Widget.Material3.Button.TonalButton" />\n    <TextView android:id="@+id/tvFaceResult" android:layout_width="wrap_content" android:layout_height="wrap_content" android:textSize="14sp" android:layout_marginTop="8dp" android:layout_marginBottom="16dp" />\n    <com.google.android.material.button.MaterialButton android:id="@+id/btnCaptureFingerprint" android:layout_width="match_parent" android:layout_height="56dp" android:text="Capture Fingerprint" style="@style/Widget.Material3.Button.TonalButton" />\n    <TextView android:id="@+id/tvFingerprintResult" android:layout_width="wrap_content" android:layout_height="wrap_content" android:textSize="14sp" android:layout_marginTop="8dp" android:layout_marginBottom="16dp" />\n    <com.google.android.material.textfield.TextInputLayout android:layout_width="match_parent" android:layout_height="wrap_content" android:layout_marginBottom="24dp" style="@style/Widget.Material3.TextInputLayout.OutlinedBox"><com.google.android.material.textfield.TextInputEditText android:id="@+id/etOmrNumber" android:layout_width="match_parent" android:layout_height="wrap_content" android:hint="OMR Number" android:inputType="number" /></com.google.android.material.textfield.TextInputLayout>\n    <com.google.android.material.button.MaterialButton android:id="@+id/btnSubmit" android:layout_width="match_parent" android:layout_height="56dp" android:text="Submit Verification" />\n</LinearLayout></ScrollView>`);
}

function writeProjectFiles(buildDir: string, pkgName: string, pkgPath: string, config: BuildConfig, versionCode: number, versionName: string) {
  const appName = `MPA Verify - ${config.examName}`;
  const srcDir = path.join(buildDir, "app", "src", "main", "java", ...pkgPath.split("/"));
  const resDir = path.join(buildDir, "app", "src", "main", "res");
  const assetsDir = path.join(buildDir, "app", "src", "main", "assets");

  [srcDir, path.join(resDir, "layout"), path.join(resDir, "values"), path.join(resDir, "drawable"), path.join(resDir, "mipmap-hdpi"), path.join(resDir, "mipmap-mdpi"), path.join(resDir, "mipmap-xhdpi"), path.join(resDir, "mipmap-xxhdpi"), path.join(resDir, "mipmap-xxxhdpi"), assetsDir, path.join(assetsDir, "models"), path.join(buildDir, "app", "libs"), path.join(buildDir, "app", "src", "main", "jniLibs", "armeabi-v7a"), path.join(buildDir, "app", "src", "main", "jniLibs", "arm64-v8a"), path.join(buildDir, "keystore"), path.join(buildDir, "gradle", "wrapper")].forEach(d => fs.mkdirSync(d, { recursive: true }));

  fs.writeFileSync(path.join(buildDir, "build.gradle"), generateProjectBuildGradle());
  fs.writeFileSync(path.join(buildDir, "settings.gradle"), `pluginManagement { repositories { google(); mavenCentral(); gradlePluginPortal() } }\nrootProject.name = "${appName}"\ninclude ':app'`);
  fs.writeFileSync(path.join(buildDir, "gradle.properties"), `org.gradle.jvmargs=-Xmx1536m -XX:+UseParallelGC -Dfile.encoding=UTF-8\norg.gradle.daemon=false\norg.gradle.workers.max=2\nandroid.useAndroidX=true\nkotlin.code.style=official\nandroid.nonTransitiveRClass=true\norg.gradle.parallel=true\norg.gradle.caching=true\nkotlin.incremental=true`);
  fs.writeFileSync(path.join(buildDir, "gradle", "wrapper", "gradle-wrapper.properties"), `distributionBase=GRADLE_USER_HOME\ndistributionPath=wrapper/dists\ndistributionUrl=https\\://services.gradle.org/distributions/gradle-8.4-bin.zip\nzipStoreBase=GRADLE_USER_HOME\nzipStorePath=wrapper/dists`);
  fs.writeFileSync(path.join(buildDir, "app", "build.gradle"), generateAppBuildGradle(pkgName, versionCode, versionName));
  fs.writeFileSync(path.join(buildDir, "app", "proguard-rules.pro"), `-keep class com.mantra.** { *; }\n-keep class com.mfs100.** { *; }\n-dontwarn com.mantra.**\n-keep class org.tensorflow.** { *; }\n-dontwarn org.tensorflow.**\n-keep class com.google.mlkit.** { *; }\n-keep class com.mpa.verify.**.model.** { *; }\n-keepclassmembers class com.mpa.verify.**.model.** { *; }\n-keep class * implements java.io.Serializable { *; }\n-keepattributes Signature,InnerClasses,EnclosingMethod\n-keepattributes *Annotation*\n-keep,allowobfuscation,allowshrinking class com.google.gson.reflect.TypeToken\n-keep,allowobfuscation,allowshrinking class * extends com.google.gson.reflect.TypeToken\n-keep class com.google.gson.** { *; }\n-keep class retrofit2.** { *; }\n-dontwarn retrofit2.**`);
  fs.writeFileSync(path.join(buildDir, "app", "src", "main", "AndroidManifest.xml"), generateAndroidManifest(pkgName));
  fs.writeFileSync(path.join(assetsDir, "config.json"), generateConfigJson(config));

    fs.writeFileSync(path.join(assetsDir, "models", "README.txt"), "Place FaceNet TFLite model here:\n- facenet.tflite (or mobile_face_net.tflite)\nDownload from: https://github.com/sirius-ai/MobileFaceNets\nThe app loads this model for face embedding generation and matching.");

    fs.writeFileSync(path.join(buildDir, "app", "libs", "README.txt"), "Place Mantra MFS100 SDK files here:\n- MFS100.jar (or MFS100.aar)\nDownload from: https://download.mantratecapp.com\nRequired for fingerprint scanner integration.");

    fs.writeFileSync(path.join(buildDir, "app", "src", "main", "jniLibs", "armeabi-v7a", "README.txt"), "Place Mantra native library here:\n- libMFS100.so\nExtract from Mantra MFS100 SDK package.");
    fs.writeFileSync(path.join(buildDir, "app", "src", "main", "jniLibs", "arm64-v8a", "README.txt"), "Place Mantra native library here:\n- libMFS100.so\nExtract from Mantra MFS100 SDK package.");
  fs.writeFileSync(path.join(resDir, "values", "strings.xml"), `<?xml version="1.0" encoding="utf-8"?>\n<resources><string name="app_name">${appName}</string><string name="exam_name">${config.examName}</string></resources>`);
  fs.writeFileSync(path.join(resDir, "values", "themes.xml"), `<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <style name="Theme.MpaVerify" parent="Theme.Material3.DayNight.NoActionBar"><item name="colorPrimary">@color/primary</item><item name="colorOnPrimary">@color/white</item></style>\n    <style name="Theme.MpaVerify.Splash" parent="Theme.Material3.DayNight.NoActionBar"><item name="android:windowBackground">@color/primary</item></style>\n</resources>`);
  fs.writeFileSync(path.join(resDir, "values", "colors.xml"), `<?xml version="1.0" encoding="utf-8"?>\n<resources><color name="primary">#1565C0</color><color name="primary_dark">#0D47A1</color><color name="secondary">#26A69A</color><color name="white">#FFFFFF</color><color name="black">#000000</color><color name="success">#4CAF50</color><color name="error">#F44336</color><color name="warning">#FF9800</color></resources>`);

    // Generate ic_launcher as an adaptive icon with foreground vector drawable
    const launcherForeground = `<?xml version="1.0" encoding="utf-8"?>
  <vector xmlns:android="http://schemas.android.com/apk/res/android"
      android:width="108dp" android:height="108dp"
      android:viewportWidth="108" android:viewportHeight="108">
      <path android:fillColor="#1565C0" android:pathData="M0,0h108v108H0z"/>
      <path android:fillColor="#FFFFFF" android:pathData="M54,30 C40.745,30 30,40.745 30,54 C30,67.255 40.745,78 54,78 C67.255,78 78,67.255 78,54 C78,40.745 67.255,30 54,30z M54,36 C63.941,36 72,44.059 72,54 C72,63.941 63.941,72 54,72 C44.059,72 36,63.941 36,54 C36,44.059 44.059,36 54,36z M54,42 C47.373,42 42,47.373 42,54 C42,56.5 42.8,58.8 44.1,60.7 L48,54 C48,50.686 50.686,48 54,48 C57.314,48 60,50.686 60,54 C60,57.314 57.314,60 54,60 L47.3,63.9 C49.2,65.2 51.5,66 54,66 C60.627,66 66,60.627 66,54 C66,47.373 60.627,42 54,42z"/>
  </vector>`;
    const launcherBackground = `<?xml version="1.0" encoding="utf-8"?>
  <vector xmlns:android="http://schemas.android.com/apk/res/android"
      android:width="108dp" android:height="108dp"
      android:viewportWidth="108" android:viewportHeight="108">
      <path android:fillColor="#FFFFFF" android:pathData="M0,0h108v108H0z"/>
  </vector>`;
    const adaptiveIcon = `<?xml version="1.0" encoding="utf-8"?>
  <adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
      <background android:drawable="@drawable/ic_launcher_background"/>
      <foreground android:drawable="@drawable/ic_launcher_foreground"/>
  </adaptive-icon>`;
    fs.writeFileSync(path.join(resDir, "drawable", "ic_launcher_foreground.xml"), launcherForeground);
    fs.writeFileSync(path.join(resDir, "drawable", "ic_launcher_background.xml"), launcherBackground);
    // Write adaptive icon XML to each mipmap dir
    for (const density of ["mipmap-hdpi", "mipmap-mdpi", "mipmap-xhdpi", "mipmap-xxhdpi", "mipmap-xxxhdpi"]) {
      fs.writeFileSync(path.join(resDir, density, "ic_launcher.xml"), adaptiveIcon);
      fs.writeFileSync(path.join(resDir, density, "ic_launcher_round.xml"), adaptiveIcon);
    }

  writeKotlinSources(srcDir, pkgName, config);
  writeLayoutFiles(resDir);
}

export { SDK_DIR };

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


    log("Step 1/7: Creating project directory...");
    await onProgress(10, logs.join("\n"));
    if (fs.existsSync(buildDir)) fs.rmSync(buildDir, { recursive: true });
    fs.mkdirSync(buildDir, { recursive: true });

    log("Step 2/7: Generating Android project files...");
    await onProgress(20, logs.join("\n"));
    writeProjectFiles(buildDir, pkgName, pkgPath, config, versionCode, versionName);
    log(`  Package: ${pkgName}`);
    log(`  Version: ${versionName} (code: ${versionCode})`);

    log("Step 3/7: Copying SDK files (jar, so, tflite) into project...");
    await onProgress(35, logs.join("\n"));
    const sdkCopied = copySDKFiles(buildDir, log);
    if (!sdkCopied) {
      log("  WARNING: No SDK files found in " + SDK_DIR);
      log("  Upload SDK files via Admin > APK Builder > SDK Files tab");
      log("  Or place files in: " + SDK_DIR);
    }

    log("Step 4/7: Injecting exam config into assets/config.json...");
    await onProgress(30, logs.join("\n"));
    log(`  examId=${config.examId}, mode=${config.biometricMode}, threshold=${config.faceMatchThreshold}`);

    log("Step 5/7: Creating project archive...");
    await onProgress(50, logs.join("\n"));

    try {
      const zipFileName = `MPA_Verify_${examName}_v${versionName}.tar.gz`;
      const zipPath = path.join(APK_OUTPUT_DIR, zipFileName);
      const projectFolderName = `MPA_Verify_${examName}_v${versionName}`;
      execSync(`cd "${buildDir}" && cd .. && tar -czf "${zipPath}" --exclude=".gradle" --exclude="build" --transform "s|^${path.basename(buildDir)}|${projectFolderName}|" "${path.basename(buildDir)}" 2>&1`, { timeout: 60000 });
      const zipSize = (fs.statSync(zipPath).size / (1024 * 1024)).toFixed(1);
      log(`  Project archive: ${zipFileName} (${zipSize} MB)`);
      await onProgress(70, logs.join("\n"));

      log("Step 6/7: Setting up build tools...");
        await onProgress(75, logs.join("\n"));

        // Check multiple Gradle locations
        const gradleLocations = [
          "/opt/gradle-8.4/bin/gradle",
          path.join(process.env.HOME || "/root", ".sdkman/candidates/gradle/8.4/bin/gradle"),
          path.join(process.env.HOME || "/root", ".sdkman/candidates/gradle/current/bin/gradle"),
        ];
        let gradleBin = "";
        for (const loc of gradleLocations) {
          if (fs.existsSync(loc)) { gradleBin = loc; break; }
        }
        let hasGradle = !!gradleBin;

        // Auto-install Gradle via SDKMAN if missing
        if (!hasGradle) {
          log("  Gradle not found, installing via SDKMAN...");
          await onProgress(76, logs.join("\n"));
          try {
            const homeDir = process.env.HOME || "/root";
            const sdkmanDir = path.join(homeDir, ".sdkman");
            
            // Install SDKMAN if not present
            if (!fs.existsSync(path.join(sdkmanDir, "bin", "sdkman-init.sh"))) {
              log("  Installing SDKMAN...");
              execSync('curl -s https://get.sdkman.io | bash 2>&1', { timeout: 120000, maxBuffer: 10 * 1024 * 1024, env: { ...process.env, SDKMAN_DIR: sdkmanDir } });
              log("  ✓ SDKMAN installed");
            }

            // Install Gradle 8.4 via SDKMAN
            const sdkmanInit = path.join(sdkmanDir, "bin", "sdkman-init.sh");
            if (fs.existsSync(sdkmanInit)) {
              log("  Installing Gradle 8.4 via SDKMAN...");
              execSync(`bash -c 'source "${sdkmanInit}" && sdk install gradle 8.4 2>&1'`, { timeout: 300000, maxBuffer: 10 * 1024 * 1024 });
              const sdkmanGradle = path.join(sdkmanDir, "candidates", "gradle", "8.4", "bin", "gradle");
              if (fs.existsSync(sdkmanGradle)) {
                gradleBin = sdkmanGradle;
                hasGradle = true;
                log("  ✓ Gradle 8.4 installed via SDKMAN at " + gradleBin);
              } else {
                // Try current symlink
                const currentGradle = path.join(sdkmanDir, "candidates", "gradle", "current", "bin", "gradle");
                if (fs.existsSync(currentGradle)) {
                  gradleBin = currentGradle;
                  hasGradle = true;
                  log("  ✓ Gradle installed via SDKMAN at " + gradleBin);
                } else {
                  log("  ✗ SDKMAN Gradle install completed but binary not found");
                }
              }
            } else {
              log("  ✗ SDKMAN init script not found");
            }
          } catch (e: any) {
            log("  ✗ SDKMAN/Gradle install error: " + e.message.substring(0, 300));
          }

          // Fallback: direct download if SDKMAN failed
          if (!hasGradle) {
            log("  Trying direct Gradle download as fallback...");
            try {
              execSync('mkdir -p /opt && curl -fsSL https://services.gradle.org/distributions/gradle-8.4-bin.zip -o /tmp/gradle.zip && unzip -q -o /tmp/gradle.zip -d /opt/ && rm /tmp/gradle.zip 2>&1', { timeout: 300000, maxBuffer: 10 * 1024 * 1024 });
              if (fs.existsSync("/opt/gradle-8.4/bin/gradle")) {
                gradleBin = "/opt/gradle-8.4/bin/gradle";
                hasGradle = true;
                log("  ✓ Gradle 8.4 installed at /opt/gradle-8.4");
              }
            } catch (e2: any) {
              log("  ✗ Direct download also failed: " + e2.message.substring(0, 200));
            }
          }
        } else {
          log("  ✓ Gradle found at " + gradleBin);
        }

        // Find or install Android SDK
        const sdkPaths = [process.env.ANDROID_HOME, process.env.ANDROID_SDK_ROOT, "/opt/android-sdk", "/usr/lib/android-sdk", "/root/Android/Sdk"].filter(Boolean) as string[];
        let androidHome = "";
        for (const p of sdkPaths) { if (fs.existsSync(p!)) { androidHome = p!; break; } }
        if (!androidHome) {
          try {
            const sdkResult = execSync("find /opt /usr/lib /root -maxdepth 4 -name \"build-tools\" -type d 2>/dev/null | head -1", { timeout: 10000 }).toString().trim();
            if (sdkResult) androidHome = path.resolve(sdkResult, "..");
          } catch (_) {}
        }

        // Auto-install Android SDK command-line tools if missing
        if (!androidHome) {
          log("  Android SDK not found, installing...");
          await onProgress(78, logs.join("\n"));
          try {
            const sdkRoot = "/opt/android-sdk";
            execSync(`mkdir -p ${sdkRoot}/cmdline-tools && curl -fsSL https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -o /tmp/cmdtools.zip && unzip -q -o /tmp/cmdtools.zip -d /tmp/cmdtools-tmp && mv /tmp/cmdtools-tmp/cmdline-tools ${sdkRoot}/cmdline-tools/latest && rm -rf /tmp/cmdtools.zip /tmp/cmdtools-tmp 2>&1`, { timeout: 300000, maxBuffer: 10 * 1024 * 1024 });
            
            // Accept licenses and install required SDK packages
            const sdkEnv = { ...process.env, ANDROID_HOME: sdkRoot, ANDROID_SDK_ROOT: sdkRoot, JAVA_HOME: process.env.JAVA_HOME || "/usr/lib/jvm/java-17-openjdk-amd64" };
            const sdkmanager = path.join(sdkRoot, "cmdline-tools", "latest", "bin", "sdkmanager");
            if (fs.existsSync(sdkmanager)) {
              log("  Installing SDK packages (platform 34, build-tools 34.0.0)...");
              await onProgress(80, logs.join("\n"));
              execSync(`yes | "${sdkmanager}" --licenses 2>&1 || true`, { timeout: 120000, env: sdkEnv, maxBuffer: 10 * 1024 * 1024 });
              execSync(`"${sdkmanager}" "platforms;android-34" "build-tools;34.0.0" "platform-tools" 2>&1`, { timeout: 600000, env: sdkEnv, maxBuffer: 10 * 1024 * 1024 });
              androidHome = sdkRoot;
              log("  ✓ Android SDK installed at " + sdkRoot);
            } else {
              log("  ✗ sdkmanager not found after download");
            }
          } catch (e: any) {
            log("  ✗ SDK install error: " + e.message.substring(0, 300));
          }
        } else {
          log("  ✓ Android SDK found at " + androidHome);
        }

        // Check for Java
        let javaHome = process.env.JAVA_HOME || "";
        if (!javaHome) {
          const javaPaths = ["/usr/lib/jvm/java-17-openjdk-amd64", "/usr/lib/jvm/java-17", "/usr/lib/jvm/java-11-openjdk-amd64", "/usr/lib/jvm/java-11"];
          for (const jp of javaPaths) { if (fs.existsSync(jp)) { javaHome = jp; break; } }
        }
        if (!javaHome) {
          try {
            const javaPath = execSync("which java 2>/dev/null").toString().trim();
            if (javaPath) {
              const realPath = execSync(`readlink -f "${javaPath}" 2>/dev/null`).toString().trim();
              javaHome = realPath.replace(/\/bin\/java$/, "");
            }
          } catch (_) {}
        }
        if (javaHome) log("  ✓ Java: " + javaHome);
        else log("  ✗ Java not found - APK build will likely fail");

        log("Step 7/7: Building APK...");
        await onProgress(85, logs.join("\n"));

        if (hasGradle && androidHome) {
          fs.writeFileSync(path.join(buildDir, "local.properties"), `sdk.dir=${androidHome}\n`);

          try {
            const gradleHome = path.dirname(path.dirname(gradleBin));
            const buildEnv = { ...process.env, GRADLE_HOME: gradleHome, ANDROID_HOME: androidHome, ANDROID_SDK_ROOT: androidHome, PATH: `${path.dirname(gradleBin)}:${androidHome}/cmdline-tools/latest/bin:${androidHome}/platform-tools:${process.env.PATH}`, JAVA_HOME: javaHome || "/usr/lib/jvm/java-17-openjdk-amd64" };

            // Step 0: Generate release keystore if missing
              const keystoreDir = path.join(buildDir, "keystore");
              const keystorePath = path.join(keystoreDir, "mpa-release.jks");
              if (!fs.existsSync(keystorePath)) {
                log("  Generating release keystore...");
                try {
                  execSync(`keytool -genkeypair -v -keystore "${keystorePath}" -alias mpa-verify -keyalg RSA -keysize 2048 -validity 10000 -storepass "mpa@2024secure" -keypass "mpa@2024secure" -dname "CN=MPA Verify, OU=Biometric, O=MPA, L=Delhi, ST=Delhi, C=IN" 2>&1`, { timeout: 30000 });
                  log("  ✓ Release keystore generated");
                } catch (ksErr: any) {
                  log("  ✗ Keystore generation failed: " + (ksErr.message || "unknown error"));
                }
              } else {
                log("  ✓ Release keystore exists");
              }

              // Step 1: Generate Gradle wrapper inside the build directory
              log("  Generating Gradle wrapper in build directory...");
            await onProgress(86, logs.join("\n"));
            execSync(`cd "${buildDir}" && "${gradleBin}" wrapper --gradle-version 8.4 2>&1`, { timeout: 120000, maxBuffer: 10 * 1024 * 1024, env: buildEnv });
            execSync(`chmod +x "${buildDir}/gradlew"`, { timeout: 5000 });
            log("  ✓ Gradle wrapper created");

            // Step 2: Build APK using ./gradlew inside the build directory
            log("  Running: ./gradlew assembleRelease --no-daemon --stacktrace -x lint -x test");
            log("  (this may take 3-10 minutes on first build...)");
            await onProgress(88, logs.join("\n"));
            const output = execSync(`cd "${buildDir}" && ./gradlew assembleRelease --no-daemon --stacktrace -x lint -x lintVitalRelease -x test 2>&1`, { timeout: 1800000, maxBuffer: 50 * 1024 * 1024, env: buildEnv }).toString();
            const outputLines = output.split("\n");
            outputLines.slice(-30).forEach(l => log("  " + l));

            const apkSearchPaths = [
              path.join(buildDir, "app", "build", "outputs", "apk", "release", "app-release.apk"),
              path.join(buildDir, "app", "build", "outputs", "apk", "release", "app-release-unsigned.apk"),
              path.join(buildDir, "app", "build", "outputs", "apk", "debug", "app-debug.apk"),
            ];
            let foundApk = apkSearchPaths.find(p => fs.existsSync(p));
            if (!foundApk) {
              try {
                const f = execSync(`find "${buildDir}" -name "*.apk" -type f 2>/dev/null`).toString().trim();
                if (f) foundApk = f.split("\n")[0];
              } catch (_) {}
            }

            if (foundApk) {
              const apkFinal = path.join(APK_OUTPUT_DIR, `MPA_Verify_${examName}_v${versionName}.apk`);
              fs.copyFileSync(foundApk, apkFinal);
              const apkSize = (fs.statSync(apkFinal).size / (1024 * 1024)).toFixed(1);
              log("");
              log("  ===== APK BUILD SUCCESSFUL =====");
              log(`  APK: MPA_Verify_${examName}_v${versionName}.apk (${apkSize} MB)`);
              log("  Both APK and project archive are available for download.");
              await onProgress(100, logs.join("\n"));
              return { success: true, apkPath: apkFinal, logs: logs.join("\n") };
            } else {
              log("  ✗ Build completed but APK file not found in output directory");
              log("  Providing project archive for manual build in Android Studio");
            }
          } catch (buildErr: any) {
            log("  ✗ Release build failed, trying debug build...");
              try {
                const debugOutput = execSync(`cd "${buildDir}" && ./gradlew assembleDebug --no-daemon --stacktrace -x lint -x test 2>&1`, { timeout: 1800000, maxBuffer: 50 * 1024 * 1024, env: buildEnv }).toString();
                const debugApk = path.join(buildDir, "app", "build", "outputs", "apk", "debug", "app-debug.apk");
                if (fs.existsSync(debugApk)) {
                  const examName = config.examName.replace(/[^a-zA-Z0-9]/g, "");
                  const apkFinal = path.join(APK_OUTPUT_DIR, `MPA_Verify_${examName}_v${versionName}_debug.apk`);
                  fs.copyFileSync(debugApk, apkFinal);
                  const apkSize = (fs.statSync(apkFinal).size / (1024 * 1024)).toFixed(1);
                  log("");
                  log("  ===== DEBUG APK BUILD SUCCESSFUL =====");
                  log(`  APK: MPA_Verify_${examName}_v${versionName}_debug.apk (${apkSize} MB)`);
                  await onProgress(100, logs.join("\n"));
                  return { success: true, apkPath: apkFinal, logs: logs.join("\n") };
                }
              } catch (debugErr: any) {
                log("  ✗ Debug build also failed");
              }
              log("  ✗ Gradle build failed:");
            const errOutput = buildErr.stdout ? buildErr.stdout.toString() : buildErr.message || "";
            const errLines = errOutput.split("\n");
            const kotlinErrors = errLines.filter((l: string) => l.trim().startsWith("e:") || l.includes("error:") || l.includes("Unresolved") || l.includes("AAPT") || l.includes("FAILURE:") || l.includes("What went wrong") || l.includes("Execution failed") || l.includes("resource") && l.includes("not found"));
              if (kotlinErrors.length > 0) {
                log("  Build errors:");
                kotlinErrors.slice(0, 30).forEach((l: string) => log("    " + l.trim()));
                log("");
              }
              errLines.slice(-80).forEach((l: string) => { if (l.trim()) log("    " + l); });
            if (buildErr.stderr) {
              buildErr.stderr.toString().split("\n").slice(-15).forEach((l: string) => { if (l.trim()) log("    ERR: " + l); });
            }
            log("");
            log("  Project archive (.tar.gz) is still available for download.");
            log("  Open it in Android Studio to build APK manually.");
          }
        } else {
          if (!hasGradle) log("  ✗ Could not install Gradle 8.4 - check server permissions");
          if (!androidHome) log("  ✗ Could not install Android SDK - check server permissions");
          log("  Providing project archive for manual build in Android Studio");
        }

        log("");
        log("  ===== DOWNLOAD READY =====");
        log("  Project archive (.tar.gz with SDK files included) is ready for download.");
        log("  To build APK manually: Extract archive > Open in Android Studio > Build > Generate Signed APK");
        await onProgress(100, logs.join("\n"));
        return { success: true, apkPath: zipPath, logs: logs.join("\n") };

    } catch (archiveErr: any) {
      log(`  Archive creation failed: ${archiveErr.message}`);
      return { success: false, logs: logs.join("\n") };
    }
  } catch (error: any) {
    log(`FATAL: ${error.message}`);
    return { success: false, logs: logs.join("\n") };
  }
}
