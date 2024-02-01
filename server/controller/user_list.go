package controller

import (
	"encoding/json"
	"net/http"
	db "server/db_wrapper"
)

func userList(w http.ResponseWriter, r *http.Request) {
	loggedIn, _ := isLoggedIn(r)
	if !loggedIn {
		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte("You are unauthorized. Login to access this resource."))
		return
	}

	users, err := db.GetUsers()
	if err != nil {
		http.Error(w,
			"Something went wrong",
			http.StatusInternalServerError,
		)
		return
	}

	json, err := json.Marshal(users)
	if err != nil {
		http.Error(w,
			"Something went wrong",
			http.StatusInternalServerError,
		)
		return
	}

	w.Header().Add("Content-Type", "application/json")
	w.Write(json)
}
