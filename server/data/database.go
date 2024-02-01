package data

import (
	"database/sql"
	"fmt"
	"log"
	u "server/util"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

// TODO cleanup

var connStr string

const (
	dbConnErr = `
Connection with the database could have not been established. 
Check if database is up and whether your configuration is correct.`
	dbTxErr = `
Unable to create database schema.
Check if database is up and whether your configuration is correct.`
	dbRollbackErr = `
Unable to rollback changes, with error: %v
Check if database is up and whether your configuration is correct.`
	ldapErr = `
Importing users from LDAP/AD failed.
Check if LDAP/AD server is up and whether your configuration is correct.`
)

func getDbConn() (*sqlx.DB, error) {
	return sqlx.Open("postgres", connStr)
}

// This function exists on error
func createDbSchema() {
	db, err := getDbConn()
	if err != nil {
		log.Fatal(dbConnErr)
	}
	defer db.Close()

	tx, err := db.Beginx()
	if err != nil {
		log.Fatal(dbTxErr)
	}

	for _, query := range db_schema {
		_, err := tx.Exec(query)
		if err != nil {
			if err := tx.Rollback(); err != nil {
				log.Fatalf(dbRollbackErr, err)
			}
			log.Fatal(dbTxErr)
		}
	}

	err = tx.Commit()
	if err != nil {
		log.Fatal(dbTxErr)
	}

	log.Print("Database schema created.")
}

// This function exists on error
func addUsersFromLDAP() {
	type dn_id struct {
		Id uint32 `db:"id"`
		Dn string `db:"ldap_dn"`
	}

	var (
		ids      []dn_id
		newUsers []LdapUser
		delUsers []dn_id
	)

	db, err := getDbConn()
	if err != nil {
		log.Fatal(dbConnErr)
	}
	defer db.Close()

	err = db.Select(&ids, "SELECT id, ldap_dn FROM users WHERE deleted = false")
	if err != nil {
		log.Print("select")
		log.Print(err)
		log.Fatal(ldapErr)
	}

	ldapUsers, err := GetUserListLDAP()
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

func InitDB() {
	user := u.EnvExit("DB_USER")
	pass := u.EnvExit("DB_PASS")
	host := u.EnvOr("DB_HOST", "127.0.0.1")
	port := u.EnvOr("DB_PORT", "5432")
	dbname := u.EnvExit("DB_NAME")

	connStr = fmt.Sprintf(
		"dbname=%v user=%v password=%v host=%v port=%v sslmode=disable",
		dbname, user, pass, host, port,
	)

	db, err := getDbConn()
	if err != nil {
		log.Fatal(dbConnErr)
	}
	defer db.Close()

	err = db.Ping()
	if err != nil {
		log.Fatal(dbConnErr)
	}

	log.Print("Connection with database established.")

	createDbSchema()

	addUsersFromLDAP()

	log.Print("Database is setup.")
}

func GetDB() (*sql.DB, error) {
	db, err := getDbConn()
	if err != nil {
		return nil, err
	}

	return db.DB, nil
}
