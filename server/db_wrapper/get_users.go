package db_wrapper

import (
	"log"
)

func GetUserId(userdn string) (uint32, error) {
	var user User
	db, err := getDbConn()
	if err != nil {
		log.Print(db)
		return 0, err
	}
	defer db.Close()

	err = db.Get(&user, "SELECT id FROM users WHERE ldap_dn = $1", userdn)
	if err != nil {
		log.Print(err)
		return 0, err
	}

	return user.ID, nil
}
