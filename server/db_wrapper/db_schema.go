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
                active          BOOLEAN DEFAULT false NOT NULL,
                deleted         BOOLEAN DEFAULT false NOT NULL,
                public_key      TEXT,
                pass_priv_key   TEXT,
                code_priv_key   TEXT
            );
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sessions') THEN
            CREATE TABLE sessions(
                session_uuid    UUID DEFAULT gen_random_uuid() UNIQUE PRIMARY KEY,
                user_id         INTEGER NOT NULL REFERENCES users (id),
                created_at      TIMESTAMP NOT NULL DEFAULT now(),
                expires_at      TIMESTAMP NOT NULL DEFAULT date_add(now(), '3 MONTH') -- do it in a better way?
            );
        END IF;
    END $_$
    `,
}
