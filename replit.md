# MPA Verification System

## Overview
Multi-Point Authentication (MPA) Verification System with admin panel for managing examination processes. Features biometric verification, candidate management, center operations, APK generation, and optional advanced surveillance technologies.

## Architecture
- **Frontend**: React + Vite + TypeScript + Tailwind CSS + Shadcn UI
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **State Management**: TanStack React Query for server state, React Context for local state
- **Routing**: Wouter

## Key Files
- `shared/schema.ts` - Drizzle ORM database schema (14 tables)
- `server/routes.ts` - REST API routes (50+ endpoints)
- `server/storage.ts` - Database storage layer with Drizzle queries
- `server/seed.ts` - Initial data seeding (runs on first startup)
- `server/db.ts` - Database connection via pg Pool
- `client/src/lib/api.ts` - Frontend API client helper
- `client/src/lib/store.tsx` - App context provider (operator state)
- `client/src/pages/client-dashboard.tsx` - Client-wise exam-wise dashboard (view-only)
- `client/src/pages/admin-panel.tsx` - Main admin panel with tab navigation
- `client/src/pages/login.tsx` - Login page

## Database Tables
users, exams, centers, operators, candidates, departments, designations, slots, center_operator_maps, devices, apk_builds, audit_logs, alerts, global_tech_settings

## API Endpoints (all prefixed /api)
- POST /auth/login
- CRUD: /exams, /centers, /operators, /candidates
- CRUD: /departments, /designations, /slots
- /center-operator-maps, /devices
- /apk-builds, /apk-builds/batch (multi-exam build), /apk-builds/:id/config, /apk-builds/:id/download
- /audit-logs, /alerts
- /global-tech-settings/:examId
- GET /dashboard/stats
- POST /candidates/upload (Excel/CSV with photo URLs)
- GET /candidates/template (download CSV template)
- GET /candidates/by-centre/:centreCode (centre-filtered download)
- GET /sync/:examId (data sync for Android APK - candidates, centers, slots)
- POST /verification/submit (biometric verification results from APK - face+fingerprint+OMR)
- POST /verification/heartbeat (device heartbeat with scanner status)
- GET /biometric/sdk-config?scanner=MFS100|MFS110 (full SDK config for Face AI + Fingerprint)
- POST /biometric/face-match (AI face matching: TensorFlow Lite + FaceNet-512d, liveness, anti-spoof)
- POST /biometric/fingerprint-capture (Mantra MFS100/MFS110 fingerprint: NFIQ 2.0, minutiae matching)
- GET /biometric/scanner-status?model=MFS100|MFS110 (scanner hardware status, RD Service, calibration)

## Login Credentials
- Admin: demo / demo
- Client: upsc_client / upsc@123

## Admin Panel Tabs
Dashboard, Exam Management, Upload Candidates, Centre Management, Operators Management, Candidates Management, Generate APK, Exception Monitor, Fraud Analytics, Biometric Integrity, Global Tech (Beta), plus Master Management pages (Department, Designation, Slot, Center-Operator Map, Device Mapping, OMR Setup, Upload Instructions)

## Functional Features
All pages have working:
- Search/filter inputs connected to state
- Dropdown filters (Exam, Centre, Status, Slot) fetching from API
- CRUD operations (Create, Edit, Delete) via API mutations
- Create Exam modal with 3-step wizard (Basic Info, Time Slots, Settings) - all fields functional
- Slot Master: create, edit, delete slots with proper schema mapping
- Center-Operator Map: create/delete mappings, filter by exam/center
- Operator Management: edit modal, activate/deactivate, unbind device
- Candidate filters: exam, centre, slot, status with clear filters
- Upload Candidates: Excel/CSV upload with template (Centre Code, Centre Name, exam Name, Roll No, Name, Father Name, DOB, Slot, Photo urL) - photo URLs in same file, no separate photo upload
- APK Generation: Multi-exam batch build, biometric config (Face+Fingerprint MFS100/MFS110, OMR camera capture), feature toggles, device compatibility (Tablet+Mobile Android 8.0+), config download
- Verification API: Submit face match %, fingerprint match, OMR number from Android APK
- Data Sync API: Centre-filtered candidate download for operators
- Client Dashboard: Client-wise exam-wise view-only dashboard with 3 tabs (Dashboard, Operators, Students)
  - Auto-detects client's exam via clientLoginId (no exam dropdown - shows only assigned exam)
  - Dashboard tab: Stats cards, centre-wise bar chart, donut chart, circular progress, centre table
  - Operators tab: Operator list with search + centre name filter, status counts, all view-only
  - Students tab: Full candidate table with search + centre filter + status filter, showing:
    - Uploaded photo + real-time captured photo (side by side)
    - OMR No, Roll No, Face Match %, Fingerprint scan status (Done/Pending)
    - Present mark (Present/Absent), Verification status, Verified timestamp
  - "VIEW ONLY" badge shown in header, no edit/delete/create actions
  - API: /api/client/exams, /api/client/dashboard, /api/client/operators, /api/client/candidates
  - Candidate schema: fingerprintVerified, presentMark, capturedPhotoUrl fields added
  - Login: upsc_client / upsc@123

