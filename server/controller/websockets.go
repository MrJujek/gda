package controller

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	db "server/db_wrapper"
	t "server/types"
	"time"

	"github.com/google/uuid"
	"nhooyr.io/websocket"
)

type connWithUserId struct {
	Conn   *websocket.Conn
	UserId uint32
}

var allConn = []connWithUserId{}
var connMap = make(map[uuid.UUID][]connWithUserId)

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

	log.Printf("User #%v connection from %v established", userId, r.RemoteAddr)

	ctx, cancel := context.WithTimeout(r.Context(), time.Minute*5)
	defer cancel()

	updateActivityState(ctx, conn, userId, true)
	defer updateActivityState(ctx, conn, userId, false)

	chats, err := db.UserChats(userId)
	if err != nil {
		http.Error(w, "Unable to get list of chats for you", http.StatusInternalServerError)
	}

	allConn = append(allConn, connWithUserId{conn, userId})
	for _, chat := range chats {
		connMap[chat.ChatUUID] = append(connMap[chat.ChatUUID], connWithUserId{conn, userId})
	}

	for {
		var req t.WsRequest

		_, data, err := conn.Read(ctx)
		if websocket.CloseStatus(err) != -1 {
			log.Printf("User #%v connection with %v closed", userId, r.RemoteAddr)
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
		// case t.WsTypeActivity:
		// 	var conf t.WsAtivity
		// 	req := t.WsRequest{Data: &conf}
		// 	err = json.Unmarshal(data, &req)
		// 	if err != nil {
		// 		badRequest(conn, ctx)
		// 		break
		// 	}
		//
		// 	log.Print("config")
		// 	log.Print(conf)
		// 	break
		case t.WsTypeMessage:
			var msg db.Message
			req := t.WsRequest{Data: &msg}
			err = json.Unmarshal(data, &req)
			if err != nil {
				log.Print(err)
				badRequest(conn, ctx)
				break
			}

			chatUUID := *msg.ChatUUID
			ok := db.UserHasAccessToChat(userId, chatUUID)
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

			newData, _ := json.Marshal(t.WsRequest{
				Type: t.WsTypeMessage,
				Data: msg,
			})

			conns := connMap[chatUUID]
			for _, conn := range conns {
				conn.Conn.Write(ctx, websocket.MessageText, newData)
			}

			break
		}

		// log.Printf("Received %v from %v", req, r.RemoteAddr)
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

func updateActivityState(ctx context.Context, currConn *websocket.Conn, userId uint32, active bool) {
	if active {
		n, err := db.IncrementUserStatus(userId)
		if err != nil {
			log.Print(err)
			return
		}
		if n == 1 {
			for _, conn := range allConn {
				data, _ := json.Marshal(t.WsRequest{
					Type: t.WsTypeActivity,
					Data: t.WsAtivity{
						UserId: userId,
						Active: active,
					},
				})
				conn.Conn.Write(ctx, websocket.MessageText, data)
			}
		}
		return
	}

	// removing connection from list and map
	for k, v := range connMap {
		for _, c := range v {
			if c.Conn == currConn {
				delete(connMap, k)
			}
		}
	}
	for i, c := range allConn {
		if c.Conn == currConn {
			allConn[i] = allConn[len(allConn)-1]
			allConn = allConn[:len(allConn)-1]
		}
	}

	n, err := db.DecrementUserStatus(userId)
	if err != nil {
		log.Print(err)
		return
	}
	if n == 0 {
		for _, conn := range allConn {
			data, _ := json.Marshal(t.WsRequest{
				Type: t.WsTypeActivity,
				Data: t.WsAtivity{
					UserId: userId,
					Active: active,
				},
			})
			conn.Conn.Write(ctx, websocket.MessageText, data)
		}
	}

}
