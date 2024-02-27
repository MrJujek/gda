package controller

import (
	"log"
	"net/http"
	"os"
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

	_, err := os.Stat(UploadDir)
	if err != nil {
		if os.IsNotExist(err) {
			err := os.MkdirAll(UploadDir, 0700)
			if err != nil {
				panic("Unable create data directory")
			}
		} else {
			panic("Unable check if data directory exists")
		}
	}

	dMux := http.NewServeMux()

	dMux.Handle("GET /", http.FileServer(http.Dir("./public")))

	dMux.HandleFunc("POST /api/session", login)
	dMux.HandleFunc("DELETE /api/session", logout)
	dMux.HandleFunc("GET /api/session", checkSession)

	dMux.HandleFunc("GET /api/users", userList)
	dMux.HandleFunc("GET /api/users/photo", userPhoto)

	dMux.HandleFunc("GET /api/my/salt", getSalt)
	dMux.HandleFunc("GET /api/my/keys", getKeys)
	dMux.HandleFunc("POST /api/my/keys", addKeys)
	dMux.HandleFunc("GET /api/my/chats", chatList)

	dMux.HandleFunc("GET /api/chat/metadata", getChat)
	dMux.HandleFunc("POST /api/chat", newChat)
	dMux.HandleFunc("GET /api/chat/messages", getMessages)
	dMux.HandleFunc("GET /api/chat", websocketChat)

	dMux.HandleFunc("POST /api/file", uploadFile)
	dMux.HandleFunc("GET /api/file", getFile)

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
