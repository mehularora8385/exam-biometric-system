import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, real, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("admin"),
  displayName: text("display_name"),
});

export const exams = pgTable("exams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  client: text("client").notNull(),
  status: text("status").notNull().default("Draft"),
  candidatesCount: integer("candidates_count").notNull().default(0),
  verifiedCount: integer("verified_count").notNull().default(0),
  apkPassword: text("apk_password"),
  clientLoginId: text("client_login_id"),
  clientLoginPass: text("client_login_pass"),
  biometricMode: text("biometric_mode").default("face"),
  flowType: text("flow_type").default("linear"),
  attendanceMode: text("attendance_mode").default("biometric"),
  omrMode: text("omr_mode").default("auto"),
  faceLiveness: boolean("face_liveness").default(true),
  irisEnabled: boolean("iris_enabled").default(false),
  retryLimit: integer("retry_limit").default(3),
  clientLogo: text("client_logo"),
  examType: text("exam_type").default("real"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const centers = pgTable("centers", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  examId: integer("exam_id"),
  examName: text("exam_name"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  address: text("address"),
  capacity: integer("capacity").default(0),
});

export const operators = pgTable("operators", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  aadhaar: text("aadhaar"),
  selfieUrl: text("selfie_url"),
  centerId: integer("center_id"),
  centerName: text("center_name"),
  centreCode: text("centre_code"),
  examId: integer("exam_id"),
  examName: text("exam_name"),
  deviceId: text("device_id"),
  device: text("device").default("Not bound"),
  lastActive: text("last_active").default("Never"),
  status: text("status").notNull().default("Active"),
  forceLogout: boolean("force_logout").default(false),
  sessionActive: boolean("session_active").default(true),
  registeredAt: text("registered_at"),
});

export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),
  omrNo: text("omr_no"),
  rollNo: text("roll_no").notNull(),
  name: text("name").notNull(),
  fatherName: text("father_name"),
  dob: text("dob"),
  centreCode: text("centre_code"),
  centreName: text("centre_name"),
  slot: text("slot"),
  matchPercent: text("match_percent"),
  status: text("status").notNull().default("Pending"),
  verifiedAt: text("verified_at"),
  photoUrl: text("photo_url"),
  examId: integer("exam_id"),
  fingerprintVerified: boolean("fingerprint_verified").default(false),
  presentMark: text("present_mark").default("Absent"),
  capturedPhotoUrl: text("captured_photo_url"),
});

export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("Active"),
});

export const designations = pgTable("designations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  departmentId: integer("department_id"),
  status: text("status").notNull().default("Active"),
});

export const slots = pgTable("slots", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  examId: integer("exam_id"),
  date: text("date").notNull(),
  startTime: text("start_time"),
  endTime: text("end_time"),
  status: text("status").notNull().default("Active"),
});

export const centerOperatorMaps = pgTable("center_operator_maps", {
  id: serial("id").primaryKey(),
  centerId: integer("center_id").notNull(),
  centerName: text("center_name"),
  operatorId: integer("operator_id").notNull(),
  operatorName: text("operator_name"),
  examId: integer("exam_id"),
});

export const devices = pgTable("devices", {
  id: serial("id").primaryKey(),
  macAddress: text("mac_address"),
  imei: text("imei"),
  operatorId: integer("operator_id"),
  operatorName: text("operator_name"),
  centerName: text("center_name"),
  centreCode: text("centre_code"),
  examId: integer("exam_id"),
  examName: text("exam_name"),
  model: text("model"),
  androidVersion: text("android_version"),
  batteryLevel: integer("battery_level"),
  lastSyncAt: text("last_sync_at"),
  mdmStatus: text("mdm_status").default("Active"),
  loginStatus: text("login_status").default("Logged In"),
  status: text("status").notNull().default("Active"),
});

export const apkBuilds = pgTable("apk_builds", {
  id: serial("id").primaryKey(),
  version: text("version").notNull(),
  description: text("description"),
  examId: integer("exam_id"),
  examName: text("exam_name"),
  date: text("date").notNull(),
  status: text("status").notNull().default("Ready"),
  features: jsonb("features"),
  platform: text("platform").notNull().default("Android"),
  deviceTypes: text("device_types").notNull().default("Tablet,Mobile"),
  minAndroidVersion: text("min_android_version").notNull().default("8.0"),
  buildSize: text("build_size"),
  buildProgress: integer("build_progress").default(0),
  configJson: jsonb("config_json"),
  downloadUrl: text("download_url"),
  apkPath: text("apk_path"),
  linkedExamIds: text("linked_exam_ids"),
  buildLogs: text("build_logs"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  timestamp: text("timestamp").notNull(),
  action: text("action").notNull(),
  operatorId: text("operator_id"),
  operatorName: text("operator_name"),
  centreCode: text("centre_code"),
  candidateId: text("candidate_id"),
  deviceId: text("device_id"),
  mode: text("mode"),
  details: text("details"),
});

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  severity: text("severity").notNull().default("Medium"),
  candidateId: text("candidate_id"),
  operatorId: text("operator_id"),
  centreCode: text("centre_code"),
  description: text("description").notNull(),
  confidence: real("confidence"),
  timestamp: text("timestamp").notNull(),
  status: text("status").notNull().default("Open"),
});

