import { applications, cv, APPLICATION_STATUSES } from "@shared/schema";
import type {
  Application,
  InsertApplication,
  Cv,
  InsertCv,
  Stats,
  ApplicationStatus,
} from "@shared/schema";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, desc, sql } from "drizzle-orm";
import { mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

// Configurable data location for Docker / self-hosted deployments.
// DATA_DIR sets the directory (default: project root). DATABASE_FILE overrides the full path.
const dataDir = process.env.DATA_DIR || ".";
const dbPath = process.env.DATABASE_FILE || join(dataDir, "data.db");
mkdirSync(dirname(dbPath), { recursive: true });

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");

// Auto-create tables (simple migration for self-hosted use)
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    location TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Applied',
    applied_date TEXT NOT NULL,
    salary TEXT NOT NULL DEFAULT '',
    source TEXT NOT NULL DEFAULT '',
    job_url TEXT NOT NULL DEFAULT '',
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
  );
  CREATE TABLE IF NOT EXISTS cv (
    id INTEGER PRIMARY KEY,
    full_name TEXT NOT NULL DEFAULT '',
    headline TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    location TEXT NOT NULL DEFAULT '',
    summary TEXT NOT NULL DEFAULT '',
    skills TEXT NOT NULL DEFAULT '[]',
    experience TEXT NOT NULL DEFAULT '',
    education TEXT NOT NULL DEFAULT '',
    links TEXT NOT NULL DEFAULT '[]',
    updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
  );
`);

export const db = drizzle(sqlite);

export interface IStorage {
  listApplications(): Promise<Application[]>;
  getApplication(id: number): Promise<Application | undefined>;
  createApplication(data: InsertApplication): Promise<Application>;
  updateApplication(
    id: number,
    data: Partial<InsertApplication>
  ): Promise<Application | undefined>;
  deleteApplication(id: number): Promise<boolean>;
  getStats(): Promise<Stats>;
  getCv(): Promise<Cv>;
  upsertCv(data: InsertCv): Promise<Cv>;
}

const EMPTY_CV: Omit<Cv, "id" | "updated_at"> = {
  full_name: "",
  headline: "",
  email: "",
  phone: "",
  location: "",
  summary: "",
  skills: "[]",
  experience: "",
  education: "",
  links: "[]",
};

export class DatabaseStorage implements IStorage {
  async listApplications(): Promise<Application[]> {
    return db
      .select()
      .from(applications)
      .orderBy(desc(applications.applied_date), desc(applications.id))
      .all();
  }

  async getApplication(id: number): Promise<Application | undefined> {
    return db.select().from(applications).where(eq(applications.id, id)).get();
  }

  async createApplication(data: InsertApplication): Promise<Application> {
    return db.insert(applications).values(data).returning().get();
  }

  async updateApplication(
    id: number,
    data: Partial<InsertApplication>
  ): Promise<Application | undefined> {
    if (Object.keys(data).length === 0) {
      return this.getApplication(id);
    }
    return db
      .update(applications)
      .set(data)
      .where(eq(applications.id, id))
      .returning()
      .get();
  }

  async deleteApplication(id: number): Promise<boolean> {
    const result = db
      .delete(applications)
      .where(eq(applications.id, id))
      .run();
    return result.changes > 0;
  }

  async getStats(): Promise<Stats> {
    const rows = await this.listApplications();
    const now = new Date();
    const dayMs = 24 * 60 * 60 * 1000;
    const startOfDay = (d: Date) =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const today = startOfDay(now);

    let last7 = 0;
    let last30 = 0;
    const statusBreakdown: Record<ApplicationStatus, number> = {
      Applied: 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0,
      Accepted: 0,
      Withdrawn: 0,
    };
    const companyCounts: Record<string, number> = {};

    for (const r of rows) {
      const s = r.status as ApplicationStatus;
      if (statusBreakdown[s] !== undefined) statusBreakdown[s] += 1;
      companyCounts[r.company] = (companyCounts[r.company] || 0) + 1;
      const d = new Date(r.applied_date);
      if (!isNaN(d.getTime())) {
        const diff = today.getTime() - startOfDay(d).getTime();
        if (diff <= 7 * dayMs && diff >= 0) last7 += 1;
        if (diff <= 30 * dayMs && diff >= 0) last30 += 1;
      }
    }

    // Funnel: cumulative-style counts representing stages reached
    // Applied = all submitted (everyone applied)
    // Interview = those who progressed to interview or beyond
    // Offer = those who got an offer or accepted
    // Accepted = accepted
    // Rejected = rejected
    const advancedFromInterview =
      statusBreakdown.Interview +
      statusBreakdown.Offer +
      statusBreakdown.Accepted;
    const reachedOffer = statusBreakdown.Offer + statusBreakdown.Accepted;
    const funnel = {
      applied: rows.length,
      interview: advancedFromInterview,
      offer: reachedOffer,
      accepted: statusBreakdown.Accepted,
      rejected: statusBreakdown.Rejected,
    };

    // Timeline last 90 days
    const timeline: { date: string; count: number }[] = [];
    const tlMap: Record<string, number> = {};
    for (const r of rows) {
      const d = new Date(r.applied_date);
      if (isNaN(d.getTime())) continue;
      const diff = today.getTime() - startOfDay(d).getTime();
      if (diff < 0 || diff > 90 * dayMs) continue;
      const key = startOfDay(d).toISOString().slice(0, 10);
      tlMap[key] = (tlMap[key] || 0) + 1;
    }
    for (let i = 89; i >= 0; i--) {
      const d = new Date(today.getTime() - i * dayMs);
      const key = d.toISOString().slice(0, 10);
      timeline.push({ date: key, count: tlMap[key] || 0 });
    }

    const topCompanies = Object.entries(companyCounts)
      .map(([company, count]) => ({ company, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      total: rows.length,
      last7Days: last7,
      last30Days: last30,
      statusBreakdown,
      funnel,
      timeline,
      topCompanies,
    };
  }

  async getCv(): Promise<Cv> {
    const existing = db.select().from(cv).where(eq(cv.id, 1)).get();
    if (existing) return existing;
    // seed empty singleton
    return db
      .insert(cv)
      .values({ id: 1, ...EMPTY_CV })
      .returning()
      .get();
  }

  async upsertCv(data: InsertCv): Promise<Cv> {
    const existing = db.select().from(cv).where(eq(cv.id, 1)).get();
    const payload = {
      ...data,
      updated_at: new Date().toISOString(),
    };
    if (existing) {
      return db
        .update(cv)
        .set(payload)
        .where(eq(cv.id, 1))
        .returning()
        .get();
    }
    return db
      .insert(cv)
      .values({ id: 1, ...payload })
      .returning()
      .get();
  }
}

export const storage = new DatabaseStorage();
