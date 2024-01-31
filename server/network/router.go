package network

import (
	"log"
	"net/http"
	u "server/util"

	"github.com/gorilla/mux"
)

var (
	key string
)

func InitRouter() {
	port := u.EnvOr("GDA_PORT", "80")
	key = u.EnvExit("SESSION_KEY")
	r := mux.NewRouter()

	http.Handle("/", r)

	log.Print("Server listening on port " + port)
	http.ListenAndServe(":"+port, nil)
}
