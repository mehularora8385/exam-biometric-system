import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import {
  insertExamSchema, insertCenterSchema, insertOperatorSchema,
  insertCandidateSchema, insertDepartmentSchema, insertDesignationSchema,
  insertSlotSchema, insertCenterOperatorMapSchema, insertDeviceSchema,
  insertApkBuildSchema, insertAuditLogSchema, insertAlertSchema,
  insertGlobalTechSettingsSchema,
} from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      res.json({ id: user.id, username: user.username, role: user.role, displayName: user.displayName });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/exams", async (_req, res) => {
    try {
      const data = await storage.listExams();
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/exams", async (req, res) => {
    try {
      const parsed = insertExamSchema.parse(req.body);
      const exam = await storage.createExam(parsed);
      res.status(201).json(exam);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.get("/api/exams/:id", async (req, res) => {
    try {
      const exam = await storage.getExam(Number(req.params.id));
      if (!exam) return res.status(404).json({ message: "Exam not found" });
      res.json(exam);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.put("/api/exams/:id", async (req, res) => {
    try {
      const exam = await storage.updateExam(Number(req.params.id), req.body);
      if (!exam) return res.status(404).json({ message: "Exam not found" });
      res.json(exam);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.delete("/api/exams/:id", async (req, res) => {
    try {
      await storage.deleteExam(Number(req.params.id));
      res.json({ message: "Deleted" });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/centers", async (req, res) => {
    try {
      const examId = req.query.examId ? Number(req.query.examId) : undefined;
      const data = await storage.listCenters(examId);
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/centers", async (req, res) => {
    try {
      const parsed = insertCenterSchema.parse(req.body);
      const center = await storage.createCenter(parsed);
      res.status(201).json(center);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.get("/api/centers/:id", async (req, res) => {
    try {
      const center = await storage.getCenter(Number(req.params.id));
      if (!center) return res.status(404).json({ message: "Center not found" });
      res.json(center);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.put("/api/centers/:id", async (req, res) => {
    try {
      const center = await storage.updateCenter(Number(req.params.id), req.body);
      if (!center) return res.status(404).json({ message: "Center not found" });
      res.json(center);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.delete("/api/centers/:id", async (req, res) => {
    try {
      await storage.deleteCenter(Number(req.params.id));
      res.json({ message: "Deleted" });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/operators", async (_req, res) => {
    try {
      const data = await storage.listOperators();
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/operators", async (req, res) => {
    try {
      const parsed = insertOperatorSchema.parse(req.body);
      const op = await storage.createOperator(parsed);
      res.status(201).json(op);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.get("/api/operators/:id", async (req, res) => {
    try {
      const op = await storage.getOperator(Number(req.params.id));
      if (!op) return res.status(404).json({ message: "Operator not found" });
      res.json(op);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.put("/api/operators/:id", async (req, res) => {
    try {
      const op = await storage.updateOperator(Number(req.params.id), req.body);
      if (!op) return res.status(404).json({ message: "Operator not found" });
      res.json(op);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.delete("/api/operators/:id", async (req, res) => {
    try {
      await storage.deleteOperator(Number(req.params.id));
      res.json({ message: "Deleted" });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/candidates", async (req, res) => {
    try {
      const examId = req.query.examId ? Number(req.query.examId) : undefined;
      const data = await storage.listCandidates(examId);
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/candidates", async (req, res) => {
    try {
      const parsed = insertCandidateSchema.parse(req.body);
      const c = await storage.createCandidate(parsed);
      res.status(201).json(c);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.get("/api/candidates/:id", async (req, res) => {
    try {
      const c = await storage.getCandidate(Number(req.params.id));
      if (!c) return res.status(404).json({ message: "Candidate not found" });
      res.json(c);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.put("/api/candidates/:id", async (req, res) => {
    try {
      const c = await storage.updateCandidate(Number(req.params.id), req.body);
      if (!c) return res.status(404).json({ message: "Candidate not found" });
      res.json(c);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.delete("/api/candidates/:id", async (req, res) => {
    try {
      await storage.deleteCandidate(Number(req.params.id));
      res.json({ message: "Deleted" });
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/departments", async (_req, res) => {
    try { res.json(await storage.listDepartments()); } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.post("/api/departments", async (req, res) => {
    try {
      const parsed = insertDepartmentSchema.parse(req.body);
      res.status(201).json(await storage.createDepartment(parsed));
    } catch (e: any) { res.status(400).json({ message: e.message }); }
  });

  app.put("/api/departments/:id", async (req, res) => {
    try {
      const result = await storage.updateDepartment(Number(req.params.id), req.body);
      if (!result) return res.status(404).json({ message: "Not found" });
      res.json(result);
    } catch (e: any) { res.status(400).json({ message: e.message }); }
  });

  app.delete("/api/departments/:id", async (req, res) => {
    try { await storage.deleteDepartment(Number(req.params.id)); res.json({ message: "Deleted" }); } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.get("/api/designations", async (_req, res) => {
    try { res.json(await storage.listDesignations()); } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.post("/api/designations", async (req, res) => {
    try {
      const parsed = insertDesignationSchema.parse(req.body);
      res.status(201).json(await storage.createDesignation(parsed));
    } catch (e: any) { res.status(400).json({ message: e.message }); }
  });

  app.put("/api/designations/:id", async (req, res) => {
    try {
      const result = await storage.updateDesignation(Number(req.params.id), req.body);
      if (!result) return res.status(404).json({ message: "Not found" });
      res.json(result);
    } catch (e: any) { res.status(400).json({ message: e.message }); }
  });

  app.delete("/api/designations/:id", async (req, res) => {
    try { await storage.deleteDesignation(Number(req.params.id)); res.json({ message: "Deleted" }); } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.get("/api/slots", async (req, res) => {
    try {
      const examId = req.query.examId ? Number(req.query.examId) : undefined;
      res.json(await storage.listSlots(examId));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.post("/api/slots", async (req, res) => {
    try {
      const parsed = insertSlotSchema.parse(req.body);
      res.status(201).json(await storage.createSlot(parsed));
    } catch (e: any) { res.status(400).json({ message: e.message }); }
  });

  app.put("/api/slots/:id", async (req, res) => {
    try {
      const result = await storage.updateSlot(Number(req.params.id), req.body);
      if (!result) return res.status(404).json({ message: "Not found" });
      res.json(result);
    } catch (e: any) { res.status(400).json({ message: e.message }); }
  });

  app.delete("/api/slots/:id", async (req, res) => {
    try { await storage.deleteSlot(Number(req.params.id)); res.json({ message: "Deleted" }); } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.get("/api/center-operator-maps", async (_req, res) => {
    try { res.json(await storage.listCenterOperatorMaps()); } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.post("/api/center-operator-maps", async (req, res) => {
    try {
      const parsed = insertCenterOperatorMapSchema.parse(req.body);
      res.status(201).json(await storage.createCenterOperatorMap(parsed));
    } catch (e: any) { res.status(400).json({ message: e.message }); }
  });

  app.delete("/api/center-operator-maps/:id", async (req, res) => {
    try { await storage.deleteCenterOperatorMap(Number(req.params.id)); res.json({ message: "Deleted" }); } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.get("/api/devices", async (_req, res) => {
    try { res.json(await storage.listDevices()); } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.post("/api/devices", async (req, res) => {
    try {
      const parsed = insertDeviceSchema.parse(req.body);
      res.status(201).json(await storage.createDevice(parsed));
    } catch (e: any) { res.status(400).json({ message: e.message }); }
  });

  app.put("/api/devices/:id", async (req, res) => {
    try {
      const result = await storage.updateDevice(Number(req.params.id), req.body);
      if (!result) return res.status(404).json({ message: "Not found" });
      res.json(result);
    } catch (e: any) { res.status(400).json({ message: e.message }); }
  });

  app.delete("/api/devices/:id", async (req, res) => {
    try { await storage.deleteDevice(Number(req.params.id)); res.json({ message: "Deleted" }); } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.get("/api/apk-builds", async (req, res) => {
    try {
      const examId = req.query.examId ? Number(req.query.examId) : undefined;
      res.json(await storage.listApkBuilds(examId));
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.post("/api/apk-builds", async (req, res) => {
    try {
      const parsed = insertApkBuildSchema.parse(req.body);
      res.status(201).json(await storage.createApkBuild(parsed));
    } catch (e: any) { res.status(400).json({ message: e.message }); }
  });

  app.get("/api/audit-logs", async (_req, res) => {
    try { res.json(await storage.listAuditLogs()); } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.post("/api/audit-logs", async (req, res) => {
    try {
      const parsed = insertAuditLogSchema.parse(req.body);
      res.status(201).json(await storage.createAuditLog(parsed));
    } catch (e: any) { res.status(400).json({ message: e.message }); }
  });

  app.get("/api/alerts", async (_req, res) => {
    try { res.json(await storage.listAlerts()); } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.post("/api/alerts", async (req, res) => {
    try {
      const parsed = insertAlertSchema.parse(req.body);
      res.status(201).json(await storage.createAlert(parsed));
    } catch (e: any) { res.status(400).json({ message: e.message }); }
  });

  app.put("/api/alerts/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      const result = await storage.updateAlertStatus(Number(req.params.id), status);
      if (!result) return res.status(404).json({ message: "Not found" });
      res.json(result);
    } catch (e: any) { res.status(400).json({ message: e.message }); }
  });

  app.get("/api/global-tech-settings/:examId", async (req, res) => {
    try {
      const settings = await storage.getGlobalTechSettings(Number(req.params.examId));
      res.json(settings || { kinesicsEnabled: false, rfidEnabled: false, voiceBiometricsEnabled: false });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.put("/api/global-tech-settings", async (req, res) => {
    try {
      const parsed = insertGlobalTechSettingsSchema.parse(req.body);
      const result = await storage.upsertGlobalTechSettings(parsed);
      res.json(result);
    } catch (e: any) { res.status(400).json({ message: e.message }); }
  });

  app.get("/api/dashboard/stats", async (_req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  return httpServer;
}
