-- ========================================
-- Complete Laravel Setup for Supabase
-- ========================================
-- Run this ONCE in: Supabase Dashboard → SQL Editor
-- This creates all necessary Laravel system tables

-- ========================================
-- 1. Migrations Table (track which migrations ran)
-- ========================================
CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    migration VARCHAR(255) NOT NULL,
    batch INTEGER NOT NULL
);

-- ========================================
-- 2. Personal Access Tokens (Laravel Sanctum)
-- ========================================
CREATE TABLE IF NOT EXISTS personal_access_tokens (
    id BIGSERIAL PRIMARY KEY,
    tokenable_type VARCHAR(255) NOT NULL,
    tokenable_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    token VARCHAR(64) NOT NULL,
    abilities TEXT NULL,
    last_used_at TIMESTAMPTZ NULL,
    expires_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NULL,
    updated_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS personal_access_tokens_tokenable_type_tokenable_id_index 
ON personal_access_tokens(tokenable_type, tokenable_id);

CREATE UNIQUE INDEX IF NOT EXISTS personal_access_tokens_token_unique 
ON personal_access_tokens(token);

-- ========================================
-- 3. Password Reset Tokens
-- ========================================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    email VARCHAR(255) PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NULL
);

CREATE INDEX IF NOT EXISTS password_reset_tokens_email_index 
ON password_reset_tokens(email);

-- ========================================
-- 4. Sessions Table (if using database sessions)
-- ========================================
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id UUID NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    payload TEXT NOT NULL,
    last_activity INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS sessions_user_id_index ON sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_last_activity_index ON sessions(last_activity);

-- ========================================
-- 5. Cache Table (if using database cache)
-- ========================================
CREATE TABLE IF NOT EXISTS cache (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT NOT NULL,
    expiration INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS cache_expiration_index ON cache(expiration);

CREATE TABLE IF NOT EXISTS cache_locks (
    key VARCHAR(255) PRIMARY KEY,
    owner VARCHAR(255) NOT NULL,
    expiration INTEGER NOT NULL
);

-- ========================================
-- 6. Jobs Table (for queues)
-- ========================================
CREATE TABLE IF NOT EXISTS jobs (
    id BIGSERIAL PRIMARY KEY,
    queue VARCHAR(255) NOT NULL,
    payload TEXT NOT NULL,
    attempts SMALLINT NOT NULL,
    reserved_at INTEGER NULL,
    available_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS jobs_queue_index ON jobs(queue);

-- ========================================
-- 7. Failed Jobs Table
-- ========================================
CREATE TABLE IF NOT EXISTS failed_jobs (
    id BIGSERIAL PRIMARY KEY,
    uuid VARCHAR(255) UNIQUE NOT NULL,
    connection TEXT NOT NULL,
    queue TEXT NOT NULL,
    payload TEXT NOT NULL,
    exception TEXT NOT NULL,
    failed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ========================================
-- Verify all tables were created
-- ========================================
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE columns.table_name = tables.table_name) as column_count
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'migrations',
    'personal_access_tokens',
    'password_reset_tokens',
    'sessions',
    'cache',
    'cache_locks',
    'jobs',
    'failed_jobs',
    'users'
)
ORDER BY table_name;

-- ========================================
-- Success message
-- ========================================
SELECT '
✅ All Laravel system tables created successfully!

Next steps:
1. Clear Laravel config: php artisan config:clear
2. Test login at: http://localhost:8000/test-login.html
3. Login should now work with token generation!

Tables created:
- migrations (track migrations)
- personal_access_tokens (API tokens)
- password_reset_tokens (password resets)
- sessions (optional, for DB sessions)
- cache (optional, for DB cache)
- cache_locks (cache locking)
- jobs (background jobs)
- failed_jobs (failed job tracking)
' as status;
