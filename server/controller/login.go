package controller

import (
	"encoding/json"
	"log"
	"net/http"

	db "server/db_wrapper"
	lw "server/ldap_wrapper"
)

// TODO better session flow

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
		http.Error(w, "There was something wrong with your request", http.StatusBadRequest)
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

	store, err := getStore()
	if err != nil {
		log.Print(err)
		http.Error(w,
			"Something went wrong during session establishment",
			http.StatusInternalServerError,
		)
		return
	}
	defer store.Close()

	session, err := store.New(r, "session-gda")
	if err != nil {
		log.Print(err)
		http.Error(w,
			"Something went wrong during session establishment",
			http.StatusInternalServerError,
		)
		return
	}

	session.Values["ldap_name"] = loginData.User
	session.Values["id"] = id
	session.Options.HttpOnly = true
	session.Options.Secure = true

	err = session.Save(r, w)
	if err != nil {
		log.Print(err)
		http.Error(w,
			"Something went wrong during session establishment",
			http.StatusInternalServerError,
		)
		return
	}

	w.Write([]byte("ok"))
	return
}

func logout(w http.ResponseWriter, r *http.Request) {
	store, err := getStore()
	if err != nil {
		log.Print(err)
		http.Error(w,
			"Something went wrong with your session",
			http.StatusInternalServerError,
		)
		return
	}
	defer store.Close()

	session, err := store.Get(r, "session-gda")
	if err != nil {
		log.Print(err)
		http.Error(w,
			"Something went wrong with your session",
			http.StatusInternalServerError,
		)
		return
	}

	session.Options.MaxAge = -1
	err = session.Save(r, w)
	if err != nil {
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

func checkSession(w http.ResponseWriter, r *http.Request) {
	store, err := getStore()
	if err != nil {
		log.Print(err)
		http.Error(w,
			"Something went wrong with your session",
			http.StatusInternalServerError,
		)
		return
	}
	defer store.Close()

	session, err := store.Get(r, "session-gda")
	if err != nil {
		log.Print(err)
		http.Error(w,
			"Something went wrong with your session",
			http.StatusInternalServerError,
		)
		return
	}

	val := session.Values["ldap_name"]
	if val == nil {
		// http.Redirect(w, r, "/login", http.StatusSeeOther)

		w.WriteHeader(http.StatusUnauthorized)
		w.Write([]byte("no session"))
		return
	}

	name := val.(string)
	w.Write([]byte(name))
	return
}
