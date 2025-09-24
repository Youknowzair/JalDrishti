var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  hamlets: () => hamlets,
  hamletsRelations: () => hamletsRelations,
  insertHamletSchema: () => insertHamletSchema,
  insertPredictionSchema: () => insertPredictionSchema,
  insertProblemReportSchema: () => insertProblemReportSchema,
  insertTaskSchema: () => insertTaskSchema,
  insertUserSchema: () => insertUserSchema,
  insertWaterAssetSchema: () => insertWaterAssetSchema,
  insertWaterQualityTestSchema: () => insertWaterQualityTestSchema,
  predictions: () => predictions,
  predictionsRelations: () => predictionsRelations,
  problemReports: () => problemReports,
  problemReportsRelations: () => problemReportsRelations,
  sessions: () => sessions,
  tasks: () => tasks,
  tasksRelations: () => tasksRelations,
  users: () => users,
  usersRelations: () => usersRelations,
  waterAssets: () => waterAssets,
  waterAssetsRelations: () => waterAssetsRelations,
  waterQualityTests: () => waterQualityTests,
  waterQualityTestsRelations: () => waterQualityTestsRelations
});
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
  integer,
  boolean
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("community"),
  // community, agent, admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var hamlets = pgTable("hamlets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  nameHindi: varchar("name_hindi"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
  population: integer("population"),
  riskLevel: varchar("risk_level").default("low"),
  // low, medium, high
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var waterAssets = pgTable("water_assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hamletId: varchar("hamlet_id").references(() => hamlets.id).notNull(),
  type: varchar("type").notNull(),
  // handpump, well, borewell, tank
  name: varchar("name").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
  status: varchar("status").default("functional"),
  // functional, non-functional, needs-maintenance
  condition: varchar("condition").default("good"),
  // good, fair, poor
  lastInspection: timestamp("last_inspection"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var problemReports = pgTable("problem_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  hamletId: varchar("hamlet_id").references(() => hamlets.id),
  waterAssetId: varchar("water_asset_id").references(() => waterAssets.id),
  type: varchar("type").notNull(),
  // handpump-broken, water-quality, water-shortage, pipe-leakage, other
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  photoUrl: varchar("photo_url"),
  status: varchar("status").default("pending"),
  // pending, in-progress, resolved
  priority: varchar("priority").default("medium"),
  // low, medium, high
  assignedTo: varchar("assigned_to").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var waterQualityTests = pgTable("water_quality_tests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  waterAssetId: varchar("water_asset_id").references(() => waterAssets.id).notNull(),
  testedBy: varchar("tested_by").references(() => users.id).notNull(),
  phLevel: decimal("ph_level", { precision: 3, scale: 1 }),
  tdsLevel: integer("tds_level"),
  // in mg/L
  contaminationLevel: varchar("contamination_level"),
  // safe, moderate, high
  turbidity: decimal("turbidity", { precision: 5, scale: 2 }),
  chlorineLevel: decimal("chlorine_level", { precision: 4, scale: 2 }),
  photoUrl: varchar("photo_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});
var predictions = pgTable("predictions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hamletId: varchar("hamlet_id").references(() => hamlets.id).notNull(),
  type: varchar("type").notNull(),
  // water-shortage, contamination, equipment-failure
  prediction: text("prediction").notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull(),
  // 0-100%
  alertLevel: varchar("alert_level").notNull(),
  // low, medium, high, critical
  predictedDate: timestamp("predicted_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});
var tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  assignedTo: varchar("assigned_to").references(() => users.id).notNull(),
  hamletId: varchar("hamlet_id").references(() => hamlets.id),
  waterAssetId: varchar("water_asset_id").references(() => waterAssets.id),
  type: varchar("type").notNull(),
  // inspection, maintenance, testing, survey
  title: varchar("title").notNull(),
  description: text("description"),
  priority: varchar("priority").default("medium"),
  // low, medium, high
  status: varchar("status").default("pending"),
  // pending, in-progress, completed
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var usersRelations = relations(users, ({ many }) => ({
  problemReports: many(problemReports),
  waterQualityTests: many(waterQualityTests),
  assignedTasks: many(tasks)
}));
var hamletsRelations = relations(hamlets, ({ many }) => ({
  waterAssets: many(waterAssets),
  problemReports: many(problemReports),
  predictions: many(predictions),
  tasks: many(tasks)
}));
var waterAssetsRelations = relations(waterAssets, ({ one, many }) => ({
  hamlet: one(hamlets, {
    fields: [waterAssets.hamletId],
    references: [hamlets.id]
  }),
  problemReports: many(problemReports),
  waterQualityTests: many(waterQualityTests),
  tasks: many(tasks)
}));
var problemReportsRelations = relations(problemReports, ({ one }) => ({
  user: one(users, {
    fields: [problemReports.userId],
    references: [users.id]
  }),
  hamlet: one(hamlets, {
    fields: [problemReports.hamletId],
    references: [hamlets.id]
  }),
  waterAsset: one(waterAssets, {
    fields: [problemReports.waterAssetId],
    references: [waterAssets.id]
  }),
  assignee: one(users, {
    fields: [problemReports.assignedTo],
    references: [users.id]
  })
}));
var waterQualityTestsRelations = relations(waterQualityTests, ({ one }) => ({
  waterAsset: one(waterAssets, {
    fields: [waterQualityTests.waterAssetId],
    references: [waterAssets.id]
  }),
  tester: one(users, {
    fields: [waterQualityTests.testedBy],
    references: [users.id]
  })
}));
var predictionsRelations = relations(predictions, ({ one }) => ({
  hamlet: one(hamlets, {
    fields: [predictions.hamletId],
    references: [hamlets.id]
  })
}));
var tasksRelations = relations(tasks, ({ one }) => ({
  assignee: one(users, {
    fields: [tasks.assignedTo],
    references: [users.id]
  }),
  hamlet: one(hamlets, {
    fields: [tasks.hamletId],
    references: [hamlets.id]
  }),
  waterAsset: one(waterAssets, {
    fields: [tasks.waterAssetId],
    references: [waterAssets.id]
  })
}));
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertHamletSchema = createInsertSchema(hamlets).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertWaterAssetSchema = createInsertSchema(waterAssets).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertProblemReportSchema = createInsertSchema(problemReports).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertWaterQualityTestSchema = createInsertSchema(waterQualityTests).omit({
  id: true,
  createdAt: true
});
var insertPredictionSchema = createInsertSchema(predictions).omit({
  id: true,
  createdAt: true
});
var insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, desc, or, count } from "drizzle-orm";
var DatabaseStorage = class {
  // User operations (required for Replit Auth)
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  // Hamlet operations
  async getHamlets() {
    return await db.select().from(hamlets).orderBy(hamlets.name);
  }
  async getHamlet(id) {
    const [hamlet] = await db.select().from(hamlets).where(eq(hamlets.id, id));
    return hamlet;
  }
  async createHamlet(hamlet) {
    const [newHamlet] = await db.insert(hamlets).values(hamlet).returning();
    return newHamlet;
  }
  // Water Asset operations
  async getWaterAssets() {
    return await db.select().from(waterAssets).orderBy(waterAssets.name);
  }
  async getWaterAssetsByHamlet(hamletId) {
    return await db.select().from(waterAssets).where(eq(waterAssets.hamletId, hamletId)).orderBy(waterAssets.name);
  }
  async getWaterAsset(id) {
    const [asset] = await db.select().from(waterAssets).where(eq(waterAssets.id, id));
    return asset;
  }
  async createWaterAsset(asset) {
    const [newAsset] = await db.insert(waterAssets).values(asset).returning();
    return newAsset;
  }
  async updateWaterAsset(id, updates) {
    const [updatedAsset] = await db.update(waterAssets).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(waterAssets.id, id)).returning();
    return updatedAsset;
  }
  // Problem Report operations
  async getProblemReports() {
    return await db.select().from(problemReports).orderBy(desc(problemReports.createdAt));
  }
  async getProblemReportsByUser(userId) {
    return await db.select().from(problemReports).where(eq(problemReports.userId, userId)).orderBy(desc(problemReports.createdAt));
  }
  async getProblemReport(id) {
    const [report] = await db.select().from(problemReports).where(eq(problemReports.id, id));
    return report;
  }
  async createProblemReport(report) {
    const [newReport] = await db.insert(problemReports).values(report).returning();
    return newReport;
  }
  async updateProblemReport(id, updates) {
    const [updatedReport] = await db.update(problemReports).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(problemReports.id, id)).returning();
    return updatedReport;
  }
  // Water Quality Test operations
  async getWaterQualityTests() {
    return await db.select().from(waterQualityTests).orderBy(desc(waterQualityTests.createdAt));
  }
  async getWaterQualityTestsByAsset(assetId) {
    return await db.select().from(waterQualityTests).where(eq(waterQualityTests.waterAssetId, assetId)).orderBy(desc(waterQualityTests.createdAt));
  }
  async createWaterQualityTest(test) {
    const [newTest] = await db.insert(waterQualityTests).values(test).returning();
    return newTest;
  }
  // Prediction operations
  async getPredictions() {
    return await db.select().from(predictions).orderBy(desc(predictions.createdAt));
  }
  async getActivePredictions() {
    return await db.select().from(predictions).where(eq(predictions.isActive, true)).orderBy(desc(predictions.confidence));
  }
  async createPrediction(prediction) {
    const [newPrediction] = await db.insert(predictions).values(prediction).returning();
    return newPrediction;
  }
  // Task operations
  async getTasks() {
    return await db.select().from(tasks).orderBy(desc(tasks.createdAt));
  }
  async getTasksByUser(userId) {
    return await db.select().from(tasks).where(eq(tasks.assignedTo, userId)).orderBy(tasks.dueDate);
  }
  async createTask(task) {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }
  async updateTask(id, updates) {
    const [updatedTask] = await db.update(tasks).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(tasks.id, id)).returning();
    return updatedTask;
  }
  // Analytics
  async getDashboardStats() {
    const [hamletsCount] = await db.select({ count: count() }).from(hamlets);
    const [assetsCount] = await db.select({ count: count() }).from(waterAssets);
    const [pendingReportsCount] = await db.select({ count: count() }).from(problemReports).where(or(eq(problemReports.status, "pending"), eq(problemReports.status, "in-progress")));
    const [predictionsCount] = await db.select({ count: count() }).from(predictions).where(eq(predictions.isActive, true));
    return {
      totalHamlets: hamletsCount.count,
      totalWaterAssets: assetsCount.count,
      pendingReports: pendingReportsCount.count,
      activePredictions: predictionsCount.count
    };
  }
};
var storage = new DatabaseStorage();

// server/replitAuth.ts
import * as client from "openid-client";
import { Strategy } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}
var getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID
    );
  },
  { maxAge: 3600 * 1e3 }
);
function updateUserSession(user, tokens) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}
var isAuthenticated = async (req, res, next) => {
  const user = req.user;
  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const now = Math.floor(Date.now() / 1e3);
  if (now <= user.expires_at) {
    return next();
  }
  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/auth/user", async (req, res) => {
    try {
      res.json(null);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.get("/api/dashboard/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });
  app2.get("/api/hamlets", isAuthenticated, async (req, res) => {
    try {
      const hamlets2 = await storage.getHamlets();
      res.json(hamlets2);
    } catch (error) {
      console.error("Error fetching hamlets:", error);
      res.status(500).json({ message: "Failed to fetch hamlets" });
    }
  });
  app2.post("/api/hamlets", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      const hamletData = insertHamletSchema.parse(req.body);
      const hamlet = await storage.createHamlet(hamletData);
      res.status(201).json(hamlet);
    } catch (error) {
      console.error("Error creating hamlet:", error);
      res.status(400).json({ message: error.message || "Failed to create hamlet" });
    }
  });
  app2.get("/api/water-assets", isAuthenticated, async (req, res) => {
    try {
      const { hamletId } = req.query;
      const assets = hamletId ? await storage.getWaterAssetsByHamlet(hamletId) : await storage.getWaterAssets();
      res.json(assets);
    } catch (error) {
      console.error("Error fetching water assets:", error);
      res.status(500).json({ message: "Failed to fetch water assets" });
    }
  });
  app2.post("/api/water-assets", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || !["admin", "agent"].includes(user.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      const assetData = insertWaterAssetSchema.parse(req.body);
      const asset = await storage.createWaterAsset(assetData);
      res.status(201).json(asset);
    } catch (error) {
      console.error("Error creating water asset:", error);
      res.status(400).json({ message: error.message || "Failed to create water asset" });
    }
  });
  app2.patch("/api/water-assets/:id", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || !["admin", "agent"].includes(user.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      const { id } = req.params;
      const updates = req.body;
      const asset = await storage.updateWaterAsset(id, updates);
      res.json(asset);
    } catch (error) {
      console.error("Error updating water asset:", error);
      res.status(400).json({ message: error.message || "Failed to update water asset" });
    }
  });
  app2.get("/api/problem-reports", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const reports = user.role === "admin" ? await storage.getProblemReports() : await storage.getProblemReportsByUser(user.id);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching problem reports:", error);
      res.status(500).json({ message: "Failed to fetch problem reports" });
    }
  });
  app2.post("/api/problem-reports", isAuthenticated, async (req, res) => {
    try {
      const reportData = {
        ...insertProblemReportSchema.parse(req.body),
        userId: req.user.claims.sub
      };
      const report = await storage.createProblemReport(reportData);
      res.status(201).json(report);
    } catch (error) {
      console.error("Error creating problem report:", error);
      res.status(400).json({ message: error.message || "Failed to create problem report" });
    }
  });
  app2.patch("/api/problem-reports/:id", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || !["admin", "agent"].includes(user.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      const { id } = req.params;
      const updates = req.body;
      const report = await storage.updateProblemReport(id, updates);
      res.json(report);
    } catch (error) {
      console.error("Error updating problem report:", error);
      res.status(400).json({ message: error.message || "Failed to update problem report" });
    }
  });
  app2.get("/api/water-quality-tests", isAuthenticated, async (req, res) => {
    try {
      const { assetId } = req.query;
      const tests = assetId ? await storage.getWaterQualityTestsByAsset(assetId) : await storage.getWaterQualityTests();
      res.json(tests);
    } catch (error) {
      console.error("Error fetching water quality tests:", error);
      res.status(500).json({ message: "Failed to fetch water quality tests" });
    }
  });
  app2.post("/api/water-quality-tests", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || !["admin", "agent"].includes(user.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      const testData = {
        ...insertWaterQualityTestSchema.parse(req.body),
        testedBy: req.user.claims.sub
      };
      const test = await storage.createWaterQualityTest(testData);
      res.status(201).json(test);
    } catch (error) {
      console.error("Error creating water quality test:", error);
      res.status(400).json({ message: error.message || "Failed to create water quality test" });
    }
  });
  app2.get("/api/predictions", isAuthenticated, async (req, res) => {
    try {
      const { active } = req.query;
      const predictions2 = active === "true" ? await storage.getActivePredictions() : await storage.getPredictions();
      res.json(predictions2);
    } catch (error) {
      console.error("Error fetching predictions:", error);
      res.status(500).json({ message: "Failed to fetch predictions" });
    }
  });
  app2.post("/api/predictions", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      const predictionData = insertPredictionSchema.parse(req.body);
      const prediction = await storage.createPrediction(predictionData);
      res.status(201).json(prediction);
    } catch (error) {
      console.error("Error creating prediction:", error);
      res.status(400).json({ message: error.message || "Failed to create prediction" });
    }
  });
  app2.get("/api/tasks", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const tasks2 = user.role === "admin" ? await storage.getTasks() : await storage.getTasksByUser(user.id);
      res.json(tasks2);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });
  app2.post("/api/tasks", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(400).json({ message: error.message || "Failed to create task" });
    }
  });
  app2.patch("/api/tasks/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const task = await storage.updateTask(id, updates);
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(400).json({ message: error.message || "Failed to update task" });
    }
  });
  app2.get("/demo", (req, res) => {
    res.sendFile("demo.html", { root: "client/public" });
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
var vite_config_default = defineConfig({
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "client", "dist"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "80", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
