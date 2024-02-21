package db_wrapper

import (
	"database/sql"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/google/uuid"
)

type Chat struct {
	ChatUUID  uuid.UUID      `db:"chat_uuid"`
	Encrypted bool           `db:"encrypted"`
	Group     bool           `db:"is_group"`
	GroupName sql.NullString `db:"group_name"`
}

type MessageType string

const (
	MessageText  SessionType = "text"
	MessageFile  SessionType = "file"
	MessageImage SessionType = "image"
)

type Message struct {
	Id        uint32         `db:"message_id"`
	AuthorId  uint32         `db:"author_id"`
	Timestamp time.Time      `db:"timestamp"`
	MsgType   MessageType    `db:"msg_type"`
	Encrypted bool           `db:"encrypted"`
	Text      sql.NullString `db:"text"`
	FileUUID  uuid.NullUUID  `db:"file_uuid"`
}

func CreateDirectChat() (uuid.UUID, error) {
	var (
		uuid uuid.UUID
		chat Chat
	)

	db, err := getDbConn()
	if err != nil {
		return uuid, err
	}

	tx, err := db.Beginx()
	if err != nil {
		return uuid, err
	}

	row := tx.QueryRowx("INSERT INTO chats DEFAULT VALUES RETURNING *")
	err = row.StructScan(&chat)
	if err != nil {
		nErr := tx.Rollback()
		if nErr != nil {
			return uuid, nErr
		}

		return uuid, err
	}

	query := fmt.Sprintf("CREATE TABLE messages_%v (like messages)", strings.ReplaceAll(chat.ChatUUID.String(), "-", ""))

	_, err = tx.Exec(query)
	if err != nil {
		nErr := tx.Rollback()
		if nErr != nil {
			return uuid, nErr
		}

		return uuid, err
	}

	err = tx.Commit()
	if err != nil {
		return uuid, err
	}

	log.Printf("Chat %v created", chat.ChatUUID)

	return chat.ChatUUID, nil
}

func CreateGroupChat(name string) (uuid.UUID, error) {
	var (
		uuid uuid.UUID
		chat Chat
	)

	db, err := getDbConn()
	if err != nil {
		return uuid, err
	}

	tx, err := db.Beginx()
	if err != nil {
		return uuid, err
	}

	row := tx.QueryRowx("INSERT INTO chats (is_group, group_name) VALUES (true, $1) RETURNING *", name)
	err = row.StructScan(&chat)
	if err != nil {
		nErr := tx.Rollback()
		if nErr != nil {
			return uuid, nErr
		}

		return uuid, err
	}

	query := fmt.Sprintf("CREATE TABLE messages_%v (like messages)", strings.ReplaceAll(chat.ChatUUID.String(), "-", ""))

	_, err = tx.Exec(query)
	if err != nil {
		nErr := tx.Rollback()
		if nErr != nil {
			return uuid, nErr
		}

		return uuid, err
	}

	err = tx.Commit()
	if err != nil {
		return uuid, err
	}

	log.Printf("Chat %v created", chat.ChatUUID)

	return chat.ChatUUID, nil
}

func JoinChat(chat_uuid uuid.UUID, user_ids ...uint32) error {
	db, err := getDbConn()
	if err != nil {
		return err
	}

	tx, err := db.Beginx()
	if err != nil {
		return err
	}

	for _, id := range user_ids {
		_, err = tx.Exec("INSERT INTO users_chats (chat_uuid, user_id) VALUES ($1, $2)", chat_uuid, id)
		if err != nil {
			nErr := tx.Rollback()
			if nErr != nil {
				return nErr
			}
			return err
		}
	}

	err = tx.Commit()
	if err != nil {
		return err
	}

	return nil
}

func UserChats(user_id uint32) ([]Chat, error) {
	var chats []Chat

	db, err := getDbConn()
	if err != nil {
		return chats, err
	}

	err = db.Select(&chats, `
        SELECT c.* 
        FROM chats c 
        INNER JOIN users_chats ON users_chats.chat_uuid = c.chat_uuid 
        WHERE users_chats.user_id = $1`,
		user_id)
	if err != nil {
		return chats, err
	}

	return chats, nil
}
