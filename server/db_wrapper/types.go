package db_wrapper

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID                uint32           `db:"id"`
	LDAP_DN           string           `db:"ldap_dn" json:"-"`
	CommonName        string           `db:"common_name"`
	DisplayName       sql.Null[string] `db:"display_name"`
	Image             sql.Null[[]byte] `db:"img" json:"-"`
	Active            bool             `db:"active"`
	Deleted           bool             `db:"deleted" json:"-"`
	Salt              []byte           `db:"salt" json:"-"`
	PublicKey         sql.Null[[]byte] `db:"public_key"`
	PassEncPrivateKey sql.Null[[]byte] `db:"pass_priv_key" json:"-"`
	CodeEncPrivateKey sql.Null[[]byte] `db:"code_priv_key" json:"-"`
}


type SessionType string

const (
	SessionNormal     SessionType = "normal"
	SessionFirstLogin SessionType = "first_login"
	SessionKeyUpdate  SessionType = "key_reencryption"
)

type Session struct {
	UUID      uuid.UUID   `db:"session_uuid"`
	UserId    uint32      `db:"user_id"`
	Type      SessionType `db:"type"`
	CreatedAt time.Time   `db:"created_at"`
	ExpiresAt time.Time   `db:"expires_at"`
}
