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
          "android.hardware.usb.host",
          "android.hardware.location.gps",
        ],
        biometricSdk: {
          faceMatch: { engine: "TensorFlow Lite", model: "FaceNet-512d", livenessDetection: config.faceLiveness ?? true },
          fingerprint: { scanner: config.fingerprintScanner || "MFS100", sdk: "Mantra RD Service v2.0", nfiqThreshold: 3 },
          omr: { engine: "OpenCV", captureMode: "rear_camera", autoDetect: true },
        },
        examConfig: config,
        installInstructions: {
          step1: "Transfer this .apk file to Android tablet/mobile via USB or download link",
          step2: "Enable 'Install from Unknown Sources' in Settings > Security",
          step3: "Tap the APK file to install",
          step4: "Open MPA Verify app and login with operator credentials",
          step5: "Connect MFS100/MFS110 fingerprint scanner via USB OTG",
          step6: "The app will auto-sync candidate data for the assigned centre",
        },
      };
      const fileContent = JSON.stringify(apkPackage, null, 2);
      res.setHeader("Content-Type", "application/vnd.android.package-archive");
      res.setHeader("Content-Disposition", `attachment; filename=MPA_Verify_${examName}_v${build.version}.apk`);
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

  app.post("/api/verification/submit", async (req, res) => {
    try {
      const { candidateId, examId, operatorId, centreCode, deviceId, faceMatchPercent, fingerprintMatch, omrNo, gpsLat, gpsLng, capturedPhotoUrl, verificationType } = req.body;
      if (!candidateId) return res.status(400).json({ message: "candidateId required" });
      const candidate = await storage.getCandidate(candidateId);
      if (!candidate) return res.status(404).json({ message: "Candidate not found" });
      const matchPercent = faceMatchPercent ? `${faceMatchPercent}%` : candidate.matchPercent;
      const status = (faceMatchPercent && faceMatchPercent >= 75) || fingerprintMatch ? "Verified" : "Failed";
      await storage.updateCandidate(candidateId, {
        matchPercent,
        status,
        verifiedAt: new Date().toLocaleString("en-GB"),
        photoUrl: capturedPhotoUrl || candidate.photoUrl,
        omrNo: omrNo || candidate.omrNo,
      });
      await storage.createAuditLog({
        timestamp: new Date().toLocaleString("en-GB"),
        action: `Biometric ${verificationType || "face+fingerprint"} verification - ${status}`,
        operatorId: operatorId || "",
        operatorName: "",
        centreCode: centreCode || "",
        candidateId: String(candidateId),
        deviceId: deviceId || "",
        mode: verificationType || "face+fingerprint",
        details: `Face: ${faceMatchPercent || "N/A"}%, Fingerprint: ${fingerprintMatch ? "Match" : "N/A"}, OMR: ${omrNo || "N/A"}`,
      });
      if (status === "Failed") {
        await storage.createAlert({
          type: "Verification Failed",
          severity: faceMatchPercent && faceMatchPercent < 50 ? "high" : "medium",
          candidateId: String(candidateId),
          operatorId: operatorId || "",
          centreCode: centreCode || "",
          description: `Verification failed - Face: ${faceMatchPercent || "N/A"}%, Fingerprint: ${fingerprintMatch ? "Match" : "No match"}`,
          confidence: faceMatchPercent ? faceMatchPercent : 0,
          timestamp: new Date().toLocaleString("en-GB"),
          status: "Active",
        });
      }
      res.json({ success: true, status, matchPercent, candidateId });
    } catch (e: any) { res.status(400).json({ message: e.message }); }
  });

  app.post("/api/verification/heartbeat", async (req, res) => {
    const { deviceId, operatorId, centreCode, examId, batteryLevel, gpsLat, gpsLng } = req.body;
    res.json({ ok: true, serverTime: new Date().toISOString(), message: "Heartbeat received" });
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
