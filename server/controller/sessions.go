package controller

import (
	"log"
	"net/http"
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

func isLoggedIn(r *http.Request) (bool, uint32) {
	store, err := getStore()
	if err != nil {
		return false, 0
	}
	defer store.Close()

	session, err := store.Get(r, "session-gda")
	if err != nil {
		return false, 0
	}

    if session.Values["id"] == nil {
		return false, 0
    }

    return true, session.Values["id"].(uint32)
}
