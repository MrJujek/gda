package db_wrapper

import (
	"log"
)

func GetUsers() ([]User, error) {
	var users []User
	db, err := getDbConn()
	if err != nil {
		log.Print(db)
		return nil, err
	}
	defer db.Close()

	err = db.Select(&users, "SELECT * FROM users WHERE deleted = false")
	if err != nil {
		log.Print(err)
		return nil, err
	}

	return users, nil
}

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
