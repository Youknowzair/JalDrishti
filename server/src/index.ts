import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import session from 'express-session';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import mockRoutes from './routes/mocks.js';

// Import database connection
import { testConnection, closeConnection } from './database/connection.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: process.env.SESSION_COOKIE_HTTPONLY === 'true',
    maxAge: parseInt(process.env.SESSION_COOKIE_MAX_AGE || '86400000'),
    sameSite: 'lax'
  },
  name: 'jal-drishti-session'
}));

// Rate limiting
const generalRateLimit = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalRateLimit);

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const requestPath = req.path;
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (requestPath.startsWith('/api')) {
      console.log(`${req.method} ${requestPath} ${res.statusCode} in ${duration}ms`);
    }
  });
  
  next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    let dbHealthy = false;
    try {
      dbHealthy = await testConnection();
    } catch {
      dbHealthy = false;
    }
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: dbHealthy ? 'connected' : 'disconnected',
      version: '1.0.0'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', mockRoutes);

// Serve static files from client/dist if they exist
app.use(express.static(path.join(process.cwd(), 'client', 'dist')));

// Serve static files from client/public
app.use(express.static(path.join(process.cwd(), 'client', 'public')));

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Jal Drishti API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'User registration',
        'POST /api/auth/login': 'User login',
        'GET /api/auth/profile': 'Get user profile',
        'PUT /api/auth/profile': 'Update user profile',
        'PUT /api/auth/change-password': 'Change password',
        'POST /api/auth/logout': 'User logout'
      },
      dashboard: {
        'GET /api/dashboard/stats': 'Get dashboard statistics',
        'GET /api/dashboard/user-stats': 'Get user-specific statistics',
        'GET /api/dashboard/admin-stats': 'Get admin statistics (admin only)',
        'GET /api/dashboard/agent-stats': 'Get agent statistics (agent/admin only)'
      },
      health: {
        'GET /health': 'Health check'
      }
    },
    documentation: '/api/docs'
  });
});

// Catch-all route for React app (must come after API routes)
app.get('*', async (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ 
      success: false,
      message: 'API endpoint not found',
      code: 'ENDPOINT_NOT_FOUND'
    });
  }
  
  // Try to serve the built React app
  const indexPath = path.join(process.cwd(), 'client', 'dist', 'index.html');
  
  // Check if the file exists first
  const fs = await import('fs');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // If React app is not built, serve a simple development page
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Jal Drishti - Backend API</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
          .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          h1 { color: #2563eb; text-align: center; }
          .status { background: #dcfce7; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .status h3 { margin: 0 0 10px 0; color: #166534; }
          .endpoints { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .endpoint { background: #f1f5f9; padding: 15px; border-radius: 6px; margin: 10px 0; border-left: 4px solid #2563eb; }
          .endpoint h4 { margin: 0 0 8px 0; color: #1e40af; }
          .endpoint p { margin: 0; color: #64748b; }
          .method { background: #2563eb; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-right: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚰 Jal Drishti - Backend API</h1>
          
          <div class="status">
            <h3>✅ Backend Status</h3>
            <p>Backend server is running successfully on port ${PORT}</p>
            <p>Database connection: <strong>Active</strong></p>
          </div>
          
          <h2>Available API Endpoints:</h2>
          <div class="endpoints">
            <div class="endpoint">
              <h4><span class="method">GET</span> /health</h4>
              <p>Health check endpoint</p>
            </div>
            <div class="endpoint">
              <h4><span class="method">GET</span> /api</h4>
              <p>API documentation and available endpoints</p>
            </div>
            <div class="endpoint">
              <h4><span class="method">POST</span> /api/auth/register</h4>
              <p>User registration</p>
            </div>
            <div class="endpoint">
              <h4><span class="method">POST</span> /api/auth/login</h4>
              <p>User login</p>
            </div>
            <div class="endpoint">
              <h4><span class="method">GET</span> /api/dashboard/stats</h4>
              <p>Dashboard statistics (requires authentication)</p>
            </div>
          </div>
          
          <h2>Next Steps:</h2>
          <p>To run the full application with React frontend:</p>
          <ol>
            <li>Build the React app: <code>cd client && npm run build</code></li>
            <li>Or run in development mode: <code>cd client && npm run dev</code></li>
          </ol>
          
          <h2>Testing the API:</h2>
          <p>You can test the API endpoints using tools like Postman, curl, or your browser:</p>
          <ul>
            <li><strong>Health Check:</strong> <a href="/health">/health</a></li>
            <li><strong>API Docs:</strong> <a href="/api">/api</a></li>
          </ul>
        </div>
      </body>
      </html>
    `);
  }
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
    success: false,
    message,
    code: 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    code: 'ENDPOINT_NOT_FOUND',
    path: req.path
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await closeConnection();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await closeConnection();
  process.exit(0);
});

// Start server
const server = app.listen(PORT, HOST, async () => {
  console.log(`🚀 Jal Drishti Backend Server running on http://${HOST}:${PORT}`);
  console.log(`📊 API endpoints available at http://${HOST}:${PORT}/api/*`);
  console.log(`🏥 Health check available at http://${HOST}:${PORT}/health`);
  console.log(`📚 API documentation available at http://${HOST}:${PORT}/api`);
  console.log(`🌐 Frontend will be served from client/dist`);
  
  // Test database connection (non-fatal in dev)
  if (process.env.NODE_ENV !== 'production') {
    try {
      await testConnection();
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      console.log('⚠️  Continuing without DB. Set DEV_ALLOW_MOCK_AUTH=true for frontend testing.');
    }
  } else {
    await testConnection();
  }
});

export default server;
