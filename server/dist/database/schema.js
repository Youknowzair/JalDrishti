import { pgTable, serial, varchar, text, timestamp, integer, decimal, boolean, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'agent', 'community']);
export const waterAssetTypeEnum = pgEnum('water_asset_type', ['handpump', 'well', 'borewell', 'tank', 'tap', 'pipeline']);
export const assetStatusEnum = pgEnum('asset_status', ['functional', 'non-functional', 'needs-maintenance', 'under-repair']);
export const assetConditionEnum = pgEnum('asset_condition', ['excellent', 'good', 'fair', 'poor', 'critical']);
export const reportStatusEnum = pgEnum('report_status', ['pending', 'in-progress', 'resolved', 'closed']);
export const reportPriorityEnum = pgEnum('report_priority', ['low', 'medium', 'high', 'critical']);
export const waterQualityEnum = pgEnum('water_quality', ['safe', 'moderate', 'high-risk', 'unsafe']);
export const predictionStatusEnum = pgEnum('prediction_status', ['active', 'resolved', 'expired']);
// Users table
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).unique().notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    phone: varchar('phone', { length: 20 }),
    role: userRoleEnum('role').default('community').notNull(),
    profileImage: varchar('profile_image', { length: 500 }),
    isActive: boolean('is_active').default(true).notNull(),
    lastLogin: timestamp('last_login'),
    emailVerified: boolean('email_verified').default(false).notNull(),
    phoneVerified: boolean('phone_verified').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
