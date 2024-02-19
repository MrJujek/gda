package controller

import (
	"log"
	"net/http"
	u "server/util"
)

var (
// key string
)

const (
	RedirectAfterFirstLogin = "/first_login.html"
	RedirectAfterLogin      = "/chat.html"
	RedirectAfterPassChange = "/reencrypt.html"
)

func InitRouter() {
	port := u.EnvOr("GDA_PORT", "80")
	enableSecureServer := u.EnvOrInt("GDA_SECURE_SERVER", 0)
	securePort := u.EnvOr("GDA_SECURE_PORT", "443")
	certPath := u.EnvOr("GDA_CERT_PATH", "./config/server.crt")
	keyPath := u.EnvOr("GDA_KEY_PATH", "./config/server.key")
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

	if enableSecureServer != 0 {
		sServer := &http.Server{
			Addr:    ":" + securePort,
			Handler: dMux,
		}

		log.Print("Secure server listening on port " + securePort)
		go sServer.ListenAndServeTLS(certPath, keyPath)

		server := &http.Server{
			Addr: ":" + port,
			Handler: http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
                // can be done better for sure but good enough for now
				http.Redirect(w, r, "https://"+r.Host+r.URL.String(), http.StatusMovedPermanently)
			}),
		}

		log.Print("Server listening on port " + port)
		server.ListenAndServe()
	} else {
		server := &http.Server{
			Addr:    ":" + port,
			Handler: dMux,
		}

		log.Print("Server listening on port " + port)
		server.ListenAndServe()
	}

}
