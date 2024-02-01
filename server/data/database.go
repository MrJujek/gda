package data

import (
	"database/sql"
	"fmt"
	"log"
	u "server/util"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

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

	log.Print("Database is setup.")
}

func GetDB() (*sql.DB, error) {
	db, err := getDbConn()
	if err != nil {
		return nil, err
	}

	return db.DB, nil
}
