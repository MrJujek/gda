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
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chats') THEN
            CREATE TABLE chats(
                chat_uuid   UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE PRIMARY KEY,
                encrypted   BOOLEAN NOT NULL DEFAULT false,
                is_group    BOOLEAN NOT NULL DEFAULT false,
                group_name  TEXT
            );
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users_chats') THEN
            CREATE TABLE users_chats(
                chat_uuid   UUID NOT NULL REFERENCES chats (chat_uuid),
                user_id     INTEGER NOT NULL REFERENCES users (id),
                enc_secret  TEXT
            );
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_type') THEN
            CREATE TYPE message_type AS ENUM ('text', 'file', 'image');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages') THEN
            CREATE TABLE messages(
                message_id  SERIAL PRIMARY KEY,
                author_id   INTEGER NOT NULL REFERENCES users (id),
                timestamp   TIMESTAMP NOT NULL DEFAULT now(),
                msg_type    message_type NOT NULL DEFAULT 'text',
                encrypted   BOOLEAN NOT NULL DEFAULT false,
                text        TEXT,
                file_uuid   UUID
            );
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

        -- adding last message timestamp to chats table
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'chats' AND column_name = 'last_message'
        ) THEN
            ALTER TABLE chats ADD COLUMN last_message TIMESTAMP NOT NULL DEFAULT now();
        END IF;

        -- changing active to active_count
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'users' AND column_name = 'active_count'
        ) THEN
            ALTER TABLE users ADD COLUMN active_count INTEGER NOT NULL DEFAULT 0;
            ALTER TABLE users DROP COLUMN active;
        END IF;
    END $$
    `,
}
