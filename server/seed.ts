import { storage } from "./storage";
import { db } from "./db";
import { users, exams, centers, operators, candidates, departments, designations, slots, centerOperatorMaps, devices, apkBuilds, auditLogs, alerts, globalTechSettings } from "@shared/schema";
import { sql } from "drizzle-orm";

const indianFirstNames = [
  "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Reyansh", "Sai", "Arnav", "Dhruv", "Kabir",
  "Ananya", "Diya", "Prisha", "Myra", "Sara", "Aadhya", "Ira", "Aanya", "Navya", "Riya",
  "Rohan", "Ishaan", "Kartik", "Yash", "Tanmay", "Harsh", "Pranav", "Shaurya", "Dev", "Karan",
  "Pooja", "Sneha", "Kavya", "Meera", "Nisha", "Tanya", "Shruti", "Ritika", "Simran", "Bhavna",
  "Rahul", "Amit", "Suresh", "Rajesh", "Mohit", "Vikas", "Nikhil", "Gaurav", "Manish", "Deepak",
  "Neha", "Priya", "Swati", "Anjali", "Divya", "Payal", "Jyoti", "Archana", "Sunita", "Rekha",
  "Akash", "Rohit", "Vikram", "Ajay", "Sanjay", "Pankaj", "Manoj", "Ravi", "Arun", "Sunil",
  "Madhuri", "Lata", "Geeta", "Seema", "Asha", "Mamta", "Komal", "Reena", "Vandana", "Sapna",
  "Aryan", "Krish", "Om", "Rudra", "Laksh", "Parth", "Ved", "Atharv", "Kiaan", "Shiv",
  "Aisha", "Zara", "Kiara", "Mahi", "Pihu", "Avni", "Saanvi", "Trisha", "Nidhi", "Radhika"
];

const indianLastNames = [
  "Sharma", "Verma", "Gupta", "Singh", "Kumar", "Patel", "Joshi", "Mishra", "Chauhan", "Yadav",
  "Reddy", "Nair", "Pillai", "Iyer", "Menon", "Das", "Bose", "Sen", "Mukherjee", "Banerjee",
  "Thakur", "Rathore", "Rajput", "Saxena", "Srivastava", "Tiwari", "Pandey", "Dubey", "Trivedi", "Chopra",
  "Malhotra", "Kapoor", "Arora", "Mehra", "Bhatt", "Shah", "Desai", "Patil", "Jain", "Agarwal"
];

const fatherFirstNames = [
  "Ramesh", "Suresh", "Mahesh", "Dinesh", "Rajesh", "Mukesh", "Naresh", "Ganesh", "Ashok", "Vinod",
  "Mohan", "Sohan", "Kishan", "Ratan", "Bharat", "Vijay", "Sanjay", "Ajay", "Pramod", "Anil",
  "Baldev", "Harish", "Jagdish", "Kamal", "Lalit", "Narayan", "Om Prakash", "Prem", "Ram", "Shyam"
];

