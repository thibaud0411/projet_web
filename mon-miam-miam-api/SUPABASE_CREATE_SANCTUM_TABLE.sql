-- ========================================
-- Create Laravel Sanctum Table in Supabase
-- ========================================
-- Run this in: Supabase Dashboard → SQL Editor
-- This table is required for Laravel Sanctum to generate API tokens

-- Create personal_access_tokens table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS personal_access_tokens_tokenable_type_tokenable_id_index 
ON personal_access_tokens(tokenable_type, tokenable_id);

CREATE UNIQUE INDEX IF NOT EXISTS personal_access_tokens_token_unique 
ON personal_access_tokens(token);

-- Verify table was created
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'personal_access_tokens' 
ORDER BY ordinal_position;

-- Success message
SELECT '✅ Table personal_access_tokens created successfully!' as status;
