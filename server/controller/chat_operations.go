package controller

import (
	"encoding/json"
	"log"
	"net/http"
	db "server/db_wrapper"
	"slices"

	"github.com/google/uuid"
)

type createChat struct {
	UserIds   []uint32 `json:"UserIds"`
	Group     bool     `json:"Group"`
	GroupName string   `json:"GroupName"`
}

func newChat(w http.ResponseWriter, r *http.Request) {
	var (
		chat_uuid uuid.UUID
		data      createChat
	)

	ok, userId := isLoggedIn(r)
	if !ok {
		unauthorizedMessage(w)
		return
	}

	d := json.NewDecoder(r.Body)
	err := d.Decode(&data)
	if err != nil {
		http.Error(w, "There was something wrong with your request body", http.StatusBadRequest)
		return
	}

	if !slices.Contains(data.UserIds, userId) {
		data.UserIds = append(data.UserIds, userId)
	}

	if data.Group {
		if len(data.UserIds) <= 2 {
			http.Error(w, "You provided to few user ids", http.StatusBadRequest)
			return
		}

		if data.GroupName == "" {
			http.Error(w, "The group name you provided was to short", http.StatusBadRequest)
			return
		}

		chat_uuid, err = db.CreateGroupChat(data.GroupName)
		if err != nil {
			log.Print(err)
			http.Error(w, "We couldn't create a chat for you. Please try again later.", http.StatusInternalServerError)
			return
		}
	} else {
		if len(data.UserIds) != 2 {
			http.Error(w, "You provided wrong number of user ids", http.StatusBadRequest)
			return
		}

		chat_uuid, err = db.CreateDirectChat()
		if err != nil {
			http.Error(w, "We couldn't create a chat for you. Please try again later.", http.StatusInternalServerError)
			return
		}

	}

	err = db.JoinChat(chat_uuid, data.UserIds...)
	if err != nil {
		http.Error(w, "We couldn't create a chat for you. Please try again later.", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func chatList(w http.ResponseWriter, r *http.Request) {
	ok, userId := isLoggedIn(r)
	if !ok {
		unauthorizedMessage(w)
		return
	}

	chats, err := db.UserChats(userId)
	if err != nil {
		log.Print(err)
		http.Error(w, "We couldn't get list of your chats. Please try again later.", http.StatusInternalServerError)
		return
	}

	body, err := json.Marshal(chats)
	if err != nil {
		http.Error(w, "We couldn't get list of your chats. Please try again later.", http.StatusInternalServerError)
		return
	}

	w.Header().Add("Content-Type", "application/json")
	w.Write(body)
}
