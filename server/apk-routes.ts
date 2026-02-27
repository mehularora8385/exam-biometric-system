import type { Express } from "express";
import { storage } from "./storage";

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

  app.post("/api/apk/verification/heartbeat", async (_req, res) => {
    res.json({ success: true, message: "Heartbeat received" });
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
}