## Biometric AI & SDK Stack
### Face Match AI Engine
- Engine: TensorFlow Lite + FaceNet-512d (v2.4.0, 512-dim embeddings)
- Preprocessor: MTCNN for face detection/alignment
- Liveness Detection: MediaPipe FaceMesh v0.8.11 (blink detection, head turn, depth estimation)
- Anti-Spoofing: Print attack, screen replay, 3D mask detection (anti_spoof_v3.tflite model)
- Capture: Front camera 1280x720, auto-focus, lighting check (min 100 lux)
- Match Threshold: Configurable (60-95%), default ≥75% verified, 50-75% suspicious, <50% rejected
- FAR/FRR Tuning: FAR 0.01% (configurable 0.001-1.0%), FRR 1.0% (configurable 0.1-5.0%), EER 0.15%
- Camera: Front cam 720p (operator login selfie), Back cam 1080p (candidate face verification + OMR)

### Fingerprint SDK (MFS100/MFS110)
- SDK: Mantra RD Service v2.0 (MFS100) / v2.1 (MFS110)
- Hardware: Optical 500 DPI sensor, USB OTG, FBI PIV IQS + STQC certified
- MFS100: 16mm x 18mm scan area, ~800ms capture, USB 2.0
- MFS110: 16mm x 22mm scan area, ~600ms capture, UIDAI RD Service certified
- Matching: Minutiae-based ISO 19795-1, template format ISO/IEC 19794-2
- Quality: NFIQ 2.0 scoring, min score ≥ 3 required, auto-retry on low quality
- RD Service: dpId MANTRA.AND.001, PID v2.0, Intent: in.gov.uidai.rdservice.fp.CAPTURE

### Retry & Fallback Flow
- Face retries: configurable (default 3), auto lighting adjustment, capture new photo on retry
- Fingerprint retries: configurable (default 3), sensor clean prompt, alternate finger on fail
- Overall limit: configurable (default 10), fallback sequence: retry → alternate biometric → supervisor override
- Supervisor Override: requires 6-digit PIN + reason selection + selfie, max 5 overrides per session, fully audit logged

### MDM Mode (Mobile Device Management)
- When enabled: Device enters full lockdown — blocks Home, Back, Recent buttons, notification bar, settings, other apps, USB debugging, WiFi toggle, airplane mode, screenshot/screen recording, app install/uninstall
- Allows: Camera (face/OMR), volume control, USB OTG (fingerprint scanner), charging, background data sync, power button (returns to APK on unlock)
- Exit methods: (1) Admin password — 3 taps on MPA logo → enter APK admin password → Exit MDM, (2) Remote exit from HQ Device Management, (3) Auto-exit on exam completion + operator password, (4) Emergency hard reset (Power+Vol Down 15s)
- Kiosk Mode (lighter alternative): Uses Android screen pinning (startLockTask), blocks Home/Back/Recent but doesn't block USB debug, screenshot, app install
- MDM recommended for high-security exams (UPSC, SSC, Bank); Kiosk for standard/quick setup

### Offline Encrypted Template Storage
- Encryption: AES-256-GCM, PBKDF2-HMAC-SHA256 key derivation (100K iterations)
- Device Binding: IMEI + Android ID + Hardware Serial + MAC Address, SHA-256 binding hash
- Security: Root detection, tamper detection, debug mode blocked, auto-wipe after 72hr or on tamper
- Data at Rest: All candidate photos, fingerprint templates, audit logs, sync queue encrypted

## Global Tech (Beta)
Optional advanced surveillance features (all OFF by default):
- Kinesics/Micro-expressions analysis
- UHF RFID tracking
- Voice Biometrics
