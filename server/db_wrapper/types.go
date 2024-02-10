package db_wrapper

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID                uint32         `db:"id"`
	LDAP_DN           string         `db:"ldap_dn" json:"-"`
	CommonName        string         `db:"common_name"`
	DisplayName       sql.NullString `db:"display_name"`
	Image             sql.NullByte   `db:"img"`
	Active            bool           `db:"active"`
	Deleted           bool           `db:"deleted" json:"-"`
	PublicKey         sql.NullString `db:"public_key"`
	PassEncPrivateKey sql.NullString `db:"pass_priv_key"`
	CodeEncPrivateKey sql.NullString `db:"code_priv_key"`
}

type Session struct {
	UUID      uuid.UUID `db:"session_uuid"`
	UserId    uint32    `db:"user_id"`
	CreatedAt time.Time `db:"created_at"`
	ExpiresAt time.Time `db:"expires_at"`
}
