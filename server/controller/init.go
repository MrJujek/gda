package controller

import (
	"log"
	"net/http"
	u "server/util"
)

var (
	key string
)

func InitRouter() {
	port := u.EnvOr("GDA_PORT", "80")
	// key = u.EnvExit("SESSION_KEY")
	dMux := http.NewServeMux()

	dMux.HandleFunc("POST /api/session", login)
	dMux.HandleFunc("DELETE /api/session", logout)
	dMux.HandleFunc("GET /api/session", checkSession)

	dMux.HandleFunc("GET /api/users", userList)

	dMux.HandleFunc("GET /api/chat", func(w http.ResponseWriter, r *http.Request) {
		// TODO
		w.Write([]byte("chat"))
	})

	dServer := &http.Server{
		Addr:    ":" + port,
		Handler: dMux,
	}

	log.Print("Server listening on port " + port)
	dServer.ListenAndServe()
}
