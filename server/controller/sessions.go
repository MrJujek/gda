package controller

import (
	"net/http"
	db "server/db_wrapper"
	"time"
)

// TODO add uuid encryption

const sessionName string = "gda-session"

func getNewCookie(value string, maxAge int) *http.Cookie {
	return &http.Cookie{
		Name:     sessionName,
		Value:    value,
		MaxAge:   maxAge,
		SameSite: http.SameSiteStrictMode,
		Path:     "/",
		Secure:   true,
		HttpOnly: true,
	}
}

func getSession(r *http.Request) (db.Session, error) {
	cookie, err := r.Cookie(sessionName)
	if err != nil {
		return db.Session{}, err
	}

	session, err := db.GetSession(cookie.Value)
	if err != nil {
		return session, err
	}

	return session, nil
}

func delSession(w http.ResponseWriter, r *http.Request) error {
	cookie, err := r.Cookie(sessionName)
	if err != nil {
		return err
	}

	uuidString := cookie.Value

	err = db.DelSession(uuidString)
	if err != nil {
		return err
	}

	newCookie := getNewCookie("", -1)
	http.SetCookie(w, newCookie)

	return nil
}

func newSession(w http.ResponseWriter, id uint32, sessionType db.SessionType) error {
	var cookieUUID *http.Cookie

	session, err := db.NewSession(id, sessionType)
	if err != nil {
		return err
	}

	if sessionType != db.SessionNormal {
		cookieUUID = getNewCookie(session.UUID.String(), int(db.SpecialLoginMaxLength))
	} else {
		cookieUUID = getNewCookie(session.UUID.String(), int(db.NormalLoginMaxLength))
	}

	http.SetCookie(w, cookieUUID)

	return nil
}

func isLoggedIn(r *http.Request) (bool, uint32) {
	s, err := getSession(r)
	if err != nil {
		return false, 0
	}

	// log.Print(s.ExpiresAt.In(time.Local))
	if s.ExpiresAt.Before(time.Now()) {
		return false, 0
	}

	// think about it...
	if s.Type != db.SessionNormal {
		return false, 0
	}

	return true, s.UserId
}

func unauthorizedMessage(w http.ResponseWriter) {
	http.Error(w, "You are not authorized to access this resource.", http.StatusUnauthorized)
}
