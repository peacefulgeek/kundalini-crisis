import pg from 'pg';
const { Pool } = pg;

let pool = null;

export async function getDb() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    pool = new Pool({
      connectionString,
      ssl: connectionString.includes('sslmode=require') ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return pool;
}

export async function query(text, params) {
  const db = await getDb();
  return db.query(text, params);
}

export async function initDb() {
  const db = await getDb();
  
  await db.query(`
    CREATE TABLE IF NOT EXISTS articles (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(255) UNIQUE NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      meta_description TEXT,
      og_title TEXT,
      og_description TEXT,
      category VARCHAR(100),
      tags TEXT[],
      image_url TEXT,
      image_alt TEXT,
      reading_time INTEGER DEFAULT 7,
      author VARCHAR(100) DEFAULT 'Kalesh',
      published_at TIMESTAMPTZ DEFAULT NOW(),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      word_count INTEGER DEFAULT 0,
      asins_used TEXT[],
      last_refreshed_30d TIMESTAMPTZ,
      last_refreshed_90d TIMESTAMPTZ,
      published BOOLEAN DEFAULT true,
      cta_primary TEXT,
      opener_type VARCHAR(50),
      conclusion_type VARCHAR(50)
    )
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS articles_slug_idx ON articles(slug);
    CREATE INDEX IF NOT EXISTS articles_category_idx ON articles(category);
    CREATE INDEX IF NOT EXISTS articles_published_at_idx ON articles(published_at DESC);
  `);

  console.log('[db] Tables initialized');
}
