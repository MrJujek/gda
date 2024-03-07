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

	for i, _ := range users {
		if users[i].ActiveCount > 0 {
			users[i].Active = true
		}
	}

	return users, nil
}

func GetUserByDN(userdn string) (User, error) {
	var user User

	db, err := getDbConn()
	if err != nil {
		log.Print(db)
		return user, err
	}
	defer db.Close()

	err = db.Get(&user, "SELECT * FROM users WHERE ldap_dn = $1", userdn)
	if err != nil {
		log.Print(err)
		return user, err
	}

	return user, nil
}

func GetUserById(userId uint32) (User, error) {
	var user User

	db, err := getDbConn()
	if err != nil {
		return user, err
	}
	defer db.Close()

	err = db.Get(&user, "SELECT * FROM users WHERE id = $1", userId)
	if err != nil {
		return user, err
	}

	return user, nil
}
