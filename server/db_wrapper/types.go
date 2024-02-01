package db_wrapper

import "database/sql"

type User struct {
	ID          uint32         `db:"id"`
	LDAP_DN     string         `db:"ldap_dn"`
	CommonName  string         `db:"common_name"`
	DisplayName sql.NullString `db:"display_name"`
	Active      bool           `db:"active"`
	Deleted     bool           `db:"deleted"`
}
