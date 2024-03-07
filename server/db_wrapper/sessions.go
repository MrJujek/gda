package db_wrapper

import (
	"time"

	"github.com/google/uuid"
)

const (
	SpecialLoginMaxLength = 1 * time.Hour
	NormalLoginMaxLength  = 3 * 30 * 24 * time.Hour
)

func NewSession(id uint32, sessionType SessionType) (Session, error) {
	var (
		s          Session
		expiration time.Time
	)

	db, err := getDbConn()
	if err != nil {
		return s, err
	}
	defer db.Close()

	if sessionType != SessionNormal {
		expiration = time.Now().Add(SpecialLoginMaxLength)
	} else {
		expiration = time.Now().Add(NormalLoginMaxLength)
	}

	row := db.QueryRowx(`INSERT INTO sessions (user_id, type, expires_at) 
                            VALUES ($1, $2, $3) RETURNING *`,
		id, sessionType, expiration)
	err = row.StructScan(&s)

	return s, err
}

func DelSession(uuidString string) error {
	uuid, err := uuid.Parse(uuidString)
	if err != nil {
		return err
	}

	db, err := getDbConn()
	if err != nil {
		return err
	}
	defer db.Close()

	_, err = db.Exec(`DELETE FROM sessions WHERE session_uuid = $1`, uuid)
	if err != nil {
		return err
	}

	return nil
}

func GetSession(uuidString string) (Session, error) {
	var s Session

	uuid, err := uuid.Parse(uuidString)
	if err != nil {
		return s, err
	}

	db, err := getDbConn()
	if err != nil {
		return s, err
	}
	defer db.Close()

	row := db.QueryRowx(`SELECT * FROM sessions WHERE session_uuid = $1`, uuid)
	err = row.StructScan(&s)

	return s, err
}
