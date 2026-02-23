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
  centerId: integer("center_id"),
  centerName: text("center_name"),
  device: text("device").default("Not bound"),
  lastActive: text("last_active").default("Never"),
  status: text("status").notNull().default("Active"),
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
  model: text("model"),
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
export const insertApkBuildSchema = createInsertSchema(apkBuilds).omit({ id: true });
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
