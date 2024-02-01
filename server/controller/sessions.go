package controller

import (
	"log"
	db "server/db_wrapper"

	"github.com/antonlindstrom/pgstore"
)

func getStore() (*pgstore.PGStore, error) {
	db, err := db.GetDB()
	if err != nil {
		log.Fatal("There was an error connecting to the database.")
	}

	return pgstore.NewPGStoreFromPool(db, []byte(key))
}
