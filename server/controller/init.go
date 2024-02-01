package controller

import (
	"log"
	"net/http"
	u "server/util"

	"github.com/gorilla/mux"
	// "github.com/gorilla/websocket"
)

var (
	key string
)

func InitRouter() {
	port := u.EnvOr("GDA_PORT", "80")
	key = u.EnvExit("SESSION_KEY")
	r := mux.NewRouter()

	r.HandleFunc("/api/session", login).Methods("POST")
	r.HandleFunc("/api/session", logout).Methods("DELETE")
	r.HandleFunc("/api/session", checkSession).Methods("GET")
	r.HandleFunc("/api/chat", func(w http.ResponseWriter, r *http.Request) {
		// TODO
		w.Write([]byte("chat"))
	})

	http.Handle("/", r)

	log.Print("Server listening on port " + port)
	http.ListenAndServe(":"+port, nil)
}
