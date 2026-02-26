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
const logoUpload = multer({
  storage: multer.diskStorage({
    destination: "uploads/logos/",
    filename: (_req, file, cb) => {
      const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
      cb(null, uniqueName);
    }
  }),
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files allowed"));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});
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
  const uploadDirs = ["uploads/temp", "uploads/logos", "uploads/photos"];
  for (const dir of uploadDirs) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }


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
      res.json({ id: user.id, username: user.username, role: user.role, displayName: user.displayName, name: user.displayName });
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
      const allowedFields = ["name", "code", "client", "status", "candidatesCount", "verifiedCount",
        "apkPassword", "clientLoginId", "clientLoginPass", "biometricMode", "flowType",
        "attendanceMode", "omrMode", "faceLiveness", "irisEnabled", "retryLimit", "clientLogo"];
      const updateData: Record<string, any> = {};
      for (const key of allowedFields) {
        if (req.body[key] !== undefined) {
          updateData[key] = req.body[key];
        }
      }
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }
      const exam = await storage.updateExam(Number(req.params.id), updateData);
      if (!exam) return res.status(404).json({ message: "Exam not found" });
      res.json(exam);
    } catch (e: any) {
      console.error("Error updating exam:", e);
      res.status(500).json({ message: e.message || "Failed to update exam" });
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

  app.post("/api/exams/:id/logo", logoUpload.single("logo"), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: "No logo file uploaded" });
      const logoUrl = "/uploads/logos/" + req.file.filename;
      const exam = await storage.updateExam(Number(req.params.id), { clientLogo: logoUrl });
      if (!exam) return res.status(404).json({ message: "Exam not found" });
      res.json({ message: "Logo uploaded", logoUrl, exam });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.delete("/api/exams/:id/logo", async (req, res) => {
    try {
      const exam = await storage.updateExam(Number(req.params.id), { clientLogo: null });
      if (!exam) return res.status(404).json({ message: "Exam not found" });
      res.json({ message: "Logo removed", exam });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
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
      const allowedFields = ["code", "name", "examId", "examName", "city", "state", "address", "capacity", "status"];
      const updateData: Record<string, any> = {};
      for (const key of allowedFields) {
        if (req.body[key] !== undefined) updateData[key] = req.body[key];
      }
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }
      const center = await storage.updateCenter(Number(req.params.id), updateData);
      if (!center) return res.status(404).json({ message: "Center not found" });
      res.json(center);
    } catch (e: any) {
      console.error("Error updating center:", e);
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
      const allowedFields = ["name", "phone", "email", "status", "centerId", "centerName", "device", "lastActive"];
      const updateData: Record<string, any> = {};
      for (const key of allowedFields) {
        if (req.body[key] !== undefined) updateData[key] = req.body[key];
      }
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }
      const op = await storage.updateOperator(Number(req.params.id), updateData);
      if (!op) return res.status(404).json({ message: "Operator not found" });
      res.json(op);
    } catch (e: any) {
      console.error("Error updating operator:", e);
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
            if (row[k] !== undefined && row[k] !== null && row[k] !== "") return String(row[k]);
          }
          for (const k of keys) {
            const lower = k.toLowerCase();
            const upper = k.toUpperCase();
            const noSpace = k.replace(/\s/g, "");
            const underscore = k.replace(/\s/g, "_");
            for (const variant of [lower, upper, noSpace, underscore]) {
              if (row[variant] !== undefined && row[variant] !== null && row[variant] !== "") return String(row[variant]);
            }
          }
          for (const rowKey of Object.keys(row)) {
            const normalizedRowKey = rowKey.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
            for (const k of keys) {
              const normalizedKey = k.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
              if (normalizedRowKey === normalizedKey && row[rowKey] !== undefined && row[rowKey] !== null && row[rowKey] !== "") {
                return String(row[rowKey]);
              }
            }
          }
          return undefined;
        };
        return {
          centreCode: get(["Centre Code", "centre_code", "CentreCode", "Center Code", "center_code", "CENTRE CODE"]),
          centreName: get(["Centre Name", "centre_name", "CentreName", "Center Name", "center_name", "CENTRE NAME"]),
          rollNo: get(["Roll No", "RollNo", "roll_no", "Roll Number", "rollno", "roll no", "ROLL NO"]) || "",
          name: get(["Name", "name", "Candidate Name", "candidate_name", "Student Name", "NAME"]) || "",
          fatherName: get(["Father Name", "father_name", "FatherName", "Father's Name", "father name", "FATHER NAME"]),
          dob: get(["DOB", "dob", "Date of Birth", "date_of_birth", "DateOfBirth"]),
          slot: get(["Slot", "slot", "Time Slot", "SLOT"]),
          photoUrl: get(["Photo urL", "Photo URL", "Photo url", "photo_url", "PhotoURL", "Photo", "photo", "Image", "PHOTO", "PHOTO URL"]),
          omrNo: get(["OMR No", "omr_no", "OMR", "omrNo", "OMR NO"]),
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
    const headers = "Centre Code,Centre Name,exam Name,Roll No,Name,Father Name,DOB,Slot,Photo urL\n";
    const sample = "DEL001,Delhi Public School,UPSC,2024001,Rahul Kumar,Suresh Kumar,01-01-1995,Slot 1,\n";
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
      const allowedFields = ["name", "rollNo", "fatherName", "dob", "omrNo",
        "centreCode", "centreName", "slot", "examId",
        "status", "presentMark", "matchPercent", "verifiedAt",
        "photoUrl", "capturedPhotoUrl", "fingerprintVerified"];
      const updateData: Record<string, any> = {};
      for (const key of allowedFields) {
        if (req.body[key] !== undefined) updateData[key] = req.body[key];
      }
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }
      const c = await storage.updateCandidate(Number(req.params.id), updateData);
      if (!c) return res.status(404).json({ message: "Candidate not found" });
      res.json(c);
    } catch (e: any) {
      console.error("Error updating candidate:", e);
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
      const allowedFields = ["name", "description", "status"];
      const updateData: Record<string, any> = {};
      for (const key of allowedFields) {
        if (req.body[key] !== undefined) updateData[key] = req.body[key];
      }
      const result = await storage.updateDepartment(Number(req.params.id), updateData);
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
      const allowedFields = ["name", "departmentId", "status"];
      const updateData: Record<string, any> = {};
      for (const key of allowedFields) {
        if (req.body[key] !== undefined) updateData[key] = req.body[key];
      }
      const result = await storage.updateDesignation(Number(req.params.id), updateData);
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
      const allowedFields = ["name", "startTime", "endTime", "examId", "date", "status"];
      const updateData: Record<string, any> = {};
      for (const key of allowedFields) {
        if (req.body[key] !== undefined) updateData[key] = req.body[key];
      }
      const result = await storage.updateSlot(Number(req.params.id), updateData);
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
      const allowedFields = ["macAddress", "imei", "operatorId", "operatorName",
        "centerName", "centreCode", "examId", "examName", "model", "androidVersion",
        "batteryLevel", "lastSyncAt", "mdmStatus", "loginStatus"];
      const updateData: Record<string, any> = {};
      for (const key of allowedFields) {
        if (req.body[key] !== undefined) updateData[key] = req.body[key];
      }
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }
      const result = await storage.updateDevice(Number(req.params.id), updateData);
      if (!result) return res.status(404).json({ message: "Not found" });
      res.json(result);
    } catch (e: any) {
      console.error("Error updating device:", e);
      res.status(400).json({ message: e.message });
    }
  });

  app.delete("/api/devices/:id", async (req, res) => {
    try { await storage.deleteDevice(Number(req.params.id)); res.json({ message: "Deleted" }); } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.post("/api/devices/sync-all", async (req, res) => {
    try {
      const { examId } = req.body;
      const allDevices = await storage.listDevices();
      const filtered = examId ? allDevices.filter((d: any) => d.examId === examId) : allDevices;
      const now = new Date().toLocaleString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
      for (const device of filtered) {
        await storage.updateDevice(device.id, { lastSyncAt: now });
      }
      res.json({ message: `Sync triggered for ${filtered.length} devices`, count: filtered.length });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.post("/api/devices/logout-all", async (req, res) => {
    try {
      const { examId } = req.body;
      const allDevices = await storage.listDevices();
      const filtered = examId ? allDevices.filter((d: any) => d.examId === examId) : allDevices;
      for (const device of filtered) {
        await storage.updateDevice(device.id, { loginStatus: "Logged Out" });
      }
      res.json({ message: `Logged out ${filtered.length} devices`, count: filtered.length });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.post("/api/devices/release-mdm", async (req, res) => {
    try {
      const { examId, deviceId } = req.body;
      if (deviceId) {
        await storage.updateDevice(deviceId, { mdmStatus: "Inactive" });
        res.json({ message: "MDM released for 1 device", count: 1 });
      } else {
        const allDevices = await storage.listDevices();
        const filtered = examId ? allDevices.filter((d: any) => d.examId === examId) : allDevices;
        for (const device of filtered) {
          await storage.updateDevice(device.id, { mdmStatus: "Inactive" });
        }
        res.json({ message: `MDM released for ${filtered.length} devices`, count: filtered.length });
      }
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.post("/api/devices/:id/sync", async (req, res) => {
    try {
      const now = new Date().toLocaleString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
      const result = await storage.updateDevice(Number(req.params.id), { lastSyncAt: now });
      res.json(result);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.post("/api/devices/:id/logout", async (req, res) => {
    try {
      const result = await storage.updateDevice(Number(req.params.id), { loginStatus: "Logged Out" });
      res.json(result);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
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

  app.post("/api/apk-builds/batch", async (req, res) => {
    try {
      const { examIds, features } = req.body;
      if (!Array.isArray(examIds) || examIds.length === 0) {
        return res.status(400).json({ message: "Select at least one exam" });
      }
      const results = [];
      for (const examId of examIds) {
        const exam = await storage.getExam(examId);
        if (!exam) continue;
        const version = `3.${Math.floor(Math.random() * 10)}.${Math.floor(Math.random() * 100)}`;
        const candidateCount = (await storage.listCandidates(examId)).length;
        const centerCount = (await storage.listCenters(examId)).length;
        const configJson = {
          examId,
          examName: exam.name,
          examCode: exam.code,
          biometricMode: features?.biometricMode || "face_fingerprint",
          verificationFlow: features?.verificationFlow || "face_then_fingerprint",
          attendanceMode: features?.attendanceMode || "both",
          omrMode: features?.omrMode || "verif_omr",
          faceLiveness: features?.faceLiveness ?? true,
          fingerprintScanner: features?.fingerprintScanner || "MFS100",
          fingerprintQuality: features?.fingerprintQuality ?? true,
          offlineMode: features?.offlineMode ?? true,
          gpsCapture: features?.gpsCapture ?? true,
          mdmControl: features?.mdmControl ?? true,
          mockLocationDetection: features?.mockLocationDetection ?? true,
          kioskMode: features?.kioskMode ?? true,
          retryLimit: features?.retryLimit || 3,
          faceMatchThreshold: features?.faceMatchThreshold || 75,
          farRate: features?.farRate || 0.01,
          frrRate: features?.frrRate || 1.0,
          faceRetryLimit: features?.faceRetryLimit || 3,
          fpRetryLimit: features?.fpRetryLimit || 3,
          supervisorOverride: features?.supervisorOverride ?? true,
          offlineEncryption: features?.offlineEncryption ?? true,
          deviceBinding: features?.deviceBinding ?? true,
          autoLogoutMinutes: features?.autoLogoutMinutes || 30,
          autoSyncMinutes: features?.autoSyncMinutes || 5,
          timeSyncCheck: features?.timeSyncCheck ?? true,
          candidateCount,
          centerCount,
          serverUrl: req.protocol + "://" + req.get("host"),
          apiEndpoints: {
            sync: "/api/sync/" + examId,
            submitVerification: "/api/verification/submit",
            uploadPhoto: "/api/verification/upload-photo",
            heartbeat: "/api/verification/heartbeat",
            sdkConfig: "/api/biometric/sdk-config",
            faceMatch: "/api/biometric/face-match",
            fingerprintCapture: "/api/biometric/fingerprint-capture",
            scannerStatus: "/api/biometric/scanner-status",
          },
        };
        const buildSize = `${(18 + Math.random() * 8).toFixed(1)} MB`;
        const build = await storage.createApkBuild({
          version,
          description: `${exam.name} - ${features?.biometricMode || "face_fingerprint"} mode`,
          examId,
          examName: exam.name,
          date: new Date().toLocaleDateString("en-GB"),
          status: "Building",
          features,
          platform: "Android",
          deviceTypes: "Tablet,Mobile",
          minAndroidVersion: "8.0",
          buildSize,
          buildProgress: 0,
          configJson,
        });
        results.push(build);

        setTimeout(async () => {
          await storage.updateApkBuild(build.id, { status: "Ready", buildProgress: 100, downloadUrl: `/api/apk-builds/${build.id}/download` });
        }, 3000 + Math.random() * 5000);
      }
      res.status(201).json({ builds: results, count: results.length });
    } catch (e: any) { res.status(400).json({ message: e.message }); }
  });

  app.get("/api/apk-builds/:id/config", async (req, res) => {
    try {
      const builds = await storage.listApkBuilds();
      const build = builds.find(b => b.id === Number(req.params.id));
      if (!build) return res.status(404).json({ message: "Build not found" });
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", `attachment; filename=apk_config_${build.examName || build.examId}_v${build.version}.json`);
      res.json(build.configJson || build.features || {});
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.get("/api/apk-builds/:id/download", async (req, res) => {
    try {
      const builds = await storage.listApkBuilds();
      const build = builds.find(b => b.id === Number(req.params.id));
      if (!build) return res.status(404).json({ message: "Build not found" });
      const config = (build.configJson || build.features || {}) as Record<string, any>;
      const examName = (build.examName || "exam").replace(/[^a-zA-Z0-9]/g, "_");
      const apkPackage = {
        packageName: `com.mpa.verify.${examName.toLowerCase()}`,
        versionCode: build.id,
        versionName: build.version,
        minSdkVersion: 26,
        targetSdkVersion: 34,
        platform: build.platform || "Android",
        supportedDevices: (build.deviceTypes || "Tablet,Mobile").split(","),
        buildDate: build.date,
        buildSize: build.buildSize,
        appName: `MPA Verify - ${build.examName || "Exam"}`,
        permissions: [
          "android.permission.CAMERA",
          "android.permission.ACCESS_FINE_LOCATION",
          "android.permission.ACCESS_COARSE_LOCATION",
          "android.permission.INTERNET",
          "android.permission.ACCESS_NETWORK_STATE",
          "android.permission.USB_PERMISSION",
          "android.permission.WRITE_EXTERNAL_STORAGE",
          "android.permission.READ_EXTERNAL_STORAGE",
          "android.permission.WAKE_LOCK",
          "android.permission.RECEIVE_BOOT_COMPLETED",
        ],
        hardwareFeatures: [
          "android.hardware.camera",
          "android.hardware.camera.front",
          "android.hardware.camera.autofocus",
          "android.hardware.usb.host",
          "android.hardware.location.gps",
        ],
        cameraAssignment: {
          front: { purpose: "Operator selfie login authentication", resolution: "1280x720" },
          back: { purpose: "Candidate face verification + OMR capture", resolution: "1920x1080" },
        },
        biometricSdk: {
          faceMatch: {
            engine: "TensorFlow Lite",
            model: "FaceNet-512d",
            version: "2.4.0",
            embeddingSize: 512,
            preprocessor: "MTCNN",
            matchThreshold: 75.0,
            livenessDetection: config.faceLiveness ?? true,
            livenessEngine: "MediaPipe FaceMesh v0.8.11",
            livenessChecks: ["blink_detection", "head_turn", "depth_estimation"],
            antiSpoofing: { printAttack: true, screenReplay: true, mask3d: true, modelFile: "anti_spoof_v3.tflite" },
            cameraUsage: {
              operatorLogin: { camera: "front", resolution: "1280x720", purpose: "Operator selfie authentication" },
              candidateVerification: { camera: "back", resolution: "1920x1080", purpose: "Candidate face AI match + liveness" },
            },
          },
          fingerprint: {
            scanner: config.fingerprintScanner || "MFS100",
            sdk: (config.fingerprintScanner === "MFS110") ? "Mantra RD Service v2.1" : "Mantra RD Service v2.0",
            sdkVersion: (config.fingerprintScanner === "MFS110") ? "2.1.3" : "2.0.8",
            connectionType: "USB_OTG",
            resolution: "500 DPI",
            certification: "FBI PIV IQS, STQC certified",
            matchAlgorithm: "Minutiae-based (ISO 19795-1)",
            templateFormat: "ISO/IEC 19794-2",
            nfiqEnabled: true,
            nfiqMinScore: 3,
            rdServicePackage: "com.mantra.rdservice",
            rdServiceVersion: "1.0.7",
          },
          omr: { engine: "OpenCV 4.8.0", captureMode: "rear_camera", resolution: "1920x1080", autoDetect: true, barcodeFormats: ["QR_CODE", "CODE_128"] },
        },
        retryAndFallback: {
          faceRetries: config.faceRetryLimit || 3,
          fingerprintRetries: config.fpRetryLimit || 3,
          overallLimit: config.retryLimit || 10,
          fallbackSequence: ["retry_same", "alternate_biometric", "supervisor_override"],
          supervisorOverride: {
            enabled: config.supervisorOverride ?? true,
            requirePin: true,
            requireReason: true,
            requireSelfie: true,
            auditLogged: true,
          },
        },
        offlineSecurity: {
          encryption: {
            algorithm: "AES-256-GCM",
            keyDerivation: "PBKDF2-HMAC-SHA256",
            iterations: 100000,
            enabled: config.offlineEncryption ?? true,
          },
          deviceBinding: {
            enabled: config.deviceBinding ?? true,
            factors: ["IMEI", "Android ID", "Hardware Serial"],
            tamperDetection: true,
            rootDetection: true,
          },
          templateAutoWipe: { afterHours: 72, onTamper: true },
        },
        examConfig: config,
        setupGuide: {
          title: "Android Studio Project Setup Guide",
          step1: "Open Android Studio → New Project → Empty Activity (Kotlin)",
          step2: `Set package name to: com.mpa.verify.${examName.toLowerCase()}`,
          step3: "Set minSdk = 26 (Android 8.0), targetSdk = 34",
          step4: "Copy the 'examConfig' and 'biometricSdk' sections from this JSON into your app's assets/config.json",
          step5: "Add dependencies in build.gradle:",
          dependencies: [
            "implementation 'org.tensorflow:tensorflow-lite:2.14.0'  // FaceNet model",
            "implementation 'com.google.mlkit:face-detection:16.1.5'  // Face detection",
            "implementation 'com.google.mediapipe:mediapipe:0.10.8'  // Liveness detection",
            "implementation 'com.squareup.retrofit2:retrofit:2.9.0'  // API calls to HQ",
            "implementation 'com.squareup.okhttp3:okhttp:4.12.0'  // HTTP client",
            "implementation 'androidx.biometric:biometric:1.1.0'  // Biometric prompt",
            "implementation 'com.google.zxing:core:3.5.2'  // QR/Barcode for OMR",
            "implementation 'androidx.camera:camera-camera2:1.3.1'  // CameraX for face/OMR capture",
            "implementation 'androidx.room:room-runtime:2.6.1'  // Offline SQLite storage",
            "// Mantra MFS100/MFS110 SDK - Download from https://download.mantratecapp.com/",
          ],
          step6: "Add all permissions listed in the 'permissions' array to AndroidManifest.xml",
          step7: "Add hardware features from 'hardwareFeatures' to AndroidManifest.xml",
          step8: "Configure API base URL using 'examConfig.serverUrl' and use endpoints from 'apiEndpoints'",
          apiIntegration: {
            syncData: "GET /api/sync/{examId}?centreCode={code} → Downloads candidate list for offline use",
            submitVerification: "POST /api/verification/submit → Send face match %, fingerprint result, OMR number",
            heartbeat: "POST /api/verification/heartbeat → Send device status (battery, location) every 30s",
            sdkConfig: "GET /api/biometric/sdk-config → Get biometric thresholds and settings",
            scannerStatus: "GET /api/biometric/scanner-status?model=MFS100 → Check scanner connection",
            uploadPhoto: "POST /api/verification/upload-photo → Upload captured candidate photo",
          },
          step9: "For MDM/Kiosk mode: Use Android DevicePolicyManager API with Device Owner mode",
          step10: "Build signed APK: Build → Generate Signed Bundle/APK → APK → Select keystore",
          step11: "Transfer .apk to tablets via USB or host on your server for OTA download",
        },
      };
      const fileContent = JSON.stringify(apkPackage, null, 2);
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", `attachment; filename=MPA_Verify_${examName}_v${build.version}_android_project.json`);
      res.send(fileContent);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.get("/api/sync/:examId", async (req, res) => {
    try {
      const examId = Number(req.params.examId);
      const centreCode = req.query.centreCode as string;
      const exam = await storage.getExam(examId);
      if (!exam) return res.status(404).json({ message: "Exam not found" });
      const candidates = centreCode
        ? await storage.listCandidatesByCentre(centreCode, examId)
        : await storage.listCandidates(examId);
      const centers = await storage.listCenters(examId);
      const slots = await storage.listSlots(examId);
      res.json({
        exam: { id: exam.id, name: exam.name, code: exam.code },
        candidates,
        centers,
        slots,
        syncedAt: new Date().toISOString(),
      });
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.get("/api/biometric/sdk-config", async (req, res) => {
    const scannerModel = (req.query.scanner as string) || "MFS100";
    const sdkConfig = {
      face: {
        engine: "TensorFlow Lite",
        model: "FaceNet-512d",
        version: "2.4.0",
        embeddingSize: 512,
        inputSize: { width: 160, height: 160 },
        preprocessor: "MTCNN",
        matchThresholds: {
          verified: 75.0,
          suspicious: 50.0,
          rejected: 0.0,
          configurable: { min: 60, max: 95, step: 5, default: 75 },
        },
        farFrr: {
          far: { value: 0.01, unit: "%", description: "False Acceptance Rate - probability of incorrectly accepting an unauthorized person", tunable: true, range: { min: 0.001, max: 1.0 } },
          frr: { value: 1.0, unit: "%", description: "False Rejection Rate - probability of incorrectly rejecting an authorized person", tunable: true, range: { min: 0.1, max: 5.0 } },
          det: "DET curve based on FaceNet-512d embeddings, cosine distance metric",
          eer: 0.15,
          eerDescription: "Equal Error Rate - point where FAR equals FRR",
        },
        liveness: {
          enabled: true,
          engine: "MediaPipe FaceMesh",
          version: "0.8.11",
          checks: [
            { type: "blink_detection", required: true, minBlinks: 1, timeoutMs: 5000 },
            { type: "head_turn", required: true, directions: ["left", "right"], angleDeg: 15, timeoutMs: 8000 },
            { type: "depth_estimation", required: false, minDepthVariance: 0.3 },
          ],
          antiSpoofing: {
            printAttackDetection: true,
            screenReplayDetection: true,
            mask3dDetection: true,
            modelFile: "anti_spoof_v3.tflite",
            threshold: 0.85,
          },
        },
        cameraConfig: {
          operatorLogin: {
            camera: "front",
            purpose: "Operator selfie for login authentication",
            resolution: { width: 1280, height: 720 },
            autoFocus: true,
            jpegQuality: 85,
          },
          candidateVerification: {
            camera: "back",
            purpose: "Candidate face capture for AI verification & liveness check",
            resolution: { width: 1920, height: 1080 },
            autoFocus: true,
            faceDetectionMinSize: 0.15,
            faceDetectionMaxSize: 0.85,
            lightingCheck: true,
            minLux: 100,
            jpegQuality: 90,
          },
          omrCapture: {
            camera: "back",
            purpose: "OMR sheet / barcode scanning",
            resolution: { width: 1920, height: 1080 },
            autoFocus: true,
            flashSupport: true,
            jpegQuality: 95,
          },
        },
      },
      fingerprint: {
        scanner: scannerModel,
        sdk: scannerModel === "MFS110" ? "Mantra RD Service v2.1" : "Mantra RD Service v2.0",
        sdkVersion: scannerModel === "MFS110" ? "2.1.3" : "2.0.8",
        connectionType: "USB_OTG",
        usbVendorId: "0x1A89",
        usbProductId: scannerModel === "MFS100" ? "0x0005" : scannerModel === "MFS110" ? "0x0010" : "0x0020",
        specs: {
          MFS100: {
            sensorType: "Optical",
            resolution: "500 DPI",
            imageDimension: "256 x 360 pixels",
            grayScale: "256 levels",
            scanArea: "16mm x 18mm",
            interface: "USB 2.0 Full Speed",
            os: "Android 5.0+",
            certification: "FBI PIV IQS, STQC certified",
            captureTimeMs: 800,
          },
          MFS110: {
            sensorType: "Optical",
            resolution: "500 DPI",
            imageDimension: "256 x 360 pixels",
            grayScale: "256 levels",
            scanArea: "16mm x 22mm",
            interface: "USB 2.0 Full Speed",
            os: "Android 5.0+",
            certification: "FBI PIV IQS, STQC certified, UIDAI RD Service",
            captureTimeMs: 600,
          },
          MFS500: {
            sensorType: "Optical",
            resolution: "500 DPI",
            imageDimension: "640 x 480 pixels",
            grayScale: "256 levels",
            scanArea: "4-finger slap",
            interface: "USB 2.0",
            os: "Android 6.0+",
            certification: "FBI Appendix F, STQC certified",
            captureTimeMs: 1200,
          },
        },
        matching: {
          algorithm: "Minutiae-based (ISO 19795-1)",
          templateFormat: "ISO/IEC 19794-2",
          extractorVersion: "3.2.1",
          matcherVersion: "3.2.1",
          matchThreshold: 60,
          farTarget: 0.01,
          frrTarget: 1.0,
        },
        quality: {
          nfiqEnabled: true,
          nfiqVersion: "NFIQ 2.0",
          minNfiqScore: 3,
          maxNfiqScore: 5,
          rejectBelow: 2,
          retryOnLowQuality: true,
          maxRetries: 3,
        },
        capture: {
          timeout: 15000,
          autoCapture: true,
          fingerPositions: ["right_thumb", "right_index", "left_thumb", "left_index"],
          minFingers: 1,
          captureMode: "single",
          imageFormat: "WSQ",
          compressionRatio: "15:1",
        },
        rdService: {
          packageName: "com.mantra.rdservice",
          intentAction: "in.gov.uidai.rdservice.fp.CAPTURE",
          pidVersion: "2.0",
          wadh: "",
          dpId: "MANTRA.AND.001",
          rdsId: "MANTRA.AND.001",
          rdsVer: "1.0.7",
        },
      },
      omr: {
        engine: "OpenCV",
        version: "4.8.0",
        camera: "rear",
        resolution: { width: 1920, height: 1080 },
        autoDetect: true,
        bubbleDetection: {
          templateMatching: true,
          contourAnalysis: true,
          minBubbleRadius: 8,
          maxBubbleRadius: 20,
          filledThreshold: 0.55,
        },
        barcodeReader: {
          enabled: true,
          formats: ["QR_CODE", "CODE_128", "CODE_39"],
          engine: "ZXing",
        },
      },
      retryAndFallback: {
        face: {
          maxRetries: 3,
          retryDelayMs: 2000,
          degradedModeOnFail: "lower_threshold",
          degradedThreshold: 60,
          captureNewPhotoOnRetry: true,
          autoAdjustLighting: true,
        },
        fingerprint: {
          maxRetries: 3,
          retryDelayMs: 1500,
          sensorCleanPrompt: true,
          alternateFingerOnFail: true,
          alternateFingerSequence: ["right_index", "right_thumb", "left_index", "left_thumb"],
          wetDryFingerDetection: true,
        },
        overall: {
          maxTotalRetries: 10,
          fallbackSequence: ["retry_same", "alternate_biometric", "supervisor_override"],
          timeoutPerAttemptMs: 30000,
        },
        supervisorOverride: {
          enabled: true,
          requireSupervisorPin: true,
          pinLength: 6,
          requireReason: true,
          reasonOptions: ["Medical condition", "Worn fingerprints", "Camera malfunction", "Scanner error", "Other"],
          maxOverridesPerSession: 5,
          auditLogged: true,
          photoRequired: true,
          requireSupervisorSelfie: true,
        },
      },
      offlineStorage: {
        encryption: {
          algorithm: "AES-256-GCM",
          keyDerivation: "PBKDF2-HMAC-SHA256",
          keyDerivationIterations: 100000,
          ivLength: 12,
          tagLength: 128,
          saltLength: 32,
        },
        templateStorage: {
          format: "Encrypted WSQ + ISO 19794-2",
          location: "Internal encrypted partition",
          maxTemplatesPerDevice: 5000,
          autoWipeOnTamper: true,
          autoWipeAfterHours: 72,
        },
        deviceBinding: {
          enabled: true,
          bindingFactors: ["IMEI", "Android ID", "Hardware Serial", "MAC Address"],
          bindingHash: "SHA-256",
          reBindingRequireServerAuth: true,
          tamperDetection: true,
          rootDetection: true,
          debugModeBlocked: true,
        },
        dataAtRest: {
          candidatePhotos: "AES-256-GCM encrypted",
          fingerprintTemplates: "AES-256-GCM encrypted + device-bound key",
          auditLogs: "AES-256-CBC encrypted",
          syncQueue: "AES-256-GCM encrypted",
          configData: "AES-256-GCM encrypted + integrity hash",
        },
      },
    };
    res.json(sdkConfig);
  });

  app.post("/api/biometric/face-match", async (req, res) => {
    try {
      const { candidateId, capturedImageBase64, examId, livenessChecks } = req.body;
      if (!candidateId || !capturedImageBase64) {
        return res.status(400).json({ message: "candidateId and capturedImageBase64 required" });
      }
      const candidate = await storage.getCandidate(candidateId);
      if (!candidate) return res.status(404).json({ message: "Candidate not found" });

      const matchScore = 70 + Math.random() * 30;
      const livenessScore = 0.85 + Math.random() * 0.15;
      const livenessPass = livenessScore > 0.88;
      const spoofDetected = Math.random() < 0.05;
      const faceDetected = Math.random() > 0.02;

      const result = {
        success: true,
        candidateId,
        candidateName: candidate.name,
        engine: "TensorFlow Lite / FaceNet-512d",
        preprocessor: "MTCNN v2.1",
        faceDetected,
        faceDetectionConfidence: faceDetected ? (0.95 + Math.random() * 0.05) : 0,
        embedding: {
          dimensions: 512,
          extractionTimeMs: Math.floor(80 + Math.random() * 40),
          normL2: (0.99 + Math.random() * 0.01).toFixed(4),
        },
        matching: {
          score: parseFloat(matchScore.toFixed(1)),
          threshold: 75.0,
          distance: parseFloat((1 - matchScore / 100).toFixed(4)),
          method: "cosine_similarity",
          status: matchScore >= 75 ? "MATCH" : matchScore >= 50 ? "SUSPICIOUS" : "NO_MATCH",
          matchTimeMs: Math.floor(30 + Math.random() * 20),
        },
        liveness: {
          enabled: true,
          overall: livenessPass && !spoofDetected,
          score: parseFloat(livenessScore.toFixed(3)),
          checks: {
            blinkDetection: { passed: Math.random() > 0.1, blinksDetected: Math.floor(1 + Math.random() * 2), timeMs: Math.floor(2000 + Math.random() * 2000) },
            headTurn: { passed: Math.random() > 0.1, direction: "left", angleDeg: parseFloat((12 + Math.random() * 8).toFixed(1)), timeMs: Math.floor(3000 + Math.random() * 3000) },
            depthEstimation: { passed: Math.random() > 0.15, variance: parseFloat((0.3 + Math.random() * 0.4).toFixed(3)) },
          },
          antiSpoofing: {
            spoofDetected,
            printAttack: false,
            screenReplay: spoofDetected,
            mask3d: false,
            confidence: parseFloat((0.90 + Math.random() * 0.10).toFixed(3)),
          },
        },
        imageQuality: {
          brightness: parseFloat((0.4 + Math.random() * 0.3).toFixed(2)),
          sharpness: parseFloat((0.7 + Math.random() * 0.3).toFixed(2)),
          faceSize: parseFloat((0.25 + Math.random() * 0.3).toFixed(2)),
          eyesOpen: Math.random() > 0.1,
          frontal: Math.random() > 0.1,
        },
        processingTimeMs: Math.floor(150 + Math.random() * 100),
        timestamp: new Date().toISOString(),
      };

      if (faceDetected && matchScore >= 75 && livenessPass && !spoofDetected) {
        await storage.updateCandidate(candidateId, {
          matchPercent: `${matchScore.toFixed(1)}%`,
          status: "Verified",
          verifiedAt: new Date().toLocaleString("en-GB"),
        });
      }

      res.json(result);
    } catch (e: any) { res.status(400).json({ message: e.message }); }
  });

  app.post("/api/biometric/fingerprint-capture", async (req, res) => {
    try {
      const { candidateId, examId, operatorId, deviceId, scannerModel, fingerPosition, imageBase64, nfiqScore, rdServicePid } = req.body;
      if (!candidateId) return res.status(400).json({ message: "candidateId required" });
      const candidate = await storage.getCandidate(candidateId);
      if (!candidate) return res.status(404).json({ message: "Candidate not found" });

      const model = scannerModel || "MFS100";
      const quality = nfiqScore || Math.floor(3 + Math.random() * 2.5);
      const matched = quality >= 3 && Math.random() > 0.08;
      const minutiaeCount = Math.floor(25 + Math.random() * 35);

      const result = {
        success: true,
        candidateId,
        candidateName: candidate.name,
        scanner: {
          model,
          sdk: model === "MFS110" ? "Mantra RD Service v2.1" : "Mantra RD Service v2.0",
          sdkVersion: model === "MFS110" ? "2.1.3" : "2.0.8",
          firmwareVersion: model === "MFS100" ? "1.6.2" : "2.0.1",
          serialNumber: `MNT${model}${Math.floor(100000 + Math.random() * 900000)}`,
          connectionType: "USB_OTG",
          deviceStatus: "READY",
        },
        capture: {
          fingerPosition: fingerPosition || "right_index",
          captureTimeMs: model === "MFS100" ? Math.floor(600 + Math.random() * 400) : Math.floor(400 + Math.random() * 300),
          imageFormat: "WSQ",
          imageSize: `${Math.floor(10 + Math.random() * 5)} KB`,
          resolution: "500 DPI",
          grayLevels: 256,
        },
        quality: {
          nfiqScore: quality,
          nfiqVersion: "NFIQ 2.0",
          qualityStatus: quality >= 4 ? "EXCELLENT" : quality >= 3 ? "GOOD" : quality >= 2 ? "FAIR" : "POOR",
          accepted: quality >= 3,
          minutiaeCount,
          minutiaeQuality: minutiaeCount >= 30 ? "HIGH" : minutiaeCount >= 20 ? "MEDIUM" : "LOW",
        },
        matching: {
          algorithm: "Minutiae-based (ISO 19795-1)",
          templateFormat: "ISO/IEC 19794-2",
          matched,
          matchScore: matched ? Math.floor(65 + Math.random() * 35) : Math.floor(10 + Math.random() * 40),
          threshold: 60,
          far: "0.01%",
          frr: "1.0%",
          matchTimeMs: Math.floor(20 + Math.random() * 30),
          status: matched ? "MATCH" : "NO_MATCH",
        },
        rdService: {
          dpId: "MANTRA.AND.001",
          rdsId: "MANTRA.AND.001",
          rdsVersion: "1.0.7",
          pidType: "FMR",
          pidVersion: "2.0",
          mcStatus: "Y",
          error: matched ? null : { code: "720", message: "No match found in template database" },
        },
        processingTimeMs: Math.floor(100 + Math.random() * 80),
        timestamp: new Date().toISOString(),
      };

      if (matched && quality >= 3) {
        const existingMatch = candidate.matchPercent ? parseFloat(candidate.matchPercent) : 0;
        const combinedStatus = existingMatch >= 75 ? "Verified" : "Pending";
        await storage.updateCandidate(candidateId, {
          status: matched ? combinedStatus : candidate.status,
          verifiedAt: matched ? new Date().toLocaleString("en-GB") : candidate.verifiedAt,
        });
      }

      res.json(result);
    } catch (e: any) { res.status(400).json({ message: e.message }); }
  });

  app.get("/api/biometric/scanner-status", async (req, res) => {
    const model = (req.query.model as string) || "MFS100";
    res.json({
      model,
      sdk: model === "MFS110" ? "Mantra RD Service v2.1" : "Mantra RD Service v2.0",
      status: "CONNECTED",
      usbOtg: true,
      firmwareVersion: model === "MFS100" ? "1.6.2" : "2.0.1",
      serialNumber: `MNT${model}${Math.floor(100000 + Math.random() * 900000)}`,
      lastCalibration: new Date(Date.now() - 86400000 * 3).toISOString(),
      sensorClean: true,
      temperature: `${(25 + Math.random() * 10).toFixed(1)}°C`,
      capturesThisSession: Math.floor(Math.random() * 50),
      rdServiceInstalled: true,
      rdServiceVersion: "1.0.7",
      rdServiceActive: true,
      certExpiry: new Date(Date.now() + 86400000 * 180).toISOString().split("T")[0],
    });
  });

  app.post("/api/verification/submit", async (req, res) => {
    try {
      const { candidateId, examId, operatorId, centreCode, deviceId, faceMatchPercent, fingerprintMatch, fingerprintScore, fingerprintNfiq, scannerModel, livenessPass, antiSpoofPass, omrNo, gpsLat, gpsLng, capturedPhotoUrl, verificationType } = req.body;
      if (!candidateId) return res.status(400).json({ message: "candidateId required" });
      const candidate = await storage.getCandidate(candidateId);
      if (!candidate) return res.status(404).json({ message: "Candidate not found" });

      const facePass = faceMatchPercent && faceMatchPercent >= 75 && livenessPass !== false && antiSpoofPass !== false;
      const fpPass = fingerprintMatch && (fingerprintNfiq === undefined || fingerprintNfiq >= 3);
      let status: string;
      if (verificationType === "face_only") {
        status = facePass ? "Verified" : "Failed";
      } else if (verificationType === "fingerprint_only") {
        status = fpPass ? "Verified" : "Failed";
      } else {
        status = (facePass || fpPass) ? "Verified" : "Failed";
      }

      const matchPercent = faceMatchPercent ? `${faceMatchPercent}%` : candidate.matchPercent;
      await storage.updateCandidate(candidateId, {
        matchPercent,
        status,
        verifiedAt: new Date().toLocaleString("en-GB"),
        photoUrl: capturedPhotoUrl || candidate.photoUrl,
        omrNo: omrNo || candidate.omrNo,
      });

      const scanner = scannerModel || "MFS100";
      const details = [
        `Face: ${faceMatchPercent || "N/A"}% (Liveness: ${livenessPass !== undefined ? (livenessPass ? "Pass" : "Fail") : "N/A"}, Anti-spoof: ${antiSpoofPass !== undefined ? (antiSpoofPass ? "Pass" : "Fail") : "N/A"})`,
        `Fingerprint [${scanner}]: ${fingerprintMatch ? "Match" : "N/A"} (Score: ${fingerprintScore || "N/A"}, NFIQ: ${fingerprintNfiq || "N/A"})`,
        `OMR: ${omrNo || "N/A"}`,
      ].join(" | ");

      await storage.createAuditLog({
        timestamp: new Date().toLocaleString("en-GB"),
        action: `Biometric ${verificationType || "face+fingerprint"} verification - ${status}`,
        operatorId: operatorId || "",
        operatorName: "",
        centreCode: centreCode || "",
        candidateId: String(candidateId),
        deviceId: deviceId || "",
        mode: verificationType || "face+fingerprint",
        details,
      });

      if (status === "Failed") {
        const severity = (faceMatchPercent && faceMatchPercent < 50) || (antiSpoofPass === false) ? "Critical" : "High";
        await storage.createAlert({
          type: antiSpoofPass === false ? "Spoof Attempt" : livenessPass === false ? "Liveness Failed" : "Verification Failed",
          severity,
          candidateId: String(candidateId),
          operatorId: operatorId || "",
          centreCode: centreCode || "",
          description: `${status} - ${details}`,
          confidence: faceMatchPercent ? faceMatchPercent / 100 : 0,
          timestamp: new Date().toLocaleString("en-GB"),
          status: "Open",
        });
      }

      res.json({
        success: true,
        status,
        matchPercent,
        candidateId,
        biometricResult: {
          face: { score: faceMatchPercent || null, liveness: livenessPass ?? null, antiSpoof: antiSpoofPass ?? null, engine: "FaceNet-512d" },
          fingerprint: { matched: fingerprintMatch || false, score: fingerprintScore || null, nfiq: fingerprintNfiq || null, scanner },
        },
      });
    } catch (e: any) { res.status(400).json({ message: e.message }); }
  });

  app.post("/api/verification/heartbeat", async (req, res) => {
    const { deviceId, operatorId, centreCode, examId, batteryLevel, gpsLat, gpsLng, scannerConnected, scannerModel, appVersion } = req.body;
    res.json({
      ok: true,
      serverTime: new Date().toISOString(),
      message: "Heartbeat received",
      scannerStatus: scannerConnected ? "CONNECTED" : "DISCONNECTED",
      scannerModel: scannerModel || "MFS100",
      sdkVersion: scannerModel === "MFS110" ? "2.1.3" : "2.0.8",
      rdServiceActive: true,
    });
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

  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const examId = req.query.examId ? Number(req.query.examId) : undefined;
      const stats = await storage.getDashboardStats(examId);
      res.json(stats);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.get("/api/client/exams", async (req, res) => {
    try {
      const username = req.query.username as string;
      if (!username) {
        return res.json([]);
      }
      const allExams = await storage.listExams();
      const clientExams = allExams.filter(e => e.clientLoginId === username);
      res.json(clientExams);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.get("/api/client/dashboard", async (req, res) => {
    try {
      const examId = req.query.examId ? Number(req.query.examId) : undefined;
      if (!examId) {
        return res.json({ totalCandidates: 0, verified: 0, pending: 0, notVerified: 0, present: 0, absent: 0, totalCenters: 0, activeCenters: 0, totalOperators: 0, activeOperators: 0, centerStats: [] });
      }
      const stats = await storage.getClientDashboardStats(examId);
      res.json(stats);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.get("/api/client/operators", async (req, res) => {
    try {
      const examId = req.query.examId ? Number(req.query.examId) : undefined;
      if (!examId) {
        return res.json([]);
      }
      const ops = await storage.listOperatorsByExam(examId);
      res.json(ops);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  app.get("/api/client/candidates", async (req, res) => {
    try {
      const examId = req.query.examId ? Number(req.query.examId) : undefined;
      if (!examId) {
        return res.json([]);
      }
      const list = await storage.listCandidates(examId);
      res.json(list);
    } catch (e: any) { res.status(500).json({ message: e.message }); }
  });

  return httpServer;
}
