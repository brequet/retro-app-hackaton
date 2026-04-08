import Database from 'better-sqlite3';
import path from 'path';

// Use environment variable for DB path or default to data.db
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '..', '..', 'data.db');
const db: InstanceType<typeof Database> = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      is_admin INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS activities (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('retro', 'icebreaker')),
      duration TEXT NOT NULL,
      duration_min INTEGER NOT NULL,
      duration_max INTEGER NOT NULL,
      team_size TEXT NOT NULL,
      team_size_min INTEGER NOT NULL,
      team_size_max INTEGER NOT NULL,
      tags TEXT NOT NULL,
      description TEXT NOT NULL,
      instructions TEXT NOT NULL,
      materials TEXT NOT NULL,
      image_url TEXT,
      creator_id TEXT,
      is_global INTEGER NOT NULL DEFAULT 0,
      deleted_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS favorites (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      activity_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
      UNIQUE(user_id, activity_id)
    );

    CREATE TABLE IF NOT EXISTS recently_viewed (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      activity_id TEXT NOT NULL,
      viewed_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      author_id TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
    CREATE INDEX IF NOT EXISTS idx_recently_viewed_user ON recently_viewed(user_id, viewed_at DESC);
  `);

  // Migrations for existing databases
  try {
    const activityCols = db.prepare("PRAGMA table_info(activities)").all() as any[];
    const hasCreatorId = activityCols.some((c: any) => c.name === 'creator_id');
    const hasDeletedAt = activityCols.some((c: any) => c.name === 'deleted_at');
    const hasIsGlobal = activityCols.some((c: any) => c.name === 'is_global');

    if (!hasCreatorId) {
      db.exec('ALTER TABLE activities ADD COLUMN creator_id TEXT REFERENCES users(id) ON DELETE SET NULL');
      console.log('Migration: added creator_id column to activities');
    }
    if (!hasDeletedAt) {
      db.exec('ALTER TABLE activities ADD COLUMN deleted_at TEXT');
      console.log('Migration: added deleted_at column to activities');
    }
    if (!hasIsGlobal) {
      db.exec('ALTER TABLE activities ADD COLUMN is_global INTEGER NOT NULL DEFAULT 0');
      // Mark existing seed activities (no creator) as global
      db.exec('UPDATE activities SET is_global = 1 WHERE creator_id IS NULL');
      console.log('Migration: added is_global column to activities');
    }

    const userCols = db.prepare("PRAGMA table_info(users)").all() as any[];
    const hasIsAdmin = userCols.some((c: any) => c.name === 'is_admin');
    if (!hasIsAdmin) {
      db.exec('ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0');
      console.log('Migration: added is_admin column to users');
    }
  } catch (e) {
    // Columns already exist or table was just created with them
  }

  // Create indexes that depend on migrated columns
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_activities_creator ON activities(creator_id);
    CREATE INDEX IF NOT EXISTS idx_activities_deleted ON activities(deleted_at);
    CREATE INDEX IF NOT EXISTS idx_activities_global ON activities(is_global);
    CREATE INDEX IF NOT EXISTS idx_articles_created ON articles(created_at DESC);
  `);

  console.log('Database initialized successfully');
}

export default db;
