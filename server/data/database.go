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

func getDbConn() (*sqlx.DB, error) {
	return sqlx.Open("postgres", connStr)
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
		log.Fatal("Connection with the database could have not been established.")
	}
	defer db.Close()

	err = db.Ping()
	if err != nil {
		log.Fatal("Connection with the database could have not been established.")
	}

	log.Print("Connection with database established.")
}

func GetDB() (*sql.DB, error) {
	db, err := getDbConn()
	if err != nil {
		return nil, err
	}

	return db.DB, nil
}
