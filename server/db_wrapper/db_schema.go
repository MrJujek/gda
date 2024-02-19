package db_wrapper

var db_schema = []string{
	`
    DO $_$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
            CREATE TABLE users(
                id              SERIAL PRIMARY KEY,
                ldap_dn         TEXT NOT NULL,
                common_name     TEXT NOT NULL,
                display_name    TEXT NOT NULL,
                img             BYTEA,
                active          BOOLEAN NOT NULL DEFAULT false,
                deleted         BOOLEAN NOT NULL DEFAULT false,
                public_key      TEXT,
                pass_priv_key   TEXT,
                code_priv_key   TEXT
            );
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sessions') THEN
            CREATE TABLE sessions(
                session_uuid    UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE PRIMARY KEY,
                user_id         INTEGER NOT NULL REFERENCES users (id),
                created_at      TIMESTAMP NOT NULL DEFAULT now(),
                expires_at      TIMESTAMP NOT NULL DEFAULT date_add(now(), '3 MONTH') -- do it in a better way?
            );
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'session_type') THEN
            CREATE TYPE session_type AS ENUM ('normal', 'first_login', 'key_reencryption');
        END IF;
    END $_$
    `,
    `
    DO $$
    BEGIN
        -- adding types to sessions
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'sessions' AND column_name = 'type'
        ) THEN
            ALTER TABLE sessions ADD COLUMN type session_type NOT NULL DEFAULT 'first_login';
        END IF;

        -- adding salt for PBKDF2 encryption
        CREATE EXTENSION IF NOT EXISTS pgcrypto;
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'salt'
        ) THEN
            ALTER TABLE users ADD COLUMN salt BYTEA NOT NULL DEFAULT gen_random_bytes(16);
        END IF;

        -- changing key columns in users to use BYTEA type
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'public_key' AND data_type = 'bytea'
        ) THEN
            ALTER TABLE users DROP COLUMN IF EXISTS public_key;
            ALTER TABLE users ADD COLUMN public_key BYTEA;
        END IF;
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'pass_priv_key' AND data_type = 'bytea'
        ) THEN
            ALTER TABLE users DROP COLUMN IF EXISTS pass_priv_key;
            ALTER TABLE users ADD COLUMN pass_priv_key BYTEA;
        END IF;
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'code_priv_key' AND data_type = 'bytea'
        ) THEN
            ALTER TABLE users DROP COLUMN IF EXISTS code_priv_key;
            ALTER TABLE users ADD COLUMN code_priv_key BYTEA;
        END IF;
    END $$
    `,
}
