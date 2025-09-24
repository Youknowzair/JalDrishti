import * as schema from './schema.js';
export declare const db: import("drizzle-orm/node-postgres").NodePgDatabase<typeof schema>;
export declare function testConnection(): Promise<boolean>;
export declare function closeConnection(): Promise<void>;
export declare function healthCheck(): Promise<boolean>;
export default db;
//# sourceMappingURL=connection.d.ts.map