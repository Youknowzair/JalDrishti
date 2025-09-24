import { Router } from 'express';
import { db } from '../database/connection.js';
import { users, hamlets, waterAssets, problemReports, predictions, waterQualityTests, tasks } from '../database/schema.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { eq, and, gte, sql, count, desc, asc } from 'drizzle-orm';
const router = Router();
// Apply authentication to all dashboard routes
router.use(authenticateToken);
// Get dashboard statistics
router.get('/stats', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated',
                code: 'NOT_AUTHENTICATED'
            });
        }
        // Get current date and date 30 days ago
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        // Count total hamlets
        const [hamletsCount] = await db.select({ count: count() }).from(hamlets);
        // Count total water assets
        const [waterAssetsCount] = await db.select({ count: count() }).from(waterAssets);
        // Count pending problem reports
        const [pendingReportsCount] = await db.select({ count: count() })
            .from(problemReports)
            .where(eq(problemReports.status, 'pending'));
        // Count active predictions
        const [activePredictionsCount] = await db.select({ count: count() })
            .from(predictions)
            .where(eq(predictions.isActive, true));
        // Count total users by role
        const usersByRole = await db.select({
            role: users.role,
            count: count()
        })
            .from(users)
            .where(eq(users.isActive, true))
            .groupBy(users.role);
        // Count water assets by status
        const assetsByStatus = await db.select({
            status: waterAssets.status,
            count: count()
        })
            .from(waterAssets)
            .groupBy(waterAssets.status);
        // Count water assets by condition
        const assetsByCondition = await db.select({
            condition: waterAssets.condition,
            count: count()
        })
            .from(waterAssets)
            .groupBy(waterAssets.condition);
        // Recent problem reports (last 7 days)
        const recentReports = await db.select({
            id: problemReports.id,
            title: problemReports.title,
            status: problemReports.status,
            priority: problemReports.priority,
            createdAt: problemReports.createdAt
        })
            .from(problemReports)
            .where(gte(problemReports.createdAt, new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000))))
            .orderBy(desc(problemReports.createdAt))
            .limit(5);
        // Recent water quality tests (last 7 days)
        const recentQualityTests = await db.select({
            id: waterQualityTests.id,
            waterAssetId: waterQualityTests.waterAssetId,
            overallQuality: waterQualityTests.overallQuality,
            testDate: waterQualityTests.testDate
        })
            .from(waterQualityTests)
            .where(gte(waterQualityTests.testDate, new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000))))
            .orderBy(desc(waterQualityTests.testDate))
            .limit(5);
        // Tasks statistics
        const [totalTasks] = await db.select({ count: count() }).from(tasks);
        const [pendingTasks] = await db.select({ count: count() })
            .from(tasks)
            .where(eq(tasks.status, 'pending'));
        // Monthly trends (last 6 months)
        const monthlyTrends = await db.select({
            month: sql `EXTRACT(MONTH FROM ${problemReports.createdAt})`,
            year: sql `EXTRACT(YEAR FROM ${problemReports.createdAt})`,
            count: count()
        })
            .from(problemReports)
            .where(gte(problemReports.createdAt, new Date(now.getTime() - (180 * 24 * 60 * 60 * 1000))))
            .groupBy(sql `EXTRACT(MONTH FROM ${problemReports.createdAt})`, sql `EXTRACT(YEAR FROM ${problemReports.createdAt})`)
            .orderBy(asc(sql `EXTRACT(YEAR FROM ${problemReports.createdAt})`), asc(sql `EXTRACT(MONTH FROM ${problemReports.createdAt})`));
        // Risk assessment summary
        const riskSummary = await db.select({
            riskLevel: hamlets.riskLevel,
            count: count()
        })
            .from(hamlets)
            .groupBy(hamlets.riskLevel);
        const stats = {
            overview: {
                totalHamlets: hamletsCount.count,
                totalWaterAssets: waterAssetsCount.count,
                pendingReports: pendingReportsCount.count,
                activePredictions: activePredictionsCount.count,
                totalTasks: totalTasks.count,
                pendingTasks: pendingTasks.count
            },
            users: {
                byRole: usersByRole
            },
            assets: {
                byStatus: assetsByStatus,
                byCondition: assetsByCondition
            },
            recent: {
                reports: recentReports,
                qualityTests: recentQualityTests
            },
            trends: {
                monthly: monthlyTrends
            },
            risk: {
                summary: riskSummary
            }
        };
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard statistics',
            code: 'STATS_FETCH_ERROR'
        });
    }
});
// Get user-specific dashboard data
router.get('/user-stats', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated',
                code: 'NOT_AUTHENTICATED'
            });
        }
        const userId = req.user.id;
        const userRole = req.user.role;
        let userStats = {};
        // Get user's problem reports
        const [userReportsCount] = await db.select({ count: count() })
            .from(problemReports)
            .where(eq(problemReports.userId, userId));
        // Get user's assigned tasks
        const [assignedTasksCount] = await db.select({ count: count() })
            .from(tasks)
            .where(eq(tasks.assignedTo, userId));
        // Get user's pending tasks
        const [pendingTasksCount] = await db.select({ count: count() })
            .from(tasks)
            .where(and(eq(tasks.assignedTo, userId), eq(tasks.status, 'pending')));
        userStats.reports = {
            total: userReportsCount.count,
            pending: 0, // Will be calculated below
            resolved: 0 // Will be calculated below
        };
        userStats.tasks = {
            total: assignedTasksCount.count,
            pending: pendingTasksCount.count
        };
        // Get detailed report statistics for user
        const reportStats = await db.select({
            status: problemReports.status,
            count: count()
        })
            .from(problemReports)
            .where(eq(problemReports.userId, userId))
            .groupBy(problemReports.status);
        reportStats.forEach(stat => {
            if (stat.status === 'pending') {
                userStats.reports.pending = stat.count;
            }
            else if (stat.status === 'resolved') {
                userStats.reports.resolved = stat.count;
            }
        });
        // If user is admin or agent, get additional statistics
        if (userRole === 'admin' || userRole === 'agent') {
            // Get reports assigned to this user
            const [assignedReportsCount] = await db.select({ count: count() })
                .from(problemReports)
                .where(eq(problemReports.assignedTo, userId));
            // Get water quality tests performed by this user
            const [qualityTestsCount] = await db.select({ count: count() })
                .from(waterQualityTests)
                .where(eq(waterQualityTests.testedBy, userId));
            userStats.assignedReports = assignedReportsCount.count;
            userStats.qualityTests = qualityTestsCount.count;
        }
        // Get recent activity
        const recentActivity = await db.select({
            type: sql `'report'`,
            id: problemReports.id,
            title: problemReports.title,
            status: problemReports.status,
            createdAt: problemReports.createdAt
        })
            .from(problemReports)
            .where(eq(problemReports.userId, userId))
            .union(db.select({
            type: sql `'task'`,
            id: tasks.id,
            title: tasks.title,
            status: tasks.status,
            createdAt: tasks.createdAt
        })
            .from(tasks)
            .where(eq(tasks.assignedTo, userId)))
            .orderBy(desc(sql `createdAt`))
            .limit(10);
        userStats.recentActivity = recentActivity;
        res.json({
            success: true,
            data: userStats
        });
    }
    catch (error) {
        console.error('User dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user dashboard statistics',
            code: 'USER_STATS_FETCH_ERROR'
        });
    }
});
// Get admin-specific statistics (admin only)
router.get('/admin-stats', requireRole(['admin']), async (req, res) => {
    try {
        // Get system health metrics
        const [totalUsers] = await db.select({ count: count() }).from(users);
        const [activeUsers] = await db.select({ count: count() }).from(users).where(eq(users.isActive, true));
        const [verifiedUsers] = await db.select({ count: count() }).from(users).where(eq(users.emailVerified, true));
        // Get critical issues
        const criticalReports = await db.select({
            id: problemReports.id,
            title: problemReports.title,
            priority: problemReports.priority,
            status: problemReports.status,
            createdAt: problemReports.createdAt
        })
            .from(problemReports)
            .where(eq(problemReports.priority, 'critical'))
            .orderBy(desc(problemReports.createdAt))
            .limit(10);
        // Get assets needing maintenance
        const assetsNeedingMaintenance = await db.select({
            id: waterAssets.id,
            name: waterAssets.name,
            type: waterAssets.type,
            condition: waterAssets.condition,
            status: waterAssets.status
        })
            .from(waterAssets)
            .where(eq(waterAssets.status, 'needs-maintenance'))
            .limit(10);
        // Get high-risk predictions
        const highRiskPredictions = await db.select({
            id: predictions.id,
            type: predictions.type,
            probability: predictions.probability,
            severity: predictions.severity,
            predictedDate: predictions.predictedDate
        })
            .from(predictions)
            .where(and(eq(predictions.isActive, true), eq(predictions.severity, 'high')))
            .orderBy(desc(predictions.probability))
            .limit(10);
        const adminStats = {
            system: {
                totalUsers: totalUsers.count,
                activeUsers: activeUsers.count,
                verifiedUsers: verifiedUsers.count,
                verificationRate: Math.round((verifiedUsers.count / totalUsers.count) * 100)
            },
            criticalIssues: criticalReports,
            maintenanceNeeded: assetsNeedingMaintenance,
            highRiskPredictions: highRiskPredictions
        };
        res.json({
            success: true,
            data: adminStats
        });
    }
    catch (error) {
        console.error('Admin dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch admin dashboard statistics',
            code: 'ADMIN_STATS_FETCH_ERROR'
        });
    }
});
// Get agent-specific statistics (agent or admin)
router.get('/agent-stats', requireRole(['admin', 'agent']), async (req, res) => {
    try {
        const userId = req.user.id;
        // Get reports assigned to this agent
        const assignedReports = await db.select({
            id: problemReports.id,
            title: problemReports.title,
            status: problemReports.status,
            priority: problemReports.priority,
            createdAt: problemReports.createdAt
        })
            .from(problemReports)
            .where(eq(problemReports.assignedTo, userId))
            .orderBy(desc(problemReports.createdAt))
            .limit(20);
        // Get tasks assigned to this agent
        const assignedTasks = await db.select({
            id: tasks.id,
            title: tasks.title,
            status: tasks.status,
            priority: tasks.priority,
            dueDate: tasks.dueDate
        })
            .from(tasks)
            .where(eq(tasks.assignedTo, userId))
            .orderBy(asc(tasks.dueDate))
            .limit(20);
        // Get water quality tests performed by this agent
        const qualityTests = await db.select({
            id: waterQualityTests.id,
            waterAssetId: waterQualityTests.waterAssetId,
            overallQuality: waterQualityTests.overallQuality,
            testDate: waterQualityTests.testDate
        })
            .from(waterQualityTests)
            .where(eq(waterQualityTests.testedBy, userId))
            .orderBy(desc(waterQualityTests.testDate))
            .limit(20);
        const agentStats = {
            assignedReports,
            assignedTasks,
            qualityTests
        };
        res.json({
            success: true,
            data: agentStats
        });
    }
    catch (error) {
        console.error('Agent dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch agent dashboard statistics',
            code: 'AGENT_STATS_FETCH_ERROR'
        });
    }
});
export default router;
//# sourceMappingURL=dashboard.js.map