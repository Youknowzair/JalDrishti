import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';
import dotenv from 'dotenv';
dotenv.config();
// Database connection configuration
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'jal_drishti',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
// Create Drizzle instance
export const db = drizzle(pool, { schema });
// Test database connection
export async function testConnection() {
    try {
        const client = await pool.connect();
        await client.query('SELECT NOW()');
        client.release();
        console.log('✅ Database connection successful');
        return true;
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        return false;
    }
}
// Close database connection
export async function closeConnection() {
    try {
        await pool.end();
        console.log('✅ Database connection closed');
    }
    catch (error) {
        console.error('❌ Error closing database connection:', error);
    }
}
// Health check
export async function healthCheck() {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT 1 as health');
        client.release();
        return result.rows[0].health === 1;
    }
    catch (error) {
        console.error('Health check failed:', error);
        return false;
    }
}
export default db;
//# sourceMappingURL=connection.js.map