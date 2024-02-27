package controller

import (
	"encoding/json"
	"log"
	"net/http"
	db "server/db_wrapper"
	"server/util"
	"slices"
	"strconv"

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

		chat_uuid, err = db.CreateDirectChat(data.UserIds[0], data.UserIds[1])
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
	w.Write([]byte(chat_uuid.String()))
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

func getChat(w http.ResponseWriter, r *http.Request) {
	ok, userId := isLoggedIn(r)
	if !ok {
		unauthorizedMessage(w)
		return
	}

	chatUUIDStr := r.URL.Query().Get("chat-uuid")
	if chatUUIDStr == "" {
		http.Error(w, "Provide valid chat-uuid", http.StatusBadRequest)
		return
	}
	chatUUID, err := uuid.Parse(chatUUIDStr)
	if err != nil {
		http.Error(w, "UUID you provided couldn't be parsed", http.StatusBadRequest)
		return
	}

	chat, err := db.GetChat(userId, chatUUID)
	if err != nil {
		unauthorizedMessage(w)
		return
	}

	data, err := json.Marshal(chat)
	if err != nil {
		http.Error(w, "We were unable to get your chat", http.StatusInternalServerError)
		return
	}

	w.Header().Add("Content-Type", "application/json")
	w.Write(data)
}

func getMessages(w http.ResponseWriter, r *http.Request) {
	var lastMessage int64 = 0
	var err error

	ok, userId := isLoggedIn(r)
	if !ok {
		unauthorizedMessage(w)
		return
	}

	chatUuidStr := r.URL.Query().Get("chat")
	if chatUuidStr == "" {
		if err != nil {
			http.Error(w, "Chat uuid not provided", http.StatusBadRequest)
			return
		}
	}

	chatUUID, err := uuid.Parse(chatUuidStr)
	if err != nil {
		http.Error(w, "We were unable to parse uuid you provided", http.StatusBadRequest)
		return
	}

	ok = db.UserHasAccessToChat(userId, chatUUID)
	if !ok {
		unauthorizedMessage(w)
		return
	}

	messageTable := util.UUIDToMessageTable(chatUUID)

	lastMessageStr := r.URL.Query().Get("last-message")
	if lastMessageStr != "" {
		lastMessage, err = strconv.ParseInt(lastMessageStr, 10, 64)
		if err != nil {
			http.Error(w, "Last message parameter you provided is wrong", http.StatusBadRequest)
			return
		}
	}

	messages, err := db.GetMessages(messageTable, uint32(lastMessage))
	if err != nil {
		log.Print(err)
		http.Error(w, "We were unable to get requested messages", http.StatusBadRequest)
		return
	}

	body, err := json.Marshal(messages)
	if err != nil {
		http.Error(w, "We couldn't get list of your chats. Please try again later.", http.StatusInternalServerError)
		return
	}

	w.Header().Add("Content-Type", "application/json")
	w.Write(body)
}
