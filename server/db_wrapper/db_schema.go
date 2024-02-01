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
                active          BOOLEAN DEFAULT false NOT NULL,
                deleted         BOOLEAN DEFAULT false NOT NULL
        	);
        END IF;
    END $_$
    `,
}
