package db_wrapper

import (
	"github.com/google/uuid"
)

func NewSession(id uint32) (Session, error) {
	var s Session

	db, err := getDbConn()
	if err != nil {
		return s, err
	}
	defer db.Close()

	row := db.QueryRowx(`INSERT INTO sessions (user_id) 
                            VALUES ($1) RETURNING *`, id)
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
