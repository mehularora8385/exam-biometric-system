# Objective
Build complete backend for the MPA Verification System admin panel. This includes PostgreSQL database, Drizzle ORM schema, storage layer, API routes, and wiring up all frontend pages to use real API data instead of hardcoded mock data. Core entities: Exams, Centers, Operators, Candidates, APK Builds, Audit Logs, Alerts, Departments, Designations, Slots, Devices, Center-Operator Maps, and Global Tech Settings.

# Tasks

### T001: Database Setup & Schema Definition
- **Blocked By**: []
- **Details**:
  - Create PostgreSQL database using `createDatabase()` in code_execution
  - Define complete Drizzle schema in `shared/schema.ts` with all tables:
    - `users` (keep existing, add role field: ADMIN/CLIENT)
    - `exams` (id, name, code, client, status, candidatesCount, verifiedCount, apkPassword, clientLoginId, clientLoginPass, createdAt, biometricMode, flowType, attendanceMode, omrMode, faceLiveness, irisEnabled, retryLimit)
    - `centers` (id, code, name, examId, city, state, address, capacity)
    - `operators` (id, name, phone, email, centerId, device, lastActive, status)
    - `candidates` (id, omrNo, rollNo, name, fatherName, dob, centreCode, centreName, slot, matchPercent, status, verifiedAt, photoUrl, examId)
    - `departments` (id, name, description, status)
    - `designations` (id, name, departmentId, status)
    - `slots` (id, name, examId, date, startTime, endTime, status)
    - `centerOperatorMaps` (id, centerId, operatorId, examId)
    - `devices` (id, macAddress, imei, operatorId, model, status)
    - `apkBuilds` (id, version, description, examId, date, status, features JSON)
    - `auditLogs` (id, timestamp, action, operatorId, operatorName, centreCode, candidateId, deviceId, mode, details)
    - `alerts` (id, type, severity, candidateId, operatorId, centreCode, description, confidence, timestamp, status)
    - `globalTechSettings` (id, examId, kinesicsEnabled, rfidEnabled, voiceBiometricsEnabled, settings JSON)
  - Create insert schemas and types for each table
  - Push schema to database using `npm run db:push`
  - Files: `shared/schema.ts`, `drizzle.config.ts` (verify exists)
  - Acceptance: All tables created in PostgreSQL, types exported

### T002: Storage Layer Implementation
- **Blocked By**: [T001]
- **Details**:
  - Rewrite `server/storage.ts` to use Drizzle ORM with PostgreSQL
  - Implement `IStorage` interface with CRUD methods for all entities:
    - Users: getUser, getUserByUsername, createUser
    - Exams: listExams, getExam, createExam, updateExam, deleteExam
    - Centers: listCenters, getCenter, createCenter, updateCenter, deleteCenter, listCentersByExam
    - Operators: listOperators, getOperator, createOperator, updateOperator, deleteOperator
    - Candidates: listCandidates, getCandidate, createCandidate, updateCandidate, listCandidatesByExam, getCandidateStats
    - Departments: listDepartments, createDepartment, updateDepartment, deleteDepartment
    - Designations: listDesignations, createDesignation, updateDesignation, deleteDesignation
    - Slots: listSlots, createSlot, updateSlot, deleteSlot
    - CenterOperatorMaps: listMaps, createMap, deleteMap
    - Devices: listDevices, createDevice, updateDevice, deleteDevice
    - APK Builds: listBuilds, createBuild, getBuild
    - Audit Logs: listLogs, createLog
    - Alerts: listAlerts, createAlert, updateAlertStatus
    - GlobalTechSettings: getSettings, upsertSettings
    - Dashboard: getDashboardStats (aggregated counts)
  - Implement `DatabaseStorage` class using Drizzle queries
  - Seed initial data (admin user, sample exams, centers, operators, candidates)
  - Files: `server/storage.ts`, `server/db.ts` (create for drizzle instance)
  - Acceptance: All CRUD operations work against PostgreSQL