// Hamlets/Villages table
export const hamlets = pgTable('hamlets', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 200 }).notNull(),
    nameHindi: varchar('name_hindi', { length: 200 }),
    district: varchar('district', { length: 100 }).notNull(),
    state: varchar('state', { length: 100 }).notNull(),
    pincode: varchar('pincode', { length: 10 }),
    latitude: decimal('latitude', { precision: 10, scale: 7 }).notNull(),
    longitude: decimal('longitude', { precision: 10, scale: 7 }).notNull(),
    population: integer('population'),
    households: integer('households'),
    riskLevel: varchar('risk_level', { length: 20 }).default('low'),
    waterCrisisLevel: varchar('water_crisis_level', { length: 20 }).default('low'),
    description: text('description'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
// Water Assets table
export const waterAssets = pgTable('water_assets', {
    id: serial('id').primaryKey(),
    hamletId: integer('hamlet_id').references(() => hamlets.id).notNull(),
    name: varchar('name', { length: 200 }).notNull(),
    type: waterAssetTypeEnum('type').notNull(),
    status: assetStatusEnum('status').default('functional').notNull(),
    condition: assetConditionEnum('condition').default('good').notNull(),
    latitude: decimal('latitude', { precision: 10, scale: 7 }).notNull(),
    longitude: decimal('longitude', { precision: 10, scale: 7 }).notNull(),
    capacity: decimal('capacity', { precision: 10, scale: 2 }),
    unit: varchar('unit', { length: 20 }),
    installationDate: timestamp('installation_date'),
    lastInspection: timestamp('last_inspection'),
    nextInspection: timestamp('next_inspection'),
    maintenanceHistory: jsonb('maintenance_history'),
    photos: jsonb('photos'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
// Problem Reports table
export const problemReports = pgTable('problem_reports', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    hamletId: integer('hamlet_id').references(() => hamlets.id),
    waterAssetId: integer('water_asset_id').references(() => waterAssets.id),
    title: varchar('title', { length: 200 }).notNull(),
    description: text('description').notNull(),
    type: varchar('type', { length: 100 }).notNull(),
    status: reportStatusEnum('status').default('pending').notNull(),
    priority: reportPriorityEnum('priority').default('medium').notNull(),
    latitude: decimal('latitude', { precision: 10, scale: 7 }),
    longitude: decimal('longitude', { precision: 10, scale: 7 }),
    photos: jsonb('photos'),
    assignedTo: integer('assigned_to').references(() => users.id),
    estimatedResolutionTime: integer('estimated_resolution_time'), // in hours
    actualResolutionTime: integer('actual_resolution_time'), // in hours
    resolutionNotes: text('resolution_notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    resolvedAt: timestamp('resolved_at'),
});
// Water Quality Tests table
export const waterQualityTests = pgTable('water_quality_tests', {
    id: serial('id').primaryKey(),
    waterAssetId: integer('water_asset_id').references(() => waterAssets.id).notNull(),
    testedBy: integer('tested_by').references(() => users.id).notNull(),
    testDate: timestamp('test_date').defaultNow().notNull(),
    phLevel: decimal('ph_level', { precision: 3, scale: 1 }),
    tdsLevel: integer('tds_level'), // in mg/L
    turbidity: decimal('turbidity', { precision: 5, scale: 2 }),
    chlorineLevel: decimal('chlorine_level', { precision: 4, scale: 2 }),
    nitrateLevel: decimal('nitrate_level', { precision: 4, scale: 2 }),
    fluorideLevel: decimal('fluoride_level', { precision: 4, scale: 2 }),
    arsenicLevel: decimal('arsenic_level', { precision: 4, scale: 2 }),
    ironLevel: decimal('iron_level', { precision: 4, scale: 2 }),
    contaminationLevel: waterQualityEnum('contamination_level').default('safe'),
    overallQuality: waterQualityEnum('overall_quality').default('safe'),
    photos: jsonb('photos'),
    notes: text('notes'),
    recommendations: text('recommendations'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
// AI Predictions table
export const predictions = pgTable('predictions', {
    id: serial('id').primaryKey(),
    waterAssetId: integer('water_asset_id').references(() => waterAssets.id).notNull(),
    hamletId: integer('hamlet_id').references(() => hamlets.id).notNull(),
    type: varchar('type', { length: 100 }).notNull(), // water_shortage, quality_degradation, etc.
    probability: decimal('probability', { precision: 5, scale: 2 }).notNull(), // 0-100
    severity: varchar('severity', { length: 20 }).notNull(), // low, medium, high, critical
    predictedDate: timestamp('predicted_date').notNull(),
    status: predictionStatusEnum('status').default('active').notNull(),
    confidence: decimal('confidence', { precision: 5, scale: 2 }),
    factors: jsonb('factors'), // contributing factors
    recommendations: text('recommendations'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
// Tasks table
export const tasks = pgTable('tasks', {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 200 }).notNull(),
    description: text('description').notNull(),
    assignedTo: integer('assigned_to').references(() => users.id),
    assignedBy: integer('assigned_by').references(() => users.id).notNull(),
    status: varchar('status', { length: 20 }).default('pending').notNull(),
    priority: varchar('priority', { length: 20 }).default('medium').notNull(),
    dueDate: timestamp('due_date'),
    completedAt: timestamp('completed_at'),
    relatedReportId: integer('related_report_id').references(() => problemReports.id),
    relatedAssetId: integer('related_asset_id').references(() => waterAssets.id),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
// Maintenance Records table
export const maintenanceRecords = pgTable('maintenance_records', {
    id: serial('id').primaryKey(),
    waterAssetId: integer('water_asset_id').references(() => waterAssets.id).notNull(),
    performedBy: integer('performed_by').references(() => users.id).notNull(),
    maintenanceType: varchar('maintenance_type', { length: 100 }).notNull(),
    description: text('description').notNull(),
    cost: decimal('cost', { precision: 10, scale: 2 }),
    startDate: timestamp('start_date').notNull(),
    endDate: timestamp('end_date'),
    status: varchar('status', { length: 20 }).default('in-progress').notNull(),
    photos: jsonb('photos'),
    notes: text('notes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
// Notifications table
export const notifications = pgTable('notifications', {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id).notNull(),
    title: varchar('title', { length: 200 }).notNull(),
    message: text('message').notNull(),
    type: varchar('type', { length: 50 }).notNull(), // alert, info, warning, success
    isRead: boolean('is_read').default(false).notNull(),
    relatedEntityType: varchar('related_entity_type', { length: 50 }), // report, asset, prediction
    relatedEntityId: integer('related_entity_id'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    readAt: timestamp('read_at'),
});
// Relations
export const usersRelations = relations(users, ({ many }) => ({
    problemReports: many(problemReports),
    waterQualityTests: many(waterQualityTests),
    tasks: many(tasks),
    maintenanceRecords: many(maintenanceRecords),
    notifications: many(notifications),
}));
export const hamletsRelations = relations(hamlets, ({ many }) => ({
    waterAssets: many(waterAssets),
    problemReports: many(problemReports),
    predictions: many(predictions),
}));
export const waterAssetsRelations = relations(waterAssets, ({ one, many }) => ({
    hamlet: one(hamlets, {
        fields: [waterAssets.hamletId],
        references: [hamlets.id],
    }),
    problemReports: many(problemReports),
    waterQualityTests: many(waterQualityTests),
    predictions: many(predictions),
    maintenanceRecords: many(maintenanceRecords),
}));
export const problemReportsRelations = relations(problemReports, ({ one, many }) => ({
    user: one(users, {
        fields: [problemReports.userId],
        references: [users.id],
    }),
    hamlet: one(hamlets, {
        fields: [problemReports.hamletId],
        references: [hamlets.id],
    }),
    waterAsset: one(waterAssets, {
        fields: [problemReports.waterAssetId],
        references: [waterAssets.id],
    }),
    assignedUser: one(users, {
        fields: [problemReports.assignedTo],
        references: [users.id],
    }),
    tasks: many(tasks),
}));
export const waterQualityTestsRelations = relations(waterQualityTests, ({ one }) => ({
    waterAsset: one(waterAssets, {
        fields: [waterQualityTests.waterAssetId],
        references: [waterAssets.id],
    }),
    testedBy: one(users, {
        fields: [waterQualityTests.testedBy],
        references: [users.id],
    }),
}));
export const predictionsRelations = relations(predictions, ({ one }) => ({
    waterAsset: one(waterAssets, {
        fields: [predictions.waterAssetId],
        references: [waterAssets.id],
    }),
    hamlet: one(hamlets, {
        fields: [predictions.hamletId],
        references: [hamlets.id],
    }),
}));
export const tasksRelations = relations(tasks, ({ one }) => ({
    assignedTo: one(users, {
        fields: [tasks.assignedTo],
        references: [users.id],
    }),
    assignedBy: one(users, {
        fields: [tasks.assignedBy],
        references: [users.id],
    }),
    relatedReport: one(problemReports, {
        fields: [tasks.relatedReportId],
        references: [problemReports.id],
    }),
    relatedAsset: one(waterAssets, {
        fields: [tasks.relatedAssetId],
        references: [waterAssets.id],
    }),
}));
export const maintenanceRecordsRelations = relations(maintenanceRecords, ({ one }) => ({
    waterAsset: one(waterAssets, {
        fields: [maintenanceRecords.waterAssetId],
        references: [waterAssets.id],
    }),
    performedBy: one(users, {
        fields: [maintenanceRecords.performedBy],
        references: [users.id],
    }),
}));
export const notificationsRelations = relations(notifications, ({ one }) => ({
    user: one(users, {
        fields: [notifications.userId],
        references: [users.id],
    }),
}));
//# sourceMappingURL=schema.js.map