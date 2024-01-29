package data

import (
	"fmt"
	"log"
	u "server/util"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

var DB *sqlx.DB

func InitDB() {
	var err error

	user := u.EnvExit("DB_USER")
	pass := u.EnvExit("DB_PASS")
	host := u.EnvOr("DB_HOST", "127.0.0.1")
	port := u.EnvOr("DB_PORT", "5432")
	dbname := u.EnvExit("DB_NAME")

	DB, err = sqlx.Open("postgres", fmt.Sprintf(
		"dbname=%v user=%v password=%v host=%v port=%v sslmode=disable",
		dbname, user, pass, host, port,
	))

	if err != nil {
		log.Fatal("Connection with the database could have not been established.")
	}

	log.Print("Connection with database established.")
}