export const globalTechSettings = pgTable("global_tech_settings", {
  id: serial("id").primaryKey(),
  examId: integer("exam_id"),
  kinesicsEnabled: boolean("kinesics_enabled").default(false),
  rfidEnabled: boolean("rfid_enabled").default(false),
  voiceBiometricsEnabled: boolean("voice_biometrics_enabled").default(false),
  settings: jsonb("settings"),
});


  export const deviceWhitelist = pgTable("device_whitelist", {
    id: serial("id").primaryKey(),
    deviceId: text("device_id").notNull(),
    deviceModel: text("device_model"),
    manufacturer: text("manufacturer"),
    examId: integer("exam_id"),
    centreCode: text("centre_code"),
    addedBy: text("added_by"),
    status: text("status").notNull().default("Active"),
    addedAt: text("added_at"),
  });

  export const deviceSyncLogs = pgTable("device_sync_logs", {
    id: serial("id").primaryKey(),
    deviceId: text("device_id").notNull(),
    examId: integer("exam_id"),
    centreCode: text("centre_code"),
    syncType: text("sync_type").default("auto"),
    recordsSynced: integer("records_synced").default(0),
    recordsFailed: integer("records_failed").default(0),
    syncStatus: text("sync_status").default("completed"),
    syncedAt: text("synced_at"),
  });

  export const crashLogs = pgTable("crash_logs", {
    id: serial("id").primaryKey(),
    deviceId: text("device_id").notNull(),
    deviceModel: text("device_model"),
    appVersion: text("app_version"),
    examId: integer("exam_id"),
    errorMessage: text("error_message"),
    stackTrace: text("stack_trace"),
    crashedAt: text("crashed_at"),
  });

  export const centreLoginLocks = pgTable("centre_login_locks", {
    id: serial("id").primaryKey(),
    examId: integer("exam_id").notNull(),
    centreCode: text("centre_code").notNull(),
    windowStart: text("window_start"),
    windowEnd: text("window_end"),
    isLocked: boolean("is_locked").default(false),
    maxDevices: integer("max_devices").default(10),
    activeDevices: integer("active_devices").default(0),
  });

  export const appVersions = pgTable("app_versions", {
    id: serial("id").primaryKey(),
    versionCode: integer("version_code").notNull(),
    versionName: text("version_name").notNull(),
    minVersionCode: integer("min_version_code").notNull(),
    downloadUrl: text("download_url"),
    releaseNotes: text("release_notes"),
    forceUpdate: boolean("force_update").default(false),
    publishedAt: text("published_at"),
  });

export const biometricPlugins = pgTable("biometric_plugins", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  category: text("category").notNull(),
  manufacturer: text("manufacturer"),
  model: text("model"),
  sdkPackage: text("sdk_package"),
  sdkVersion: text("sdk_version"),
  connectionType: text("connection_type").default("USB"),
  captureType: text("capture_type").notNull(),
  templateFormat: text("template_format"),
  minAndroidVersion: text("min_android_version").default("8.0"),
  configJson: jsonb("config_json"),
  status: text("status").notNull().default("Active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const examBiometricConfig = pgTable("exam_biometric_config", {
  id: serial("id").primaryKey(),
  examId: integer("exam_id").notNull(),
  pluginId: integer("plugin_id").notNull(),
  stepOrder: integer("step_order").notNull().default(1),
  required: boolean("required").default(true),
  threshold: integer("threshold").default(70),
  retryLimit: integer("retry_limit").default(3),
  captureTimeout: integer("capture_timeout").default(30),
  qualityCheck: boolean("quality_check").default(true),
  templateField: text("template_field"),
  status: text("status").notNull().default("Active"),
});

