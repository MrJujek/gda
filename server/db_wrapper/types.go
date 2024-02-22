package db_wrapper

import (
	"crypto/ecdsa"
	"crypto/x509"
	"database/sql"
	"encoding/base64"
	"fmt"
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

type Base64Keys struct {
	PublicKey      string `json:"PublicKey"`
	PassPrivateKey string `json:"PassPrivateKey"`
	CodePirvateKey string `json:"CodePirvateKey"`
}

func (user *User) GetBase64Keys() (Base64Keys, error) {
	var keys Base64Keys

	if !user.PublicKey.Valid || !user.CodeEncPrivateKey.Valid || !user.PassEncPrivateKey.Valid {
		return keys, fmt.Errorf("Keys don't exist")
	}

	keys.PublicKey = base64.StdEncoding.EncodeToString(user.PublicKey.V)
	keys.PassPrivateKey = base64.StdEncoding.EncodeToString(user.PassEncPrivateKey.V)
	keys.CodePirvateKey = base64.StdEncoding.EncodeToString(user.CodeEncPrivateKey.V)

	return keys, nil
}

func (user *User) SetPublicKey(key *ecdsa.PublicKey) error {
	arr, err := x509.MarshalPKIXPublicKey(key)
	if err != nil {
		return err
	}

	user.PublicKey.Valid = true
	user.PublicKey.V = arr
	return nil
}

func (user *User) GetPublicKey() (*ecdsa.PublicKey, error) {
	if !user.PublicKey.Valid {
		return nil, fmt.Errorf("Public key is null")
	}

	key, err := x509.ParsePKIXPublicKey(user.PublicKey.V)
	if err != nil {
		return nil, err
	}

	return key.(*ecdsa.PublicKey), nil
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