function randomFrom<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randomDob(): string {
  const y = 1990 + Math.floor(Math.random() * 8);
  const m = String(1 + Math.floor(Math.random() * 12)).padStart(2, "0");
  const d = String(1 + Math.floor(Math.random() * 28)).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function randomPhone(): string { return "9" + String(Math.floor(Math.random() * 900000000) + 100000000); }

export async function seedDatabase() {
  const [existingUsers] = await db.select({ count: sql<number>`count(*)` }).from(users);
  if (Number(existingUsers.count) > 0) return;

  console.log("Seeding database with complete exam data (100 candidates, 5 centres, 2 slots)...");

  await storage.createUser({ username: "Mehul_7300", password: "Mehul@7300", role: "admin", displayName: "Mehul Admin" });
  await storage.createUser({ username: "nta_client", password: "nta@2024", role: "client", displayName: "NTA Client" });

  const exam = await storage.createExam({
    name: "NTA UGC-NET June 2024", code: "NTA-UGCNET-2024", client: "National Testing Agency",
    status: "Active", candidatesCount: 100, verifiedCount: 0,
    apkPassword: "NTA2024@secure", clientLoginId: "nta_client", clientLoginPass: "nta@2024",
    biometricMode: "face_fingerprint", flowType: "linear", attendanceMode: "biometric", omrMode: "camera",
    faceLiveness: true, irisEnabled: false, retryLimit: 3,
  });

  const centreData = [
    { code: "DEL-NTA-01", name: "Jawaharlal Nehru Stadium Hall-A", city: "New Delhi", state: "Delhi", address: "Lodhi Road, New Delhi - 110003", capacity: 25 },
    { code: "MUM-NTA-01", name: "Bombay Exhibition Centre", city: "Mumbai", state: "Maharashtra", address: "Goregaon East, Mumbai - 400063", capacity: 25 },
    { code: "BLR-NTA-01", name: "Bangalore International Exhibition Centre", city: "Bangalore", state: "Karnataka", address: "Tumkur Road, Bangalore - 560073", capacity: 25 },
    { code: "KOL-NTA-01", name: "Science City Auditorium", city: "Kolkata", state: "West Bengal", address: "JBS Haldane Avenue, Kolkata - 700046", capacity: 25 },
    { code: "CHN-NTA-01", name: "Chennai Trade Centre", city: "Chennai", state: "Tamil Nadu", address: "Nandambakkam, Chennai - 600089", capacity: 25 },
  ];
  const createdCentres: any[] = [];
  for (const c of centreData) {
    const centre = await storage.createCenter({ ...c, examId: exam.id, examName: exam.name });
    createdCentres.push(centre);
  }

  const slot1 = await storage.createSlot({ name: "Slot 1 - Morning", examId: exam.id, date: "15-06-2024", startTime: "09:00", endTime: "12:00", status: "Active" });
  const slot2 = await storage.createSlot({ name: "Slot 2 - Afternoon", examId: exam.id, date: "15-06-2024", startTime: "14:00", endTime: "17:00", status: "Active" });
  const slotNames = ["Slot 1 - Morning", "Slot 2 - Afternoon"];

  const operatorData = [
    { name: "Rajesh Kumar Sharma", phone: randomPhone(), email: "rajesh.sharma@nta.ac.in", centreIdx: 0, device: "Samsung Galaxy Tab A7" },
    { name: "Priya Nair", phone: randomPhone(), email: "priya.nair@nta.ac.in", centreIdx: 0, device: "Samsung Galaxy Tab A8" },
    { name: "Amit Patel", phone: randomPhone(), email: "amit.patel@nta.ac.in", centreIdx: 1, device: "Lenovo Tab M10 Plus" },
    { name: "Sunita Reddy", phone: randomPhone(), email: "sunita.reddy@nta.ac.in", centreIdx: 1, device: "Samsung Galaxy Tab S6 Lite" },
    { name: "Vikram Thakur", phone: randomPhone(), email: "vikram.thakur@nta.ac.in", centreIdx: 2, device: "Realme Pad 2" },
    { name: "Kavya Menon", phone: randomPhone(), email: "kavya.menon@nta.ac.in", centreIdx: 2, device: "Samsung Galaxy Tab A7" },
    { name: "Arjun Banerjee", phone: randomPhone(), email: "arjun.banerjee@nta.ac.in", centreIdx: 3, device: "Lenovo Tab M10" },
    { name: "Meera Joshi", phone: randomPhone(), email: "meera.joshi@nta.ac.in", centreIdx: 3, device: "Samsung Galaxy Tab A8" },
    { name: "Harsh Saxena", phone: randomPhone(), email: "harsh.saxena@nta.ac.in", centreIdx: 4, device: "Realme Pad Mini" },
    { name: "Nidhi Desai", phone: randomPhone(), email: "nidhi.desai@nta.ac.in", centreIdx: 4, device: "Samsung Galaxy Tab S6 Lite" },
  ];
  const createdOperators: any[] = [];
  for (const o of operatorData) {
    const op = await storage.createOperator({
      name: o.name, phone: o.phone, email: o.email,
      centerId: createdCentres[o.centreIdx].id, centerName: createdCentres[o.centreIdx].name,
      device: o.device, lastActive: "15/06/2024, 08:45 am", status: "Active"
    });
    createdOperators.push(op);
  }

  for (const op of createdOperators) {
    const centreIdx = operatorData[createdOperators.indexOf(op)].centreIdx;
    await storage.createCenterOperatorMap({
      centerId: createdCentres[centreIdx].id, centerName: createdCentres[centreIdx].name,
      operatorId: op.id, operatorName: op.name, examId: exam.id,
    });
  }

  const photoPool = [
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop",
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
  ];

  const statusDistribution = [
    { status: "Verified", matchMin: 85, matchMax: 99, presentMark: "Present", fpVerified: true, hasCaptured: true },
    { status: "Verified", matchMin: 80, matchMax: 98, presentMark: "Present", fpVerified: true, hasCaptured: true },
    { status: "Pending", matchMin: 60, matchMax: 79, presentMark: "Present", fpVerified: true, hasCaptured: true },
    { status: "Pending", matchMin: null, matchMax: null, presentMark: "Present", fpVerified: false, hasCaptured: false },
    { status: "Absent", matchMin: null, matchMax: null, presentMark: "Absent", fpVerified: false, hasCaptured: false },
  ];

  let candidateIdx = 0;
  const syncTimes = [
    "15/06/2024, 09:05 am", "15/06/2024, 09:12 am", "15/06/2024, 09:18 am", "15/06/2024, 09:25 am",
    "15/06/2024, 09:32 am", "15/06/2024, 09:40 am", "15/06/2024, 09:48 am", "15/06/2024, 09:55 am",
    "15/06/2024, 10:02 am", "15/06/2024, 10:10 am", "15/06/2024, 10:18 am", "15/06/2024, 10:25 am",
    "15/06/2024, 10:33 am", "15/06/2024, 10:40 am", "15/06/2024, 10:48 am", "15/06/2024, 10:55 am",
    "15/06/2024, 11:05 am", "15/06/2024, 11:12 am", "15/06/2024, 11:20 am", "15/06/2024, 11:28 am",
  ];

  for (let ci = 0; ci < 5; ci++) {
    const centre = createdCentres[ci];
    for (let si = 0; si < 2; si++) {
      for (let j = 0; j < 10; j++) {
        candidateIdx++;
        const rollNo = `UGCNET2024${String(candidateIdx).padStart(4, "0")}`;
        const omrNo = `OMR${String(1000 + candidateIdx)}`;
        const firstName = indianFirstNames[(candidateIdx - 1) % indianFirstNames.length];
        const lastName = indianLastNames[Math.floor((candidateIdx - 1) / 3) % indianLastNames.length];
        const fullName = `${firstName} ${lastName}`;
        const fatherFirst = fatherFirstNames[(candidateIdx - 1) % fatherFirstNames.length];
        const fatherFull = `${fatherFirst} ${lastName}`;

        const dist = statusDistribution[candidateIdx % statusDistribution.length];
        const matchPct = dist.matchMin !== null ? String((dist.matchMin + Math.random() * (dist.matchMax - dist.matchMin)).toFixed(1)) : null;
        const photo = photoPool[candidateIdx % photoPool.length];
        const verifiedAt = dist.status === "Verified" ? syncTimes[candidateIdx % syncTimes.length] : null;

        await storage.createCandidate({
          omrNo, rollNo, name: fullName, fatherName: fatherFull,
          dob: randomDob(), centreCode: centre.code, centreName: centre.name,
          slot: slotNames[si], matchPercent: matchPct,
          status: dist.status, verifiedAt, examId: exam.id,
          photoUrl: photo,
          capturedPhotoUrl: dist.hasCaptured ? photo : null,
          fingerprintVerified: dist.fpVerified,
          presentMark: dist.presentMark,
        });
      }
    }
  }

  const deviceModels = ["Samsung Galaxy Tab A7", "Samsung Galaxy Tab A8", "Lenovo Tab M10 Plus", "Samsung Galaxy Tab S6 Lite", "Realme Pad 2", "Realme Pad Mini", "Lenovo Tab M10", "Samsung Galaxy Tab A7", "Realme Pad Mini", "Samsung Galaxy Tab S6 Lite"];
  const androidVersions = ["12", "13", "11", "12", "13", "12", "11", "13", "12", "11"];
  const batteries = [92, 85, 78, 88, 65, 71, 80, 95, 58, 74];
  const lastSyncs = [
    "15/06/2024, 10:55 am", "15/06/2024, 10:50 am", "15/06/2024, 10:48 am",
    "15/06/2024, 10:45 am", "15/06/2024, 10:40 am", "15/06/2024, 10:38 am",
    "15/06/2024, 10:35 am", "15/06/2024, 10:30 am", "15/06/2024, 10:28 am",
    "15/06/2024, 10:25 am",
  ];
  for (let i = 0; i < 10; i++) {
    const centreIdx = Math.floor(i / 2);
    await storage.createDevice({
      macAddress: `AA:BB:CC:${String(i + 1).padStart(2, "0")}:EE:FF`,
      imei: `35698${String(1000000000 + i * 111111111)}`,
      operatorId: createdOperators[i].id,
      operatorName: createdOperators[i].name,
      centerName: createdCentres[centreIdx].name,
      centreCode: createdCentres[centreIdx].code,
      examId: exam.id, examName: exam.name,
      model: deviceModels[i], androidVersion: androidVersions[i],
      batteryLevel: batteries[i], lastSyncAt: lastSyncs[i],
      mdmStatus: "Active", loginStatus: "Logged In", status: "Active",
    });
  }

  await storage.createApkBuild({
    version: "3.0.0",
    description: "NTA UGC-NET 2024 Build - Face+Fingerprint verification, OMR Camera capture, MDM Kiosk mode, Present mark tracking, Real-time sync",
    date: "10/06/2024", status: "Ready", examId: exam.id, examName: exam.name,
    platform: "Android", deviceTypes: "Tablet,Mobile", minAndroidVersion: "8.0",
    buildSize: "42.5 MB", buildProgress: 100,
    configJson: {
      biometricMode: "face_fingerprint",
      faceConfig: { engine: "FaceNet-512d", threshold: 80, liveness: true, retryLimit: 3, camera: "front_720p" },
      fingerprintConfig: { scanner: "MFS100", captureTime: "800ms", dpi: 500, sensorSize: "16x18mm", retryLimit: 3 },
      omrConfig: { enabled: true, camera: "back_1080p", autoCapture: true, flashEnabled: true },
      mdmConfig: { enabled: true, kioskMode: true, blockHome: true, blockBack: true, blockRecent: true, blockNotifications: true, blockSettings: true, blockScreenshots: true, blockUSBDebugging: true, allowCamera: true, allowWiFiChange: true, allowUSBOTG: true, adminPassword: "NTA2024@MDM" },
      presentMark: { enabled: true, autoMarkOnVerification: true },
      syncConfig: { interval: 30, mode: "realtime", offlineSupport: true, maxOfflineHours: 24 },
      securityConfig: { geoFencing: true, mockLocationDetection: true, rootDetection: true, screenRecordBlock: true },
    },
    downloadUrl: null,
  });

  const auditActions = [
    { action: "Login", details: "Operator logged in successfully" },
    { action: "Data Sync", details: "Candidate data downloaded - 20 records" },
    { action: "Face Verified", details: "Face match score: {score}%" },
    { action: "Fingerprint Verified", details: "Fingerprint matched successfully via MFS100" },
    { action: "Present Marked", details: "Candidate marked present after biometric verification" },
    { action: "OMR Captured", details: "OMR sheet captured via back camera 1080p" },
    { action: "MDM Activated", details: "Device locked in MDM Kiosk mode" },
    { action: "Sync Completed", details: "Real-time data synced to HQ - {count} records" },
    { action: "Liveness Check", details: "Face liveness passed - anti-spoof confirmed" },
    { action: "Device Bound", details: "Device bound to operator - IMEI verified" },
  ];
  const auditTimestamps = [
    "15/06/2024, 08:30 am", "15/06/2024, 08:35 am", "15/06/2024, 08:40 am",
    "15/06/2024, 08:45 am", "15/06/2024, 09:00 am", "15/06/2024, 09:05 am",
    "15/06/2024, 09:10 am", "15/06/2024, 09:15 am", "15/06/2024, 09:20 am",
    "15/06/2024, 09:25 am", "15/06/2024, 09:30 am", "15/06/2024, 09:35 am",
    "15/06/2024, 09:40 am", "15/06/2024, 09:45 am", "15/06/2024, 09:50 am",
    "15/06/2024, 09:55 am", "15/06/2024, 10:00 am", "15/06/2024, 10:05 am",
    "15/06/2024, 10:10 am", "15/06/2024, 10:15 am", "15/06/2024, 10:20 am",
    "15/06/2024, 10:25 am", "15/06/2024, 10:30 am", "15/06/2024, 10:35 am",
    "15/06/2024, 10:40 am", "15/06/2024, 10:45 am", "15/06/2024, 10:50 am",
    "15/06/2024, 10:55 am", "15/06/2024, 11:00 am", "15/06/2024, 11:05 am",
  ];
  for (let i = 0; i < 30; i++) {
    const opIdx = i % 10;
    const centreIdx = Math.floor(opIdx / 2);
    const act = auditActions[i % auditActions.length];
    const details = act.details
      .replace("{score}", String((80 + Math.random() * 19).toFixed(1)))
      .replace("{count}", String(3 + Math.floor(Math.random() * 8)));
    await storage.createAuditLog({
      timestamp: auditTimestamps[i],
      action: act.action,
      operatorId: `OP${String(opIdx + 1).padStart(3, "0")}`,
      operatorName: createdOperators[opIdx].name,
      centreCode: createdCentres[centreIdx].code,
      candidateId: act.action.includes("Verified") || act.action === "Present Marked" || act.action === "OMR Captured" ? `UGCNET2024${String(i + 1).padStart(4, "0")}` : undefined,
      deviceId: `DEV${String(opIdx + 1).padStart(3, "0")}`,
      mode: i % 4 === 3 ? "Offline" : "Online",
      details,
    });
  }

  const alertTypes = [
    { type: "Face Mismatch", severity: "High", desc: "Face match score below threshold ({score}%). Possible impersonation attempt detected." },
    { type: "Fingerprint Spoof", severity: "Critical", desc: "Synthetic fingerprint pattern detected on MFS100 scanner. Silicone/gelatin overlay suspected." },
    { type: "Mock Location", severity: "High", desc: "GPS spoofing application detected on device. Location coordinates inconsistent with centre geofence." },
    { type: "MDM Bypass Attempt", severity: "Critical", desc: "Operator attempted to exit MDM Kiosk mode without authorization. Home button press blocked." },
    { type: "Root Detection", severity: "Critical", desc: "Rooted device detected. Security policy violation - device integrity compromised." },
    { type: "Multiple Face Detected", severity: "Medium", desc: "Multiple faces detected in verification frame. Only candidate face should be visible." },
    { type: "OMR Tampering", severity: "High", desc: "OMR sheet image shows signs of digital manipulation. Metadata inconsistency detected." },
    { type: "Operator Misuse", severity: "High", desc: "Operator approved candidate with match score below 60% threshold. Manual override flagged." },
  ];
  const alertTimestamps = [
    "15/06/2024, 09:15 am", "15/06/2024, 09:28 am", "15/06/2024, 09:42 am",
    "15/06/2024, 10:05 am", "15/06/2024, 10:22 am", "15/06/2024, 10:38 am",
    "15/06/2024, 10:52 am", "15/06/2024, 11:05 am",
  ];
  for (let i = 0; i < 8; i++) {
    const a = alertTypes[i];
    const centreIdx = i % 5;
    await storage.createAlert({
      type: a.type, severity: a.severity,
      candidateId: i % 2 === 0 ? `UGCNET2024${String(i * 5 + 1).padStart(4, "0")}` : undefined,
      operatorId: i % 2 === 1 ? `OP${String((i % 10) + 1).padStart(3, "0")}` : undefined,
      centreCode: createdCentres[centreIdx].code,
      description: a.desc.replace("{score}", String((35 + Math.random() * 20).toFixed(1))),
      confidence: Number((0.78 + Math.random() * 0.2).toFixed(2)),
      timestamp: alertTimestamps[i],
      status: i < 6 ? "Open" : "Resolved",
    });
  }

  await storage.createDepartment({ name: "Examination", description: "Examination Management & Conduct", status: "Active" });
  await storage.createDepartment({ name: "Technology", description: "IT Infrastructure & Biometric Systems", status: "Active" });
  await storage.createDepartment({ name: "Operations", description: "Centre Operations & Logistics", status: "Active" });

  await storage.createDesignation({ name: "Centre Supervisor", departmentId: 1, status: "Active" });
  await storage.createDesignation({ name: "Biometric Operator", departmentId: 1, status: "Active" });
  await storage.createDesignation({ name: "IT Support", departmentId: 2, status: "Active" });
  await storage.createDesignation({ name: "System Admin", departmentId: 2, status: "Active" });

  await storage.upsertGlobalTechSettings({
    examId: exam.id,
    kinesicsEnabled: true, rfidEnabled: false, voiceBiometricsEnabled: false,
    settings: {
      aiSurveillance: true, geoFencing: true, deviceIntegrity: true,
      syncInterval: 30, offlineMode: true, encryptionLevel: "AES-256",
    },
  });

  console.log("Database seeded successfully! 1 exam, 5 centres, 10 operators, 100 candidates, 10 devices, 30 audit logs, 8 alerts.");
}
