import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Use only in development when no DB is available
const isDevMock = process.env.DEV_ALLOW_MOCK_AUTH === 'true';

// In-memory datasets for quick frontend integration
const waterAssets = [
  { id: '1', name: 'Village Handpump', type: 'handpump', status: 'functional', condition: 'good', latitude: 23.0225, longitude: 72.5714 },
  { id: '2', name: 'Community Well', type: 'well', status: 'needs-maintenance', condition: 'fair', latitude: 23.0300, longitude: 72.5800 },
  { id: '3', name: 'Borewell 3', type: 'borewell', status: 'non-functional', condition: 'poor', latitude: 23.0150, longitude: 72.5600 },
];

const tasks = [
  { id: 't1', title: 'Inspect Borewell 3', type: 'inspection', priority: 'high', status: 'pending', dueDate: new Date().toISOString() },
  { id: 't2', title: 'Clean Community Well', type: 'maintenance', priority: 'medium', status: 'pending' },
  { id: 't3', title: 'Water Quality Test - Handpump', type: 'testing', priority: 'low', status: 'completed' },
];

const predictions = [
  { id: 'p1', hamletId: 'h1', hamletName: 'Rampur', type: 'water-shortage', prediction: 'Low rainfall predicted, shortage risk.', confidence: 78, alertLevel: 'high', predictedDate: new Date(Date.now() + 5*86400000).toISOString(), isActive: true, createdAt: new Date().toISOString() },
  { id: 'p2', hamletId: 'h2', hamletName: 'Sundarpur', type: 'contamination', prediction: 'Turbidity increasing beyond threshold.', confidence: 64, alertLevel: 'medium', predictedDate: new Date(Date.now() + 2*86400000).toISOString(), isActive: true, createdAt: new Date().toISOString() },
];

// Only use authentication middleware if not in dev mock mode
if (!isDevMock) {
  router.use(authenticateToken);
}

// GET /api/water-assets
router.get('/water-assets', (req: Request, res: Response) => {
  if (!isDevMock) return res.status(501).json({ success: false, message: 'Not implemented' });
  res.json(waterAssets);
});

// GET /api/tasks
router.get('/tasks', (req: Request, res: Response) => {
  if (!isDevMock) return res.status(501).json({ success: false, message: 'Not implemented' });
  res.json(tasks);
});

// POST /api/problem-reports
router.post('/problem-reports', (req: Request, res: Response) => {
  if (!isDevMock) return res.status(501).json({ success: false, message: 'Not implemented' });
  const report = { id: String(Date.now()), ...req.body, status: 'pending', createdAt: new Date().toISOString() };
  res.status(201).json({ success: true, data: report });
});

// POST /api/water-quality-tests
router.post('/water-quality-tests', (req: Request, res: Response) => {
  if (!isDevMock) return res.status(501).json({ success: false, message: 'Not implemented' });
  const test = { id: String(Date.now()), ...req.body, createdAt: new Date().toISOString() };
  res.status(201).json({ success: true, data: test });
});

// GET /api/predictions
router.get('/predictions', (req: Request, res: Response) => {
  if (!isDevMock) return res.status(501).json({ success: false, message: 'Not implemented' });
  const activeOnly = req.query.active === 'true';
  const data = activeOnly ? predictions.filter(p => p.isActive) : predictions;
  res.json(data);
});

export default router;


