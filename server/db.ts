import { Pool } from 'pg';
     import { drizzle } from 'drizzle-orm/node-postgres';
     import * as schema from '@shared/schema';
     import 'dotenv/config';

     // Validate DATABASE_URL
     if (!process.env.DATABASE_URL) {
       throw new Error('DATABASE_URL must be set. Did you forget to provision a database?');
     }

     // Create pool for local PostgreSQL
     export const pool = new Pool({
       connectionString: process.env.DATABASE_URL,
       max: 10,
       idleTimeoutMillis: 30000,
       connectionTimeoutMillis: 5001,
     });

     // Add error handling for the pool
     pool.on('error', (err) => {
       console.error('Database pool error:', err);
     });

     // Initialize Drizzle with the pool
     export const db = drizzle(pool, { schema });

     // Test database connection with retry logic
     export async function testDatabaseConnection(retries = 3): Promise<boolean> {
       console.log('Attempting to connect with DATABASE_URL:', process.env.DATABASE_URL);
       for (let i = 0; i < retries; i++) {
         try {
           await pool.query('SELECT 1');
           console.log('Database connection successful');
           return true;
         } catch (error) {
           console.warn(`Database connection attempt ${i + 1} failed:`, error);
           if (i === retries - 1) {
             console.error('Failed to connect to database after', retries, 'attempts');
             return false;
           }
           await new Promise(resolve => setTimeout(resolve, 2000));
         }
       }
       return false;
     }