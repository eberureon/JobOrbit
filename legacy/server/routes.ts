import type { Express, Request, Response } from "express";
import { createServer } from "node:http";
import type { Server } from "node:http";
import { storage } from "./storage";
import { insertApplicationSchema, insertCvSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Lightweight healthcheck for Docker / orchestrators
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  app.get("/api/applications", async (_req: Request, res: Response) => {
    const items = await storage.listApplications();
    res.json(items);
  });

  app.get("/api/applications/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });
    const item = await storage.getApplication(id);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  });

  app.post("/api/applications", async (req: Request, res: Response) => {
    const parsed = insertApplicationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: fromZodError(parsed.error).message });
    }
    const item = await storage.createApplication(parsed.data);
    res.status(201).json(item);
  });

  app.patch("/api/applications/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });
    const parsed = insertApplicationSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: fromZodError(parsed.error).message });
    }
    const item = await storage.updateApplication(id, parsed.data);
    if (!item) return res.status(404).json({ error: "Not found" });
    res.json(item);
  });

  app.delete("/api/applications/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Invalid id" });
    const ok = await storage.deleteApplication(id);
    if (!ok) return res.status(404).json({ error: "Not found" });
    res.status(204).end();
  });

  app.get("/api/stats", async (_req: Request, res: Response) => {
    const stats = await storage.getStats();
    res.json(stats);
  });

  app.get("/api/cv", async (_req: Request, res: Response) => {
    const cv = await storage.getCv();
    res.json(cv);
  });

  app.put("/api/cv", async (req: Request, res: Response) => {
    const parsed = insertCvSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: fromZodError(parsed.error).message });
    }
    const cv = await storage.upsertCv(parsed.data);
    res.json(cv);
  });

  return httpServer;
}
