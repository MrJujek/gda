package network

import (
	"log"
	"server/data"

	"github.com/antonlindstrom/pgstore"
)

func getStore() (*pgstore.PGStore, error) {
	db, err := data.GetDB()
	if err != nil {
		log.Fatal("There was an error connecting to the database.")
	}

	return pgstore.NewPGStoreFromPool(db, []byte(key))
}