export const candidateBiometrics = pgTable("candidate_biometrics", {
  id: serial("id").primaryKey(),
  candidateId: integer("candidate_id").notNull(),
  examId: integer("exam_id"),
  pluginCode: text("plugin_code").notNull(),
  templateData: text("template_data"),
  capturedData: text("captured_data"),
  matchPercent: real("match_percent"),
  verified: boolean("verified").default(false),
  capturedAt: text("captured_at"),
  deviceId: text("device_id"),
  operatorId: integer("operator_id"),
  metadata: jsonb("metadata"),
});

  export const insertDeviceWhitelistSchema = createInsertSchema(deviceWhitelist).omit({ id: true });
  export const insertDeviceSyncLogSchema = createInsertSchema(deviceSyncLogs).omit({ id: true });
  export const insertCrashLogSchema = createInsertSchema(crashLogs).omit({ id: true });
  export const insertCentreLoginLockSchema = createInsertSchema(centreLoginLocks).omit({ id: true });
  export const insertAppVersionSchema = createInsertSchema(appVersions).omit({ id: true });

  export const insertBiometricPluginSchema = createInsertSchema(biometricPlugins).omit({ id: true, createdAt: true });
  export const insertExamBiometricConfigSchema = createInsertSchema(examBiometricConfig).omit({ id: true });
  export const insertCandidateBiometricSchema = createInsertSchema(candidateBiometrics).omit({ id: true });

  export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertExamSchema = createInsertSchema(exams).omit({ id: true, createdAt: true });
export const insertCenterSchema = createInsertSchema(centers).omit({ id: true });
export const insertOperatorSchema = createInsertSchema(operators).omit({ id: true });
export const insertCandidateSchema = createInsertSchema(candidates).omit({ id: true });
export const insertDepartmentSchema = createInsertSchema(departments).omit({ id: true });
export const insertDesignationSchema = createInsertSchema(designations).omit({ id: true });
export const insertSlotSchema = createInsertSchema(slots).omit({ id: true });
export const insertCenterOperatorMapSchema = createInsertSchema(centerOperatorMaps).omit({ id: true });
export const insertDeviceSchema = createInsertSchema(devices).omit({ id: true });
export const insertApkBuildSchema = createInsertSchema(apkBuilds).omit({ id: true, createdAt: true });
export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true });
export const insertAlertSchema = createInsertSchema(alerts).omit({ id: true });
export const insertGlobalTechSettingsSchema = createInsertSchema(globalTechSettings).omit({ id: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertExam = z.infer<typeof insertExamSchema>;
export type Exam = typeof exams.$inferSelect;
export type InsertCenter = z.infer<typeof insertCenterSchema>;
export type Center = typeof centers.$inferSelect;
export type InsertOperator = z.infer<typeof insertOperatorSchema>;
export type Operator = typeof operators.$inferSelect;
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;
export type Candidate = typeof candidates.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type Department = typeof departments.$inferSelect;
export type InsertDesignation = z.infer<typeof insertDesignationSchema>;
export type Designation = typeof designations.$inferSelect;
export type InsertSlot = z.infer<typeof insertSlotSchema>;
export type Slot = typeof slots.$inferSelect;
export type InsertCenterOperatorMap = z.infer<typeof insertCenterOperatorMapSchema>;
export type CenterOperatorMap = typeof centerOperatorMaps.$inferSelect;
export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type Device = typeof devices.$inferSelect;
export type InsertApkBuild = z.infer<typeof insertApkBuildSchema>;
export type ApkBuild = typeof apkBuilds.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alerts.$inferSelect;
export type InsertGlobalTechSettings = z.infer<typeof insertGlobalTechSettingsSchema>;
export type GlobalTechSettings = typeof globalTechSettings.$inferSelect;
  export type InsertDeviceWhitelist = z.infer<typeof insertDeviceWhitelistSchema>;
  export type DeviceWhitelist = typeof deviceWhitelist.$inferSelect;
  export type InsertDeviceSyncLog = z.infer<typeof insertDeviceSyncLogSchema>;
  export type DeviceSyncLog = typeof deviceSyncLogs.$inferSelect;
  export type InsertCrashLog = z.infer<typeof insertCrashLogSchema>;
  export type CrashLog = typeof crashLogs.$inferSelect;
  export type InsertCentreLoginLock = z.infer<typeof insertCentreLoginLockSchema>;
  export type CentreLoginLock = typeof centreLoginLocks.$inferSelect;
  export type InsertAppVersion = z.infer<typeof insertAppVersionSchema>;
  export type AppVersion = typeof appVersions.$inferSelect;
  export type InsertBiometricPlugin = z.infer<typeof insertBiometricPluginSchema>;
  export type BiometricPlugin = typeof biometricPlugins.$inferSelect;
  export type InsertExamBiometricConfig = z.infer<typeof insertExamBiometricConfigSchema>;
  export type ExamBiometricConfig = typeof examBiometricConfig.$inferSelect;
  export type InsertCandidateBiometric = z.infer<typeof insertCandidateBiometricSchema>;
  export type CandidateBiometric = typeof candidateBiometrics.$inferSelect;
  