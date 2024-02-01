package db_wrapper

import (
	"log"
	lw "server/ldap_wrapper"
)

const ldapErr = `
Importing users from LDAP/AD failed.
Check if LDAP/AD server is up and whether your configuration is correct.`

// This function exists on error
func addUsersFromLDAP() {
	type dn_id struct {
		Id uint32 `db:"id"`
		Dn string `db:"ldap_dn"`
	}

	var (
		ids      []dn_id
		newUsers []lw.LdapUser
		delUsers []dn_id
	)

	db, err := getDbConn()
	if err != nil {
		log.Fatal(dbConnErr)
	}
	defer db.Close()

	err = db.Select(&ids, "SELECT id, ldap_dn FROM users WHERE deleted = false")
	if err != nil {
		log.Print(err)
		log.Fatal(ldapErr)
	}

	ldapUsers, err := lw.GetUserListLDAP()
	if err != nil {
		log.Fatal(ldapErr)
	}

outerAdd:
	for _, ldU := range ldapUsers {
		for _, dbU := range ids {
			if dbU.Dn == ldU.Dn {
				continue outerAdd
			}
		}

		newUsers = append(newUsers, ldU)
	}

outerDel:
	for _, dbU := range ids {
		for _, ldU := range ldapUsers {
			if dbU.Dn == ldU.Dn {
				continue outerDel
			}
		}

		delUsers = append(delUsers, dbU)
	}

	tx, err := db.Beginx()
	if err != nil {
		log.Fatal(ldapErr)
	}

	for _, user := range newUsers {
		_, err := tx.Exec(
			`INSERT INTO users (ldap_dn, common_name, display_name) 
                VALUES ($1, $2, $3)`,
			user.Dn, user.CommonName, user.DisplayName,
		)
		if err != nil {
			if err := tx.Rollback(); err != nil {
				log.Fatalf(dbRollbackErr, err)
			}
			log.Fatal(ldapErr)
		}
	}

	for _, user := range delUsers {
		_, err := tx.Exec("UPDATE users SET deleted = true WHERE id = $1", user.Id)
		if err != nil {
			if err := tx.Rollback(); err != nil {
				log.Fatalf(dbRollbackErr, err)
			}
			log.Fatal(ldapErr)
		}
	}

	err = tx.Commit()
	if err != nil {
		log.Fatal(ldapErr)
	}

	log.Print("Users imported from LDAP/AD.")
}
