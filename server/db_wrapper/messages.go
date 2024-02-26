package db_wrapper

import (
	"context"
	"fmt"
)

func SaveMessage(ctx context.Context, msg Message, userId uint32) (Message, error) {
	var newMsg Message

	db, err := getDbConn()
	if err != nil {
		return newMsg, err
	}
	defer db.Close()

	tableName, err := msg.TableName()
	if err != nil {
		return newMsg, err
	}

	query := fmt.Sprintf(`
        INSERT INTO %v (author_id, msg_type, encrypted, text, file_uuid) 
        VALUES($1, $2, $3, $4, $5) 
        RETURNING *`,
		tableName)

	row := db.QueryRowx(query, userId, msg.MsgType, msg.Encrypted, msg.Text, msg.FileUUID)
	err = row.StructScan(&newMsg)
	if err != nil {
		return newMsg, err
	}

	return newMsg, err
}

const MessageNum = 100

func GetMessages(tableName string, pagination uint32) ([]Message, error) {
	var msgs []Message

	db, err := getDbConn()
	if err != nil {
		return msgs, err
	}
	defer db.Close()

	query := fmt.Sprintf(
		"SELECT * FROM %v WHERE message_id > $1 ORDER BY message_id ASC LIMIT %v",
		tableName, MessageNum,
	)

	err = db.Select(&msgs, query, pagination)
	if err != nil {
		return msgs, err
	}

	return msgs, nil
}
