import type { Express } from "express";
import { storage } from "./storage";
import { db } from "./db";
import { operators } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export function registerApkRoutes(app: Express) {
  app.get("/api/apk/candidates/:examId", async (req, res) => {
    try {
      const examId = Number(req.params.examId);
      const centreCode = req.query.centreCode as string | undefined;
      let data;
      if (centreCode) {
        data = await storage.listCandidatesByCentre(centreCode, examId);
      } else {
        data = await storage.listCandidates(examId);
      }
      const mapped = data.map((c: any) => ({
        id: c.id,
        exam_id: c.examId,
        roll_no: c.rollNo,
        name: c.name,
        father_name: c.fatherName,
        dob: c.dob,
        slot: c.slot,
        centre_code: c.centreCode,
        centre_name: c.centreName,
        photo_url: c.photoUrl,
        attendance_status: c.presentMark === "Present" ? "present" : "absent",
        verification_status: c.status === "Verified" ? "verified" : "pending",
        face_match_percent: c.matchPercent ? parseFloat(c.matchPercent) : null,
        omr_number: c.omrNo,
        verified_photo: c.capturedPhotoUrl
      }));
      res.json(mapped);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.patch("/api/apk/candidates/:id/attendance", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { attendanceStatus } = req.body;
      const candidate = await storage.updateCandidate(id, {
        presentMark: attendanceStatus === "present" ? "Present" : "Absent",
      });
      if (!candidate) return res.status(404).json({ success: false, message: "Candidate not found" });
      res.json({ success: true, message: "Attendance marked" });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  app.patch("/api/apk/candidates/:id/verify", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const { verifiedPhoto, faceMatchPercent, omrNumber } = req.body;
      const candidate = await storage.updateCandidate(id, {
        status: "Verified",
        capturedPhotoUrl: verifiedPhoto || null,
        matchPercent: faceMatchPercent ? String(faceMatchPercent) : null,
        omrNo: omrNumber || null,
        verifiedAt: new Date().toISOString(),
        fingerprintVerified: true
      });
      if (!candidate) return res.status(404).json({ success: false, message: "Candidate not found" });
      res.json({ success: true, message: "Verification submitted" });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  app.post("/api/apk/verification/heartbeat", async (req, res) => {
    try {
      const { operatorId, deviceId, centreCode, examId } = req.body;
      if (operatorId) {
        const [op] = await db.select().from(operators).where(eq(operators.id, Number(operatorId)));
        if (op && op.forceLogout) {
          return res.json({ success: true, forceLogout: true, message: "Force logout triggered by HQ" });
        }
        await db.update(operators).set({ lastActive: new Date().toISOString() }).where(eq(operators.id, Number(operatorId)));
      }
      res.json({ success: true, forceLogout: false, message: "Heartbeat received" });
    } catch (e: any) {
      res.json({ success: true, forceLogout: false, message: "Heartbeat received" });
    }
  });

  app.post("/api/apk/verification/sync", async (req, res) => {
    try {
      const { verifications } = req.body;
      if (!verifications || !Array.isArray(verifications)) {
        return res.status(400).json({ success: false, message: "verifications array required" });
      }
      let synced = 0;
      for (const v of verifications) {
        try {
          await storage.updateCandidate(v.candidateId, {
            status: "Verified",
            capturedPhotoUrl: v.verifiedPhoto || null,
            matchPercent: v.faceMatchPercent ? String(v.faceMatchPercent) : null,
            omrNo: v.omrNumber || null,
            verifiedAt: new Date().toISOString(),
            fingerprintVerified: true
          });
          synced++;
        } catch (_) {}
      }
      res.json({ success: true, synced, total: verifications.length });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  app.post("/api/apk/operator/register", async (req, res) => {
    try {
      const { name, phone, aadhaar, selfie, deviceId } = req.body;
      if (!name || !phone || !aadhaar) {
        return res.status(400).json({ success: false, message: "Name, phone and Aadhaar are required" });
      }
      if (!selfie) {
        return res.status(400).json({ success: false, message: "Selfie is required" });
      }
      const existing = await db.select().from(operators).where(eq(operators.aadhaar, aadhaar));
      if (existing.length > 0) {
        const op = existing[0];
        if (op.sessionActive && !op.forceLogout) {
          return res.json({
            success: true,
            operator: { id: op.id, name: op.name, phone: op.phone, aadhaar: op.aadhaar, centreCode: op.centreCode, examId: op.examId, examName: op.examName },
            message: "Operator already registered",
            alreadyRegistered: true
          });
        }
        await db.update(operators).set({
          name, phone, selfieUrl: selfie, deviceId,
          sessionActive: true, forceLogout: false,
          lastActive: new Date().toISOString(), registeredAt: new Date().toISOString()
        }).where(eq(operators.id, op.id));
        return res.json({
          success: true,
          operator: { id: op.id, name, phone, aadhaar, centreCode: op.centreCode, examId: op.examId, examName: op.examName },
          message: "Operator re-registered",
          alreadyRegistered: true
        });
      }
      const [newOp] = await db.insert(operators).values({
        name, phone, aadhaar, selfieUrl: selfie, deviceId,
        status: "Active", sessionActive: true, forceLogout: false,
        registeredAt: new Date().toISOString(), lastActive: new Date().toISOString()
      }).returning();
      res.json({
        success: true,
        operator: { id: newOp.id, name: newOp.name, phone: newOp.phone, aadhaar: newOp.aadhaar, centreCode: newOp.centreCode || null, examId: newOp.examId || null, examName: newOp.examName || null },
        message: "Operator registered successfully",
        alreadyRegistered: false
      });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  app.post("/api/apk/operator/select-centre", async (req, res) => {
    try {
      const { operatorId, examId, centreCode, password } = req.body;
      if (!operatorId || !examId || !centreCode) {
        return res.status(400).json({ success: false, message: "operatorId, examId and centreCode required" });
      }
      const centres = await storage.listCenters();
      const centre = centres.find((c: any) => c.code === centreCode);
      const exams = await storage.listExams();
      const exam = exams.find((e: any) => e.id === Number(examId));
      if (exam?.apkPassword && exam.apkPassword.trim() !== "") {
        if (!password || password !== exam.apkPassword) {
          return res.status(403).json({ success: false, message: "Invalid exam password", requiresPassword: true });
        }
      }
      await db.update(operators).set({
        centreCode, examId: Number(examId),
        examName: exam?.name || null,
        centerName: centre?.name || centreCode,
        centerId: centre?.id || null,
        lastActive: new Date().toISOString()
      }).where(eq(operators.id, Number(operatorId)));
      let candidates: any[] = [];
      try {
        candidates = await storage.listCandidatesByCentre(centreCode, Number(examId));
      } catch (_) {
        candidates = await storage.listCandidates(Number(examId));
      }
      const mapped = candidates.map((c: any) => ({
        id: c.id, exam_id: c.examId, roll_no: c.rollNo, name: c.name,
        father_name: c.fatherName, dob: c.dob, slot: c.slot,
        centre_code: c.centreCode, centre_name: c.centreName,
        photo_url: c.photoUrl,
        attendance_status: c.presentMark === "Present" ? "present" : "absent",
        verification_status: c.status === "Verified" ? "verified" : "pending",
        face_match_percent: c.matchPercent ? parseFloat(c.matchPercent) : null,
        omr_number: c.omrNo, verified_photo: c.capturedPhotoUrl
      }));
      res.json({
        success: true,
        centreName: centre?.name || centreCode,
        candidateCount: mapped.length,
        candidates: mapped,
        message: `Locked to centre ${centreCode} with ${mapped.length} candidates`
      });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  app.post("/api/apk/operator/check-session", async (req, res) => {
    try {
      const { operatorId } = req.body;
      if (!operatorId) return res.status(400).json({ success: false });
      const [op] = await db.select().from(operators).where(eq(operators.id, Number(operatorId)));
      if (!op) return res.json({ success: false, message: "Operator not found" });
      if (op.forceLogout) {
        return res.json({ success: true, sessionActive: false, forceLogout: true, message: "Session terminated by HQ" });
      }
      return res.json({ success: true, sessionActive: op.sessionActive !== false, forceLogout: false });
    } catch (e: any) {
      res.json({ success: true, sessionActive: true, forceLogout: false });
    }
  });

  app.post("/api/apk/operator/force-logout", async (req, res) => {
    try {
      const { operatorId } = req.body;
      if (!operatorId) return res.status(400).json({ success: false, message: "operatorId required" });
      await db.update(operators).set({ forceLogout: true, sessionActive: false }).where(eq(operators.id, Number(operatorId)));
      res.json({ success: true, message: "Force logout triggered" });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  app.post("/api/apk/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ success: false, message: "Username and password required" });
      }
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
      }
      res.json({
        success: true,
        user: { id: user.id, username: user.username, fullName: user.displayName || user.username, role: user.role },
        message: "Login successful"
      });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });

  app.get("/api/apk/centres/:examId", async (req, res) => {
    try {
      const examId = Number(req.params.examId);
      const examCentres = await storage.listCenters(examId);
      if (examCentres.length > 0) {
        const centreList = examCentres.map((c: any) => ({ id: c.id, code: c.code, name: c.name }));
        return res.json(centreList);
      }
      const allCentres = await storage.listCenters();
      res.json(allCentres.map((c: any) => ({ id: c.id, code: c.code, name: c.name })));
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.get("/api/operators/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const [op] = await db.select().from(operators).where(eq(operators.id, id));
      if (!op) return res.status(404).json({ message: "Operator not found" });
      res.json(op);
    } catch (e: any) {
      res.status(500).json({ message: e.message });
    }
  });

  app.delete("/api/operators/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      await db.delete(operators).where(eq(operators.id, id));
      res.json({ success: true, message: "Operator deleted" });
    } catch (e: any) {
      res.status(500).json({ success: false, message: e.message });
    }
  });
}
