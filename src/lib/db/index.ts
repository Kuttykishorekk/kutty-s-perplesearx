import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import path from 'path';

// Vercel serverless doesn't support SQLite file system
// Make database optional for serverless environments
const isVercel = process.env.VERCEL === '1';
const DATA_DIR = process.env.DATA_DIR || process.cwd();

let db: ReturnType<typeof drizzle> | null = null;

if (!isVercel) {
  try {
    const sqlite = new Database(path.join(DATA_DIR, './data/db.sqlite'));
    db = drizzle(sqlite, {
      schema: schema,
    });
  } catch (error) {
    console.warn('SQLite database initialization failed:', error);
    db = null;
  }
}

// Export a getter function that returns db or null
export function getDb() {
  return db;
}

// Default export for backward compatibility (returns null on Vercel)
export default db;
