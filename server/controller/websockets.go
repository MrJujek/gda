package controller

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	db "server/db_wrapper"
	t "server/types"
	"time"

	"nhooyr.io/websocket"
)

func websocketChat(w http.ResponseWriter, r *http.Request) {
	ok, userId := isLoggedIn(r)
	if !ok {
		unauthorizedMessage(w)
		return
	}

	conn, err := websocket.Accept(w, r, nil)
	if err != nil {
		return
	}
	defer conn.Close(websocket.StatusInternalError, "Closing connection")

	log.Printf("WebSocket connection established by user #%v", userId)

	if err = db.IncrementUserStatus(userId); err != nil {
		fmt.Print(err)
	}

	ctx, cancel := context.WithTimeout(r.Context(), time.Minute*5)
	defer cancel()

	for {
		var req t.WsRequest

		_, data, err := conn.Read(ctx)
		if websocket.CloseStatus(err) != -1 {
			db.DecrementUserStatus(userId)
			log.Printf("Connection with %v closed", r.RemoteAddr)
			return
		}
		if err != nil {
			badRequest(conn, ctx)
			break
		}

		err = json.Unmarshal(data, &req)
		if err != nil {
			badRequest(conn, ctx)
			break
		}

		switch req.Type {
		case t.WsTypeConfig:
			var conf t.WsConfig
			req := t.WsRequest{Data: &conf}
			err = json.Unmarshal(data, &req)
			if err != nil {
				badRequest(conn, ctx)
				break
			}

			log.Print("config")
			log.Print(conf)
			break
		case t.WsTypeMessage:
			var msg db.Message
			req := t.WsRequest{Data: &msg}
			err = json.Unmarshal(data, &req)
			if err != nil {
				log.Print(err)
				badRequest(conn, ctx)
				break
			}

			ok := db.UserHasAccessToChat(userId, *msg.ChatUUID)
			if !ok {
				unauthorizedWs(conn, ctx)
				break
			}

			msg, err = db.SaveMessage(ctx, msg, userId)
			if err != nil {
				log.Print(err)
				badRequest(conn, ctx)
				break
			}

			log.Print("message")
			log.Print(msg)
			break
		}

		log.Printf("Received %v from %v", req, r.RemoteAddr)
	}
}

func badRequest(conn *websocket.Conn, ctx context.Context) error {
	msg := t.WsRequest{
		Type: t.WsTypeError,
		Data: "bad request",
	}

	data, err := json.Marshal(msg)
	if err != nil {
		return err
	}

	err = conn.Write(ctx, websocket.MessageText, data)
	return err
}

func unauthorizedWs(conn *websocket.Conn, ctx context.Context) error {
	msg := t.WsRequest{
		Type: t.WsTypeError,
		Data: "You are unauthorized",
	}

	data, err := json.Marshal(msg)
	if err != nil {
		return err
	}

	err = conn.Write(ctx, websocket.MessageText, data)
	return err
}
