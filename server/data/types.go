package data

import "database/sql"

type User struct {
	ID          uint32         `db:"id"`
	LDAP_DN     string         `db:"ldap_dn"`
	CommonName  string         `db:"common_name"`
	DisplayName sql.NullString `db:"display_name"`
	Active      bool           `db:"active"`
	Deleted     bool           `db:"deleted"`
}

type LdapUser struct {
	Dn          string `ldap:"dn"`
	CommonName  string `ldap:"cn"`
	DisplayName string `ldap:"displayName"`
}