### T003: API Routes Implementation
- **Blocked By**: [T002]
- **Details**:
  - Implement all REST API routes in `server/routes.ts`:
    - POST /api/auth/login - authenticate user
    - GET/POST /api/exams - list/create exams
    - GET/PUT/DELETE /api/exams/:id - get/update/delete exam
    - GET/POST /api/centers - list/create centers
    - GET/PUT/DELETE /api/centers/:id - CRUD
    - GET/POST /api/operators - list/create operators
    - GET/PUT/DELETE /api/operators/:id - CRUD
    - GET/POST /api/candidates - list/create candidates  
    - GET/PUT /api/candidates/:id - CRUD
    - GET /api/candidates/stats - aggregated candidate stats
    - GET/POST /api/departments, /api/designations, /api/slots - master CRUD
    - GET/POST/DELETE /api/center-operator-maps
    - GET/POST /api/devices
    - GET/POST /api/apk-builds - APK build management
    - GET/POST /api/audit-logs
    - GET/POST/PUT /api/alerts
    - GET/PUT /api/global-tech-settings/:examId
    - GET /api/dashboard/stats - aggregated dashboard data
  - Validate request bodies with Zod schemas
  - Return appropriate HTTP status codes
  - Files: `server/routes.ts`
  - Acceptance: All endpoints return correct data, validation works

### T004: Frontend API Integration - Core Pages
- **Blocked By**: [T003]
- **Details**:
  - Create `client/src/lib/api.ts` with API helper functions using fetch
  - Update `client/src/pages/admin/exam.tsx` to fetch/create/update/delete exams via API
  - Update `client/src/pages/admin/center.tsx` to use API for centers CRUD
  - Update `client/src/pages/admin/operator.tsx` to use API for operators CRUD
  - Update `client/src/pages/admin/candidate.tsx` to use API for candidates
  - Update `client/src/pages/admin/dashboard.tsx` to fetch real stats from API
  - Replace all hardcoded mock data arrays with useQuery/useMutation hooks
  - Use TanStack Query for data fetching with proper loading/error states
  - Files: `client/src/lib/api.ts`, `client/src/pages/admin/exam.tsx`, `client/src/pages/admin/center.tsx`, `client/src/pages/admin/operator.tsx`, `client/src/pages/admin/candidate.tsx`, `client/src/pages/admin/dashboard.tsx`
  - Acceptance: All core pages load data from API, CRUD operations work

### T005: Frontend API Integration - Secondary Pages
- **Blocked By**: [T003]
- **Details**:
  - Update `client/src/pages/admin/apk.tsx` to use API for APK builds
  - Update `client/src/pages/admin/reports.tsx` to fetch audit logs from API
  - Update `client/src/pages/admin/fraud-analytics.tsx` to fetch alerts from API
  - Update `client/src/pages/admin/biometric-integrity.tsx` to use API for alerts/config
  - Update `client/src/pages/admin/global-surveillance.tsx` to use API for settings
  - Update master pages (department, designation, slot, center-operator-map, device-mapping) to use API
  - Update login page to use /api/auth/login
  - Files: all secondary admin page files
  - Acceptance: All pages load real data, forms submit to API

### T006: Seed Data & Login Integration
- **Blocked By**: [T002]
- **Details**:
  - Create `server/seed.ts` to populate initial data:
    - Admin user (demo/demo) and client user (upsc_client/upsc@123)
    - 4 sample exams matching current mock data
    - 6 centers, 5 operators, 5+ candidates
    - Sample audit logs, alerts, departments, designations, slots
  - Run seed on server startup if tables are empty
  - Update login page to authenticate against /api/auth/login
  - Files: `server/seed.ts`, `client/src/pages/login.tsx`
  - Acceptance: Login works with demo/demo and upsc_client/upsc@123, seed data populates
