package controller

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path"
	db "server/db_wrapper"

	"github.com/google/uuid"
)

const UploadDir = "data"

func uploadFile(w http.ResponseWriter, r *http.Request) {
	ok, userId := isLoggedIn(r)
	if !ok {
		unauthorizedMessage(w)
		return
	}

	chatStr := r.FormValue("chat-uuid")
	if chatStr == "" {
		http.Error(w, "You didn't provide valid chat-uuid", http.StatusBadRequest)
		return
	}

	chatUUID, err := uuid.Parse(chatStr)
	if err != nil {
		http.Error(w, "We were unable to parse chat uuid", http.StatusBadRequest)
		return
	}

	ok = db.UserHasAccessToChat(userId, chatUUID)
	if !ok {
		unauthorizedMessage(w)
		return
	}

	file, fileHeader, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "We were unable to parse the file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	uuid, err := db.AddFileMetadata(userId, chatUUID, fileHeader.Filename)
	if err != nil {
		http.Error(w, "We were unable to save file metadata to database", http.StatusInternalServerError)
		return
	}

	newFile, err := os.Create(path.Join(UploadDir, uuid.String()))
	if err != nil {
		http.Error(w, "We were unable to create file on the server", http.StatusInternalServerError)
		return
	}

	_, err = io.Copy(newFile, file)
	if err != nil {
		http.Error(w, "We were unable to copying file data to server", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(uuid.String()))
}

func getFile(w http.ResponseWriter, r *http.Request) {
	ok, userId := isLoggedIn(r)
	if !ok {
		unauthorizedMessage(w)
		return
	}

	fileUuidStr := r.URL.Query().Get("uuid")
	if fileUuidStr == "" {
		http.Error(w, "You didn't provide valid uuid", http.StatusBadRequest)
		return
	}

	fileUUID, err := uuid.Parse(fileUuidStr)
	if err != nil {
		http.Error(w, "You didn't provide valid uuid", http.StatusBadRequest)
		return
	}

	fileMetadata, err := db.GetFileMetadata(fileUUID)
	if err != nil {
		http.Error(w, "We couldn't find file with given uuid", http.StatusBadRequest)
		return
	}

	ok = db.UserHasAccessToChat(userId, fileMetadata.ChatUUID)
	if !ok {
		unauthorizedMessage(w)
		return
	}

	w.Header().Set("Content-Disposition", fmt.Sprintf(`filename="%s"`, fileMetadata.Name))
	http.ServeFile(w, r, path.Join(UploadDir, fileMetadata.UUID.String()))
}
