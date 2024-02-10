package controller

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"

	db "server/db_wrapper"
	lw "server/ldap_wrapper"
)

type loginData struct {
	User string `json:"user"`
	Pass string `json:"pass"`
}

func login(w http.ResponseWriter, r *http.Request) {
	var loginData loginData

	d := json.NewDecoder(r.Body)
	err := d.Decode(&loginData)
	if err != nil {
		log.Print(err)
		http.Error(w, "There was something wrong with your request body", http.StatusBadRequest)
		return
	}

	ok, userdn, err := lw.LDAPLogin(loginData.User, loginData.Pass)
	if err != nil {
		log.Print(err)
		http.Error(w,
			"Something went wrong during connecting to AD/LDAP server",
			http.StatusInternalServerError,
		)
		return
	}

	if !ok {
		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte("wrong username or password"))
		return
	}

	id, err := db.GetUserId(userdn)
	if err != nil {
		http.Error(w,
			"Something went wrong during id acquisition",
			http.StatusInternalServerError,
		)
		return
	}

	err = newSession(w, id)
	if err != nil {
		log.Print(err)
		http.Error(w,
			"Something went wrong during session creation",
			http.StatusInternalServerError,
		)
		return
	}

	w.Write([]byte("ok"))
	return
}

func logout(w http.ResponseWriter, r *http.Request) {
	err := delSession(w, r)
	if err != nil {
		if err == sql.ErrNoRows || err == http.ErrNoCookie {
			http.Error(w,
				"You are not authorized to access this resource",
				http.StatusUnauthorized,
			)
			return
		}

		log.Print(err)
		http.Error(w,
			"Something went wrong during session deletion",
			http.StatusInternalServerError,
		)
		return
	}

	w.Write([]byte("ok"))
	return
}

func checkSession(w http.ResponseWriter, r *http.Request) {
	_, err := getSession(r)
	if err != nil {
		if err == sql.ErrNoRows || err == http.ErrNoCookie {
			http.Error(w,
				"You are not authorized to access this resource",
				http.StatusUnauthorized,
			)
			return
		}

		log.Print(err)
		http.Error(w,
			"Something went wrong with your session",
			http.StatusInternalServerError,
		)
		return
	}

	w.Write([]byte("ok"))
	return
}
