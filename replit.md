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
- `client/src/pages/admin-panel.tsx` - Main admin panel with tab navigation
- `client/src/pages/login.tsx` - Login page

## Database Tables
users, exams, centers, operators, candidates, departments, designations, slots, center_operator_maps, devices, apk_builds, audit_logs, alerts, global_tech_settings

## API Endpoints (all prefixed /api)
- POST /auth/login
- CRUD: /exams, /centers, /operators, /candidates
- CRUD: /departments, /designations, /slots
- /center-operator-maps, /devices
- /apk-builds, /audit-logs, /alerts
- /global-tech-settings/:examId
- GET /dashboard/stats

## Login Credentials
- Admin: demo / demo
- Client: upsc_client / upsc@123

## Admin Panel Tabs
Dashboard, Exam Management, Upload Candidates, Centre Management, Operators Management, Candidates Management, Generate APK, Exception Monitor, Fraud Analytics, Biometric Integrity, Global Tech (Beta), plus Master Management pages (Department, Designation, Slot, Center-Operator Map, Device Mapping, OMR Setup, Upload Instructions)

## Global Tech (Beta)
Optional advanced surveillance features (all OFF by default):
- Kinesics/Micro-expressions analysis
- UHF RFID tracking
- Voice Biometrics
