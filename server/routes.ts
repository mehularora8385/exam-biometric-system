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
import multer from "multer";
import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";

const upload = multer({ dest: "uploads/temp/" });
const photoUpload = multer({ 
  storage: multer.diskStorage({
    destination: "uploads/photos/",
    filename: (_req, file, cb) => {
      const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
      cb(null, uniqueName);
    }
  }),
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|bmp|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(null, ext || mime);
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

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

  app.post("/api/candidates/bulk", async (req, res) => {
    try {
      const candidatesList = req.body;
      if (!Array.isArray(candidatesList) || candidatesList.length === 0) {
        return res.status(400).json({ message: "Expected non-empty array of candidates" });
      }
      const results = await storage.bulkCreateCandidates(candidatesList);
      const examIds = Array.from(new Set(results.map(c => c.examId).filter(Boolean)));
      for (const eid of examIds) {
        const allForExam = await storage.listCandidates(eid as number);
        await storage.updateExam(eid as number, { candidatesCount: allForExam.length });
      }
      res.status(201).json({ inserted: results.length, candidates: results });
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.get("/api/candidates/by-centre/:centreCode", async (req, res) => {
    try {
      const examId = req.query.examId ? Number(req.query.examId) : undefined;
      const data = await storage.listCandidatesByCentre(req.params.centreCode, examId);
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post("/api/candidates/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No file uploaded" });
      
      const filePath = req.file.path;
      const ext = path.extname(req.file.originalname).toLowerCase();
      let rows: any[] = [];
      
      if (ext === ".csv") {
        const csvContent = fs.readFileSync(filePath, "utf-8");
        const lines = csvContent.split("\n").filter(l => l.trim());
        if (lines.length < 2) {
          fs.unlinkSync(filePath);
          return res.status(400).json({ message: "File is empty or has no data rows" });
        }
        const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",").map(v => v.trim().replace(/^"|"$/g, ""));
          const row: any = {};
          headers.forEach((h, idx) => { row[h] = values[idx] || ""; });
          rows.push(row);
        }
      } else {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      }
      
      fs.unlinkSync(filePath);
      
      const examId = req.body.examId ? parseInt(req.body.examId) : undefined;
      
      const mapRow = (row: any) => {
        const get = (keys: string[]) => {
          for (const k of keys) {
            const val = row[k] || row[k.toLowerCase()] || row[k.toUpperCase()] || row[k.replace(/\s/g, "")] || row[k.replace(/\s/g, "_")];
            if (val !== undefined && val !== null && val !== "") return String(val);
          }
          return undefined;
        };
        return {
          rollNo: get(["Roll No", "RollNo", "roll_no", "Roll Number", "rollno", "roll no", "ROLL NO"]) || "",
          name: get(["Name", "name", "Candidate Name", "candidate_name", "Student Name", "NAME"]) || "",
          fatherName: get(["Father Name", "father_name", "FatherName", "Father's Name", "father name", "FATHER NAME"]),
          dob: get(["DOB", "dob", "Date of Birth", "date_of_birth", "DateOfBirth", "DOB"]),
          omrNo: get(["OMR No", "omr_no", "OMR", "omrNo", "OMR NO"]),
          centreCode: get(["Centre Code", "centre_code", "CentreCode", "Center Code", "center_code", "CENTRE CODE"]),
          centreName: get(["Centre Name", "centre_name", "CentreName", "Center Name", "center_name", "CENTRE NAME"]),
          slot: get(["Slot", "slot", "Time Slot", "SLOT"]),
          photoUrl: get(["Photo", "photo", "Photo URL", "photo_url", "PhotoURL", "Image", "PHOTO"]),
          status: "Pending",
          examId: examId,
        };
      };
      
      const candidatesList = rows.map(mapRow).filter(c => c.rollNo && c.name);
      
      if (candidatesList.length === 0) {
        return res.status(400).json({ message: "No valid candidate rows found. Ensure Roll No and Name columns exist." });
      }
      
      const results = await storage.bulkCreateCandidates(candidatesList as any[]);
      
      if (examId) {
        const allForExam = await storage.listCandidates(examId);
        await storage.updateExam(examId, { candidatesCount: allForExam.length });
      }
      
      res.status(201).json({ 
        inserted: results.length, 
        total: rows.length,
        skipped: rows.length - candidatesList.length,
        message: "Upload successful"
      });
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.post("/api/candidates/upload-photos", photoUpload.array("photos", 500), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) return res.status(400).json({ message: "No photos uploaded" });
      
      const results: any[] = [];
      for (const file of files) {
        const photoUrl = "/uploads/photos/" + file.filename;
        const baseName = path.basename(file.originalname, path.extname(file.originalname));
        const allCandidates = await storage.listCandidates();
        const matched = allCandidates.find(c => c.rollNo === baseName || c.omrNo === baseName);
        if (matched) {
          await storage.updateCandidate(matched.id, { photoUrl });
          results.push({ file: file.originalname, candidateId: matched.id, matched: true, photoUrl });
        } else {
          results.push({ file: file.originalname, matched: false, photoUrl });
        }
      }
      res.json({ uploaded: files.length, matched: results.filter(r => r.matched).length, results });
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  });

  app.use("/uploads", (await import("express")).default.static("uploads"));

  app.get("/api/candidates/template", (_req, res) => {
    const headers = "Roll No,Name,Father Name,DOB,OMR No,Centre Code,Centre Name,Slot,Photo\n";
    const sample = "2024001,Rahul Kumar,Suresh Kumar,01/01/1995,OMR001,DEL001,Delhi Public School,Slot 1,\n";
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=candidate_template.csv");
    res.send(headers + sample);
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
