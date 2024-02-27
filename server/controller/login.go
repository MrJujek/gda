package controller

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	db "server/db_wrapper"
	encr "server/encryption"
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

	user, err := db.GetUserByDN(userdn)
	if err != nil {
		http.Error(w,
			"Something went wrong during id acquisition",
			http.StatusInternalServerError,
		)
		return
	}

	sessionType := db.SessionNormal

	if !user.PassEncPrivateKey.Valid {
		sessionType = db.SessionFirstLogin
	} else {
		ok, err = encr.CheckIfPasswordMatches(user, loginData.Pass)
		if err != nil {
			http.Error(w,
				"Something went wrong during session creation - password check error",
				http.StatusInternalServerError,
			)
			return
		}
		if !ok {
			sessionType = db.SessionKeyUpdate
		}
	}

	err = newSession(w, user.ID, sessionType)
	if err != nil {
		log.Print(err)
		http.Error(w,
			"Something went wrong during session creation",
			http.StatusInternalServerError,
		)
		return
	}

	if sessionType == db.SessionFirstLogin {
		http.Redirect(w, r, RedirectAfterFirstLogin, http.StatusSeeOther)
		return
	}

	if sessionType == db.SessionKeyUpdate {
		http.Redirect(w, r, RedirectAfterPassChange, http.StatusSeeOther)
		return
	}

	http.Redirect(w, r, RedirectAfterLogin, http.StatusSeeOther)
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
	session, err := getSession(r)
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

	w.Write([]byte(fmt.Sprint(session.UserId)))
	return
}
