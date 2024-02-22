package controller

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	db "server/db_wrapper"
)

func getSalt(w http.ResponseWriter, r *http.Request) {
	session, err := getSession(r)
	if err != nil {
		if err == sql.ErrNoRows || err == http.ErrNoCookie {
			http.Error(w,
				"You are not authorized to access this resource",
				http.StatusUnauthorized,
			)
			return
		}

		http.Error(w,
			"Something went wrong with your session",
			http.StatusInternalServerError,
		)
		return
	}

	user, err := db.GetUserById(session.UserId)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w,
				"Something went very wrong. This error should not be possible. You got session for user which doesn't exist",
				http.StatusInternalServerError,
			)
			return
		}

		http.Error(w,
			"Something went wrong with database connection",
			http.StatusInternalServerError,
		)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write(user.Salt)
}

func addKeys(w http.ResponseWriter, r *http.Request) {
	session, err := getSession(r)
	if err != nil {
		if err == sql.ErrNoRows || err == http.ErrNoCookie {
			http.Error(w,
				"You are not authorized to access this resource",
				http.StatusUnauthorized,
			)
			return
		}

		http.Error(w,
			"Something went wrong with your session",
			http.StatusInternalServerError,
		)
		return
	}

	if session.Type != db.SessionFirstLogin {
		http.Error(w,
			"You are not authorized to access this resource",
			http.StatusUnauthorized,
		)
		return
	}

	var keys db.Base64Keys

	d := json.NewDecoder(r.Body)
	err = d.Decode(&keys)
	if err != nil {
		http.Error(w, "There was something wrong with your request body", http.StatusBadRequest)
		return
	}

	db.AddKeys(session.UserId, keys.PublicKey, keys.PassPrivateKey, keys.CodePirvateKey)
	log.Printf("User #%v added keys", session.UserId)

	err = newSession(w, session.UserId, db.SessionNormal)
	if err != nil {
		http.Error(w, "We were unable to upgrade your session. Login again", http.StatusInternalServerError)
		return
	}
}

func getKeys(w http.ResponseWriter, r *http.Request) {
	session, err := getSession(r)
	if err != nil {
		if err == sql.ErrNoRows || err == http.ErrNoCookie {
			http.Error(w,
				"You are not authorized to access this resource",
				http.StatusUnauthorized,
			)
			return
		}

		http.Error(w,
			"Something went wrong with your session",
			http.StatusInternalServerError,
		)
		return
	}

	if session.Type == db.SessionFirstLogin {
		http.Error(w,
			"You are not authorized to access this resource",
			http.StatusUnauthorized,
		)
		return
	}

	user, err := db.GetUserById(session.UserId)
	if err != nil {
		http.Error(w, "There was something wrong during user data aquisition", http.StatusInternalServerError)
		return
	}

	keys, err := user.GetBase64Keys()
	if err != nil {
		http.Error(w, "There was something wrong during key aquisition", http.StatusInternalServerError)
		return
	}

	body, err := json.Marshal(keys)
	if err != nil {
		http.Error(w, "There was something wrong during json encoding", http.StatusInternalServerError)
		return
	}

	w.Header().Add("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(body)
}
