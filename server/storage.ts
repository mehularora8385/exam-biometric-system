import { eq, sql, and, desc } from "drizzle-orm";
import { db } from "./db";
import {
  users, exams, centers, operators, candidates,
  departments, designations, slots, centerOperatorMaps,
  devices, apkBuilds, auditLogs, alerts, globalTechSettings,
  type User, type InsertUser,
  type Exam, type InsertExam,
  type Center, type InsertCenter,
  type Operator, type InsertOperator,
  type Candidate, type InsertCandidate,
  type Department, type InsertDepartment,
  type Designation, type InsertDesignation,
  type Slot, type InsertSlot,
  type CenterOperatorMap, type InsertCenterOperatorMap,
  type Device, type InsertDevice,
  type ApkBuild, type InsertApkBuild,
  type AuditLog, type InsertAuditLog,
  type Alert, type InsertAlert,
  type GlobalTechSettings, type InsertGlobalTechSettings,
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  listExams(): Promise<Exam[]>;
  getExam(id: number): Promise<Exam | undefined>;
  createExam(exam: InsertExam): Promise<Exam>;
  updateExam(id: number, exam: Partial<InsertExam>): Promise<Exam | undefined>;
  deleteExam(id: number): Promise<void>;

  listCenters(examId?: number): Promise<Center[]>;
  getCenter(id: number): Promise<Center | undefined>;
  createCenter(center: InsertCenter): Promise<Center>;
  updateCenter(id: number, center: Partial<InsertCenter>): Promise<Center | undefined>;
  deleteCenter(id: number): Promise<void>;

  listOperators(): Promise<Operator[]>;
  getOperator(id: number): Promise<Operator | undefined>;
  createOperator(operator: InsertOperator): Promise<Operator>;
  updateOperator(id: number, operator: Partial<InsertOperator>): Promise<Operator | undefined>;
  deleteOperator(id: number): Promise<void>;

  listCandidates(examId?: number): Promise<Candidate[]>;
  getCandidate(id: number): Promise<Candidate | undefined>;
  getCandidateByRollNo(rollNo: string): Promise<Candidate | undefined>;
  createCandidate(candidate: InsertCandidate): Promise<Candidate>;
  updateCandidate(id: number, candidate: Partial<InsertCandidate>): Promise<Candidate | undefined>;
  deleteCandidate(id: number): Promise<void>;
  bulkCreateCandidates(candidatesList: InsertCandidate[]): Promise<Candidate[]>;
  listCandidatesByCentre(centreCode: string, examId?: number): Promise<Candidate[]>;

  listDepartments(): Promise<Department[]>;
  createDepartment(dept: InsertDepartment): Promise<Department>;
  updateDepartment(id: number, dept: Partial<InsertDepartment>): Promise<Department | undefined>;
  deleteDepartment(id: number): Promise<void>;

  listDesignations(): Promise<Designation[]>;
  createDesignation(des: InsertDesignation): Promise<Designation>;
  updateDesignation(id: number, des: Partial<InsertDesignation>): Promise<Designation | undefined>;
  deleteDesignation(id: number): Promise<void>;

  listSlots(examId?: number): Promise<Slot[]>;
  createSlot(slot: InsertSlot): Promise<Slot>;
  updateSlot(id: number, slot: Partial<InsertSlot>): Promise<Slot | undefined>;
  deleteSlot(id: number): Promise<void>;

  listCenterOperatorMaps(): Promise<CenterOperatorMap[]>;
  createCenterOperatorMap(map: InsertCenterOperatorMap): Promise<CenterOperatorMap>;
  deleteCenterOperatorMap(id: number): Promise<void>;

  listDevices(): Promise<Device[]>;
  createDevice(device: InsertDevice): Promise<Device>;
  updateDevice(id: number, device: Partial<InsertDevice>): Promise<Device | undefined>;
  deleteDevice(id: number): Promise<void>;

  listApkBuilds(examId?: number): Promise<ApkBuild[]>;
  createApkBuild(build: InsertApkBuild): Promise<ApkBuild>;
  updateApkBuild(id: number, data: Partial<InsertApkBuild>): Promise<ApkBuild | undefined>;

  listAuditLogs(): Promise<AuditLog[]>;
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;

  listAlerts(): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlertStatus(id: number, status: string): Promise<Alert | undefined>;

  getGlobalTechSettings(examId: number): Promise<GlobalTechSettings | undefined>;
  upsertGlobalTechSettings(settings: InsertGlobalTechSettings): Promise<GlobalTechSettings>;

  getDashboardStats(): Promise<any>;
  getClientDashboardStats(examId?: number): Promise<any>;
  listOperatorsByExam(examId: number): Promise<Operator[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async listExams(): Promise<Exam[]> {
    return db.select().from(exams).orderBy(desc(exams.createdAt));
  }

  async getExam(id: number): Promise<Exam | undefined> {
    const [exam] = await db.select().from(exams).where(eq(exams.id, id));
    return exam;
  }

  async createExam(exam: InsertExam): Promise<Exam> {
    const [created] = await db.insert(exams).values(exam).returning();
    return created;
  }

  async updateExam(id: number, exam: Partial<InsertExam>): Promise<Exam | undefined> {
    const [updated] = await db.update(exams).set(exam).where(eq(exams.id, id)).returning();
    return updated;
  }

  async deleteExam(id: number): Promise<void> {
    await db.delete(exams).where(eq(exams.id, id));
  }

  async listCenters(examId?: number): Promise<Center[]> {
    if (examId) {
      return db.select().from(centers).where(eq(centers.examId, examId));
    }
    return db.select().from(centers);
  }

  async getCenter(id: number): Promise<Center | undefined> {
    const [center] = await db.select().from(centers).where(eq(centers.id, id));
    return center;
  }

  async createCenter(center: InsertCenter): Promise<Center> {
    const [created] = await db.insert(centers).values(center).returning();
    return created;
  }

  async updateCenter(id: number, center: Partial<InsertCenter>): Promise<Center | undefined> {
    const [updated] = await db.update(centers).set(center).where(eq(centers.id, id)).returning();
    return updated;
  }

  async deleteCenter(id: number): Promise<void> {
    await db.delete(centers).where(eq(centers.id, id));
  }

  async listOperators(): Promise<Operator[]> {
    return db.select().from(operators);
  }

  async getOperator(id: number): Promise<Operator | undefined> {
    const [op] = await db.select().from(operators).where(eq(operators.id, id));
    return op;
  }

  async createOperator(operator: InsertOperator): Promise<Operator> {
    const [created] = await db.insert(operators).values(operator).returning();
    return created;
  }

  async updateOperator(id: number, operator: Partial<InsertOperator>): Promise<Operator | undefined> {
    const [updated] = await db.update(operators).set(operator).where(eq(operators.id, id)).returning();
    return updated;
  }

  async deleteOperator(id: number): Promise<void> {
    await db.delete(operators).where(eq(operators.id, id));
  }

  async listCandidates(examId?: number): Promise<Candidate[]> {
    if (examId) {
      return db.select().from(candidates).where(eq(candidates.examId, examId));
    }
    return db.select().from(candidates);
  }

  

  async getCandidateByRollNo(rollNo: string): Promise<Candidate | undefined> {
    const rows = await db.select().from(candidates).where(eq(candidates.rollNo, rollNo)).limit(1);
    return rows[0];
  }async getCandidate(id: number): Promise<Candidate | undefined> {
    const [c] = await db.select().from(candidates).where(eq(candidates.id, id));
    return c;
  }

  async createCandidate(candidate: InsertCandidate): Promise<Candidate> {
    const [created] = await db.insert(candidates).values(candidate).returning();
    return created;
  }

  async updateCandidate(id: number, candidate: Partial<InsertCandidate>): Promise<Candidate | undefined> {
    const [updated] = await db.update(candidates).set(candidate).where(eq(candidates.id, id)).returning();
    return updated;
  }

  async deleteCandidate(id: number): Promise<void> {
    await db.delete(candidates).where(eq(candidates.id, id));
  }

  async bulkCreateCandidates(candidatesList: InsertCandidate[]): Promise<Candidate[]> {
    if (candidatesList.length === 0) return [];
    const batchSize = 100;
    const results: Candidate[] = [];
    for (let i = 0; i < candidatesList.length; i += batchSize) {
      const batch = candidatesList.slice(i, i + batchSize);
      const created = await db.insert(candidates).values(batch).returning();
      results.push(...created);
    }
    return results;
  }

  async listCandidatesByCentre(centreCode: string, examId?: number): Promise<Candidate[]> {
    if (examId) {
      return db.select().from(candidates).where(and(eq(candidates.centreCode, centreCode), eq(candidates.examId, examId)));
    }
    return db.select().from(candidates).where(eq(candidates.centreCode, centreCode));
  }

  async listDepartments(): Promise<Department[]> {
    return db.select().from(departments);
  }

  async createDepartment(dept: InsertDepartment): Promise<Department> {
    const [created] = await db.insert(departments).values(dept).returning();
    return created;
  }

  async updateDepartment(id: number, dept: Partial<InsertDepartment>): Promise<Department | undefined> {
    const [updated] = await db.update(departments).set(dept).where(eq(departments.id, id)).returning();
    return updated;
  }

  async deleteDepartment(id: number): Promise<void> {
    await db.delete(departments).where(eq(departments.id, id));
  }

  async listDesignations(): Promise<Designation[]> {
    return db.select().from(designations);
  }

  async createDesignation(des: InsertDesignation): Promise<Designation> {
    const [created] = await db.insert(designations).values(des).returning();
    return created;
  }

  async updateDesignation(id: number, des: Partial<InsertDesignation>): Promise<Designation | undefined> {
    const [updated] = await db.update(designations).set(des).where(eq(designations.id, id)).returning();
    return updated;
  }

  async deleteDesignation(id: number): Promise<void> {
    await db.delete(designations).where(eq(designations.id, id));
  }

  async listSlots(examId?: number): Promise<Slot[]> {
    if (examId) {
      return db.select().from(slots).where(eq(slots.examId, examId));
    }
    return db.select().from(slots);
  }

  async createSlot(slot: InsertSlot): Promise<Slot> {
    const [created] = await db.insert(slots).values(slot).returning();
    return created;
  }

  async updateSlot(id: number, slot: Partial<InsertSlot>): Promise<Slot | undefined> {
    const [updated] = await db.update(slots).set(slot).where(eq(slots.id, id)).returning();
    return updated;
  }

  async deleteSlot(id: number): Promise<void> {
    await db.delete(slots).where(eq(slots.id, id));
  }

  async listCenterOperatorMaps(): Promise<CenterOperatorMap[]> {
    return db.select().from(centerOperatorMaps);
  }

  async createCenterOperatorMap(map: InsertCenterOperatorMap): Promise<CenterOperatorMap> {
    const [created] = await db.insert(centerOperatorMaps).values(map).returning();
    return created;
  }

  async deleteCenterOperatorMap(id: number): Promise<void> {
    await db.delete(centerOperatorMaps).where(eq(centerOperatorMaps.id, id));
  }

  async listDevices(): Promise<Device[]> {
    return db.select().from(devices);
  }

  async createDevice(device: InsertDevice): Promise<Device> {
    const [created] = await db.insert(devices).values(device).returning();
    return created;
  }

  async updateDevice(id: number, device: Partial<InsertDevice>): Promise<Device | undefined> {
    const [updated] = await db.update(devices).set(device).where(eq(devices.id, id)).returning();
    return updated;
  }

  async deleteDevice(id: number): Promise<void> {
    await db.delete(devices).where(eq(devices.id, id));
  }

  async listApkBuilds(examId?: number): Promise<ApkBuild[]> {
    if (examId) {
      return db.select().from(apkBuilds).where(eq(apkBuilds.examId, examId));
    }
    return db.select().from(apkBuilds).orderBy(desc(apkBuilds.id));
  }

  async createApkBuild(build: InsertApkBuild): Promise<ApkBuild> {
    const [created] = await db.insert(apkBuilds).values(build).returning();
    return created;
  }

  async updateApkBuild(id: number, data: Partial<InsertApkBuild>): Promise<ApkBuild | undefined> {
    const [updated] = await db.update(apkBuilds).set(data).where(eq(apkBuilds.id, id)).returning();
    return updated;
  }

  async listAuditLogs(): Promise<AuditLog[]> {
    return db.select().from(auditLogs).orderBy(desc(auditLogs.id));
  }

  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const [created] = await db.insert(auditLogs).values(log).returning();
    return created;
  }

  async listAlerts(): Promise<Alert[]> {
    return db.select().from(alerts).orderBy(desc(alerts.id));
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const [created] = await db.insert(alerts).values(alert).returning();
    return created;
  }

  async updateAlertStatus(id: number, status: string): Promise<Alert | undefined> {
    const [updated] = await db.update(alerts).set({ status }).where(eq(alerts.id, id)).returning();
    return updated;
  }

  async getGlobalTechSettings(examId: number): Promise<GlobalTechSettings | undefined> {
    const [settings] = await db.select().from(globalTechSettings).where(eq(globalTechSettings.examId, examId));
    return settings;
  }

  async upsertGlobalTechSettings(settings: InsertGlobalTechSettings): Promise<GlobalTechSettings> {
    if (settings.examId) {
      const existing = await this.getGlobalTechSettings(settings.examId);
      if (existing) {
        const [updated] = await db.update(globalTechSettings).set(settings).where(eq(globalTechSettings.id, existing.id)).returning();
        return updated;
      }
    }
    const [created] = await db.insert(globalTechSettings).values(settings).returning();
    return created;
  }

  async getDashboardStats(examId?: number): Promise<any> {
    const examFilter = examId ? eq(candidates.examId, examId) : undefined;
    const centerExamFilter = examId ? eq(centers.examId, examId) : undefined;

    const [examCount] = await db.select({ count: sql<number>`count(*)` }).from(exams);
    const [centerCount] = await db.select({ count: sql<number>`count(*)` }).from(centers).where(centerExamFilter);
    const [operatorCount] = await db.select({ count: sql<number>`count(*)` }).from(operators);
    const [candidateCount] = await db.select({ count: sql<number>`count(*)` }).from(candidates).where(examFilter);
    const [verifiedCount] = await db.select({ count: sql<number>`count(*)` }).from(candidates).where(examFilter ? and(eq(candidates.status, "Verified"), examFilter) : eq(candidates.status, "Verified"));
    const [pendingCount] = await db.select({ count: sql<number>`count(*)` }).from(candidates).where(examFilter ? and(eq(candidates.status, "Pending"), examFilter) : eq(candidates.status, "Pending"));
    const [presentCount] = await db.select({ count: sql<number>`count(*)` }).from(candidates).where(examFilter ? and(eq(candidates.presentMark, "Present"), examFilter) : eq(candidates.presentMark, "Present"));
    const [absentCount] = await db.select({ count: sql<number>`count(*)` }).from(candidates).where(examFilter ? and(sql`(${candidates.presentMark} IS NULL OR ${candidates.presentMark} = 'Absent')`, examFilter) : sql`${candidates.presentMark} IS NULL OR ${candidates.presentMark} = 'Absent'`);
    const [alertCount] = await db.select({ count: sql<number>`count(*)` }).from(alerts);

    const centerList = await db.select().from(centers).where(centerExamFilter);

    let totalOps = 0;
    let activeOps = 0;
    if (examId) {
      const maps = await db.select().from(centerOperatorMaps).where(eq(centerOperatorMaps.examId, examId));
      const opIds = Array.from(new Set(maps.map(m => m.operatorId)));
      if (opIds.length > 0) {
        const ops = await db.select().from(operators).where(sql`${operators.id} IN (${sql.join(opIds.map(id => sql`${id}`), sql`, `)})`);
        totalOps = ops.length;
        activeOps = ops.filter(o => o.status === "Active").length;
      }
    } else {
      const allOps = await db.select().from(operators);
      totalOps = allOps.length;
      activeOps = allOps.filter(o => o.status === "Active").length;
    }

    const centerStatsPromises = centerList.map(async (center) => {
      const cFilter = eq(candidates.centreCode, center.code);
      const combinedFilter = examFilter ? and(cFilter, examFilter) : cFilter;
      const [total] = await db.select({ count: sql<number>`count(*)` }).from(candidates).where(combinedFilter);
      const [verified] = await db.select({ count: sql<number>`count(*)` }).from(candidates).where(combinedFilter ? and(eq(candidates.status, "Verified"), combinedFilter) : and(eq(candidates.status, "Verified"), cFilter));
      const [pending] = await db.select({ count: sql<number>`count(*)` }).from(candidates).where(combinedFilter ? and(eq(candidates.status, "Pending"), combinedFilter) : and(eq(candidates.status, "Pending"), cFilter));
      const [present] = await db.select({ count: sql<number>`count(*)` }).from(candidates).where(combinedFilter ? and(eq(candidates.presentMark, "Present"), combinedFilter) : and(eq(candidates.presentMark, "Present"), cFilter));
      const opsAtCenter = await db.select().from(operators).where(eq(operators.centerId, center.id));
      const activeOpsAtCenter = opsAtCenter.filter(o => o.status === "Active").length;

      return {
        centerId: center.id,
        code: center.code,
        name: center.name,
        city: center.city,
        capacity: center.capacity,
        total: Number(total.count),
        verified: Number(verified.count),
        pending: Number(pending.count),
        present: Number(present.count),
        operators: `${activeOpsAtCenter}/${opsAtCenter.length}`,
        progress: Number(total.count) > 0 ? Math.round((Number(verified.count) / Number(total.count)) * 100) : 0,
      };
    });

    const centerStats = await Promise.all(centerStatsPromises);

    return {
      totalCandidates: Number(candidateCount.count),
      verified: Number(verifiedCount.count),
      pending: Number(pendingCount.count),
      notVerified: Number(candidateCount.count) - Number(verifiedCount.count) - Number(pendingCount.count),
      present: Number(presentCount.count),
      absent: Number(absentCount.count),
      totalExams: Number(examCount.count),
      totalCenters: Number(centerCount.count),
      totalOperators: totalOps,
      activeOperators: activeOps,
      activeCenters: centerList.length,
      totalAlerts: Number(alertCount.count),
      centerStats,
    };
  }

  async getClientDashboardStats(examId?: number): Promise<any> {
    const examFilter = examId ? eq(candidates.examId, examId) : undefined;
    const centerFilter = examId ? eq(centers.examId, examId) : undefined;

    const [candidateCount] = await db.select({ count: sql<number>`count(*)` }).from(candidates).where(examFilter);
    const [verifiedCount] = await db.select({ count: sql<number>`count(*)` }).from(candidates).where(
      examFilter ? and(eq(candidates.status, "Verified"), examFilter) : eq(candidates.status, "Verified")
    );
    const [pendingCount] = await db.select({ count: sql<number>`count(*)` }).from(candidates).where(
      examFilter ? and(eq(candidates.status, "Pending"), examFilter) : eq(candidates.status, "Pending")
    );
    const [rejectedCount] = await db.select({ count: sql<number>`count(*)` }).from(candidates).where(
      examFilter ? and(eq(candidates.status, "Rejected"), examFilter) : eq(candidates.status, "Rejected")
    );
    const [presentCount] = await db.select({ count: sql<number>`count(*)` }).from(candidates).where(
      examFilter ? and(eq(candidates.presentMark, "Present"), examFilter) : eq(candidates.presentMark, "Present")
    );
    const [absentCount] = await db.select({ count: sql<number>`count(*)` }).from(candidates).where(
      examFilter ? and(sql`(${candidates.presentMark} IS NULL OR ${candidates.presentMark} = 'Absent')`, examFilter) : sql`${candidates.presentMark} IS NULL OR ${candidates.presentMark} = 'Absent'`
    );

    const centerList = await db.select().from(centers).where(centerFilter);

    const centerStatsPromises = centerList.map(async (center) => {
      const cFilter = eq(candidates.centreCode, center.code);
      const combinedFilter = examFilter ? and(cFilter, examFilter) : cFilter;
      const [total] = await db.select({ count: sql<number>`count(*)` }).from(candidates).where(combinedFilter);
      const [verified] = await db.select({ count: sql<number>`count(*)` }).from(candidates).where(
        combinedFilter ? and(eq(candidates.status, "Verified"), combinedFilter) : and(eq(candidates.status, "Verified"), cFilter)
      );
      const [pending] = await db.select({ count: sql<number>`count(*)` }).from(candidates).where(
        combinedFilter ? and(eq(candidates.status, "Pending"), combinedFilter) : and(eq(candidates.status, "Pending"), cFilter)
      );
      const [present] = await db.select({ count: sql<number>`count(*)` }).from(candidates).where(
        combinedFilter ? and(eq(candidates.presentMark, "Present"), combinedFilter) : and(eq(candidates.presentMark, "Present"), cFilter)
      );

      const operatorsAtCenter = await db.select().from(operators).where(eq(operators.centerId, center.id));
      const activeOps = operatorsAtCenter.filter(o => o.status === "Active").length;

      return {
        code: center.code,
        name: center.name,
        city: center.city,
        total: Number(total.count),
        verified: Number(verified.count),
        pending: Number(pending.count),
        present: Number(present.count),
        operators: `${activeOps}/${operatorsAtCenter.length}`,
        progress: Number(total.count) > 0 ? Math.round((Number(verified.count) / Number(total.count)) * 100) : 0,
      };
    });

    const centerStats = await Promise.all(centerStatsPromises);

    let operatorCount = 0;
    let activeOperatorCount = 0;
    if (examId) {
      const maps = await db.select().from(centerOperatorMaps).where(eq(centerOperatorMaps.examId, examId));
      const opIds = Array.from(new Set(maps.map(m => m.operatorId)));
      if (opIds.length > 0) {
        const ops = await db.select().from(operators).where(sql`${operators.id} IN (${sql.join(opIds.map(id => sql`${id}`), sql`, `)})`);
        operatorCount = ops.length;
        activeOperatorCount = ops.filter(o => o.status === "Active").length;
      }
    } else {
      const allOps = await db.select().from(operators);
      operatorCount = allOps.length;
      activeOperatorCount = allOps.filter(o => o.status === "Active").length;
    }

    return {
      totalCandidates: Number(candidateCount.count),
      verified: Number(verifiedCount.count),
      pending: Number(pendingCount.count),
      notVerified: Number(candidateCount.count) - Number(verifiedCount.count) - Number(pendingCount.count),
      rejected: Number(rejectedCount.count),
      present: Number(presentCount.count),
      absent: Number(absentCount.count),
      totalCenters: centerList.length,
      activeCenters: centerList.length,
      totalOperators: operatorCount,
      activeOperators: activeOperatorCount,
      centerStats,
    };
  }

  async listOperatorsByExam(examId: number): Promise<Operator[]> {
    const maps = await db.select().from(centerOperatorMaps).where(eq(centerOperatorMaps.examId, examId));
    const opIds = Array.from(new Set(maps.map(m => m.operatorId)));
    if (opIds.length === 0) {
      const centerList = await db.select().from(centers).where(eq(centers.examId, examId));
      const cIds = centerList.map(c => c.id);
      if (cIds.length === 0) return [];
      return db.select().from(operators).where(sql`${operators.centerId} IN (${sql.join(cIds.map(id => sql`${id}`), sql`, `)})`);
    }
    return db.select().from(operators).where(sql`${operators.id} IN (${sql.join(opIds.map(id => sql`${id}`), sql`, `)})`);
  }
}

export const storage = new DatabaseStorage();
