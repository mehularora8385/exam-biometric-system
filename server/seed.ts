import { storage } from "./storage";
import { db } from "./db";
import { users } from "@shared/schema";
import { sql } from "drizzle-orm";

export async function seedDatabase() {
  const [existingUsers] = await db.select({ count: sql<number>`count(*)` }).from(users);
  if (Number(existingUsers.count) > 0) return;

  console.log("Seeding database with initial data...");

  await storage.createUser({ username: "demo", password: "demo", role: "admin", displayName: "Admin User" });
  await storage.createUser({ username: "upsc_client", password: "upsc@123", role: "client", displayName: "UPSC Client" });

  const exam1 = await storage.createExam({
    name: "UPSC Civil Services 2024", code: "UPSC-CS-2024", client: "Union Public Service Commission",
    status: "Active", candidatesCount: 15420, verifiedCount: 12350,
    apkPassword: "UPSC2024X", clientLoginId: "upsc_client", clientLoginPass: "upsc@123",
    biometricMode: "face", flowType: "linear", attendanceMode: "biometric", omrMode: "auto",
    faceLiveness: true, irisEnabled: false, retryLimit: 3,
  });

  const exam2 = await storage.createExam({
    name: "SSC CGL 2024", code: "SSC-CGL-2024", client: "Staff Selection Commission",
    status: "Active", candidatesCount: 28500, verifiedCount: 18200,
    apkPassword: "SSC2024Y", clientLoginId: "ssc_client", clientLoginPass: "ssc@123",
    biometricMode: "face", flowType: "linear", attendanceMode: "biometric", omrMode: "auto",
    faceLiveness: true, irisEnabled: false, retryLimit: 3,
  });

  const exam3 = await storage.createExam({
    name: "RRB NTPC 2024", code: "RRB-NTPC-2024", client: "Railway Recruitment Board",
    status: "Draft", candidatesCount: 0, verifiedCount: 0,
  });

  const exam4 = await storage.createExam({
    name: "IBPS PO 2023", code: "IBPS-PO-2023", client: "Institute of Banking Personnel Selection",
    status: "Active", candidatesCount: 12000, verifiedCount: 11500,
    apkPassword: "IBPS2023Z", clientLoginId: "ibps_client", clientLoginPass: "ibps@123",
  });

  const c1 = await storage.createCenter({ code: "DEL001", name: "Delhi Public School", examId: exam1.id, examName: "UPSC Civil Services 2024", city: "New Delhi", state: "Delhi", address: "Mathura Road", capacity: 500 });
  const c2 = await storage.createCenter({ code: "DEL002", name: "Kendriya Vidyalaya", examId: exam1.id, examName: "UPSC Civil Services 2024", city: "New Delhi", state: "Delhi", address: "RK Puram", capacity: 450 });
  const c3 = await storage.createCenter({ code: "MUM001", name: "St. Xaviers College", examId: exam1.id, examName: "UPSC Civil Services 2024", city: "Mumbai", state: "Maharashtra", address: "Fort", capacity: 600 });
  const c4 = await storage.createCenter({ code: "MUM002", name: "IIT Bombay", examId: exam2.id, examName: "SSC CGL 2024", city: "Mumbai", state: "Maharashtra", address: "Powai", capacity: 800 });
  const c5 = await storage.createCenter({ code: "BLR001", name: "Christ University", examId: exam2.id, examName: "SSC CGL 2024", city: "Bangalore", state: "Karnataka", address: "Hosur Road", capacity: 550 });
  const c6 = await storage.createCenter({ code: "BLR002", name: "RV College", examId: exam2.id, examName: "SSC CGL 2024", city: "Bangalore", state: "Karnataka", address: "Mysore Road", capacity: 400 });

  const o1 = await storage.createOperator({ name: "Rajesh Kumar", phone: "9876543210", email: "rajesh@example.com", centerId: c1.id, centerName: "Delhi Public School", device: "Samsung Tab A7", lastActive: "25/01/2024, 04:00 pm", status: "Active" });
  const o2 = await storage.createOperator({ name: "Priya Sharma", phone: "9876543211", email: "priya@example.com", centerId: c1.id, centerName: "Delhi Public School", device: "Lenovo Tab M10", lastActive: "25/01/2024, 03:55 pm", status: "Active" });
  const o3 = await storage.createOperator({ name: "Amit Patel", phone: "9876543212", email: "amit@example.com", centerId: c2.id, centerName: "Kendriya Vidyalaya", device: "Samsung Tab A7", lastActive: "25/01/2024, 03:50 pm", status: "Active" });
  const o4 = await storage.createOperator({ name: "Sunita Verma", phone: "9876543213", email: "sunita@example.com", centerId: c3.id, centerName: "St. Xaviers College", device: "Not bound", lastActive: "Never", status: "Inactive" });
  const o5 = await storage.createOperator({ name: "Vikram Singh", phone: "9876543214", email: "vikram@example.com", centerId: c4.id, centerName: "IIT Bombay", device: "iPad 9th Gen", lastActive: "25/01/2024, 03:45 pm", status: "Active" });

  await storage.createCandidate({ omrNo: "OMR001234", rollNo: "UPSC2024001", name: "Arun Kumar", fatherName: "Suresh Kumar", dob: "1995-05-15", centreCode: "DEL001", centreName: "Delhi Public School", slot: "Morning Slot", matchPercent: "98.5", status: "Verified", verifiedAt: "25/01/2024, 03:00 pm", examId: exam1.id, photoUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop", capturedPhotoUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop", fingerprintVerified: true, presentMark: "Present" });
  await storage.createCandidate({ omrNo: "OMR001235", rollNo: "UPSC2024002", name: "Priya Patel", fatherName: "Ramesh Patel", dob: "1996-08-22", centreCode: "DEL001", centreName: "Delhi Public School", slot: "Morning Slot", matchPercent: "95.2", status: "Verified", verifiedAt: "25/01/2024, 03:15 pm", examId: exam1.id, photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", capturedPhotoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop", fingerprintVerified: true, presentMark: "Present" });
  await storage.createCandidate({ omrNo: "OMR001236", rollNo: "UPSC2024003", name: "Rohit Sharma", fatherName: "Dinesh Sharma", dob: "1994-03-10", centreCode: "DEL002", centreName: "Kendriya Vidyalaya", slot: "Afternoon Slot", matchPercent: "72.0", status: "Pending", examId: exam1.id, photoUrl: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop", capturedPhotoUrl: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop", fingerprintVerified: true, presentMark: "Present" });
  await storage.createCandidate({ omrNo: "OMR001237", rollNo: "UPSC2024004", name: "Anita Singh", fatherName: "Vijay Singh", dob: "1997-11-28", centreCode: "MUM001", centreName: "St. Xaviers College", slot: "Morning Slot", matchPercent: "45.0", status: "Rejected", examId: exam1.id, photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop", capturedPhotoUrl: null, fingerprintVerified: false, presentMark: "Present" });
  await storage.createCandidate({ omrNo: "OMR001238", rollNo: "UPSC2024005", name: "Deepak Verma", fatherName: "Manoj Verma", dob: "1995-07-05", centreCode: "MUM001", centreName: "St. Xaviers College", slot: "Morning Slot", status: "Pending", examId: exam1.id, photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop", capturedPhotoUrl: null, fingerprintVerified: false, presentMark: "Absent" });
  await storage.createCandidate({ omrNo: "OMR001239", rollNo: "UPSC2024006", name: "Neha Gupta", fatherName: "Rakesh Gupta", dob: "1998-02-14", centreCode: "DEL001", centreName: "Delhi Public School", slot: "Morning Slot", matchPercent: "88.3", status: "Verified", verifiedAt: "25/01/2024, 03:30 pm", examId: exam1.id, photoUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop", capturedPhotoUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop", fingerprintVerified: true, presentMark: "Present" });
  await storage.createCandidate({ omrNo: "OMR001240", rollNo: "UPSC2024007", name: "Karan Malhotra", fatherName: "Ashok Malhotra", dob: "1993-09-30", centreCode: "DEL002", centreName: "Kendriya Vidyalaya", slot: "Afternoon Slot", matchPercent: null, status: "Absent", examId: exam1.id, photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop", capturedPhotoUrl: null, fingerprintVerified: false, presentMark: "Absent" });

  await storage.createDepartment({ name: "Testing", description: "Testing & QA Department", status: "Active" });
  await storage.createDepartment({ name: "Education", description: "Education Management", status: "Active" });

  await storage.createDesignation({ name: "Manager", departmentId: 1, status: "Active" });
  await storage.createDesignation({ name: "Operator", departmentId: 1, status: "Active" });

  await storage.createSlot({ name: "Morning Slot", examId: exam1.id, date: "24-02-2025", startTime: "09:00", endTime: "12:00", status: "Active" });
  await storage.createSlot({ name: "Afternoon Slot", examId: exam1.id, date: "24-02-2025", startTime: "14:00", endTime: "17:00", status: "Active" });

  await storage.createCenterOperatorMap({ centerId: c1.id, centerName: "Delhi Public School", operatorId: o1.id, operatorName: "Rajesh Kumar", examId: exam1.id });
  await storage.createCenterOperatorMap({ centerId: c1.id, centerName: "Delhi Public School", operatorId: o2.id, operatorName: "Priya Sharma", examId: exam1.id });

  await storage.createDevice({ macAddress: "AA:BB:CC:DD:EE:01", imei: "123456789012345", operatorId: o1.id, operatorName: "Rajesh Kumar", model: "Samsung Tab A7", status: "Active" });
  await storage.createDevice({ macAddress: "AA:BB:CC:DD:EE:02", imei: "123456789012346", operatorId: o2.id, operatorName: "Priya Sharma", model: "Lenovo Tab M10", status: "Active" });

  await storage.createApkBuild({ version: "2.1.0", description: "Added face liveness detection, Improved fingerprint scanner compatibility, Bug fixes", date: "20/01/2024", status: "Ready", examId: exam1.id });
  await storage.createApkBuild({ version: "2.0.5", description: "Fixed offline sync issues, Performance improvements", date: "10/01/2024", status: "Ready", examId: exam1.id });
  await storage.createApkBuild({ version: "2.0.0", description: "Major UI redesign, Added MDM support, New biometric modes", date: "15/12/2023", status: "Ready", examId: exam1.id });

  await storage.createAuditLog({ timestamp: "25/01/2024, 04:00 pm", action: "Verified", operatorId: "OP001", operatorName: "Rajesh Kumar", centreCode: "DEL001", candidateId: "UPSC2024001", deviceId: "DEV001", mode: "Online", details: "Face match 98.5%" });
  await storage.createAuditLog({ timestamp: "25/01/2024, 03:55 pm", action: "Login", operatorId: "OP002", operatorName: "Priya Sharma", centreCode: "DEL001", deviceId: "DEV002", mode: "Online", details: "Device authenticated" });
  await storage.createAuditLog({ timestamp: "25/01/2024, 03:50 pm", action: "Sync", operatorId: "OP003", operatorName: "Amit Patel", centreCode: "DEL002", deviceId: "DEV003", mode: "Online", details: "Data synchronized" });
  await storage.createAuditLog({ timestamp: "25/01/2024, 03:45 pm", action: "Verified", operatorId: "OP002", operatorName: "Priya Sharma", centreCode: "DEL001", candidateId: "UPSC2024002", deviceId: "DEV002", mode: "Online", details: "Face match 95.2%" });
  await storage.createAuditLog({ timestamp: "25/01/2024, 03:30 pm", action: "Liveness Failed", operatorId: "OP003", operatorName: "Amit Patel", centreCode: "DEL002", candidateId: "UPSC2024003", deviceId: "DEV003", mode: "Offline", details: "Liveness check failed - retry needed" });
  await storage.createAuditLog({ timestamp: "25/01/2024, 03:15 pm", action: "Verified", operatorId: "OP005", operatorName: "Vikram Singh", centreCode: "MUM002", candidateId: "SSC2024001", deviceId: "DEV005", mode: "Online", details: "Face match 97.8%" });

  await storage.createAlert({ type: "Invalid Photo", severity: "High", candidateId: "UPSC2024004", centreCode: "MUM001", description: "Uploaded photo does not match registered photo. Face match score below threshold (45%)", confidence: 0.92, timestamp: "25/01/2024, 03:20 pm", status: "Open" });
  await storage.createAlert({ type: "Operator Misuse", severity: "Critical", operatorId: "OP003", centreCode: "DEL002", description: "Operator approved candidate with match score below 60% threshold", confidence: 0.88, timestamp: "25/01/2024, 03:10 pm", status: "Open" });
  await storage.createAlert({ type: "Spoof Attempt", severity: "Critical", candidateId: "SSC2024005", centreCode: "BLR001", description: "Print attack detected during face liveness verification", confidence: 0.95, timestamp: "25/01/2024, 02:45 pm", status: "Open" });
  await storage.createAlert({ type: "Geofence Violation", severity: "Medium", operatorId: "OP004", centreCode: "MUM001", description: "Device detected outside designated center boundary", confidence: 0.78, timestamp: "25/01/2024, 02:30 pm", status: "Resolved" });
  await storage.createAlert({ type: "Mock Location", severity: "High", candidateId: "UPSC2024003", centreCode: "DEL002", description: "GPS spoofing detected on operator device", confidence: 0.91, timestamp: "25/01/2024, 02:15 pm", status: "Open" });

  console.log("Database seeded successfully!");
}
