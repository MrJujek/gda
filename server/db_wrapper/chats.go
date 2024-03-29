package db_wrapper

import (
	"database/sql"
	"fmt"
	"log"
	"regexp"
	"strings"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
)

func createMessageTable(tx *sqlx.Tx, chat *Chat) error {
	tableName := "messages_" + strings.ReplaceAll(chat.ChatUUID.String(), "-", "")
	re := regexp.MustCompile(`<<t>>`)
	query := `
        CREATE TABLE IF NOT EXISTS <<t>> (LIKE messages INCLUDING ALL);
		CREATE SEQUENCE <<t>>_message_id_seq START 1;
		ALTER TABLE <<t>>
            ALTER COLUMN message_id SET DEFAULT nextval('<<t>>_message_id_seq'::regclass),
            ADD CONSTRAINT <<t>>_author_id_fkey FOREIGN KEY (author_id) REFERENCES users (id);
		ALTER SEQUENCE <<t>>_message_id_seq OWNED BY <<t>>.message_id;
        `

	query = string(re.ReplaceAll([]byte(query), []byte(tableName)))

	_, err := tx.Query(query)
	if err != nil {
		fmt.Print(err)
		nErr := tx.Rollback()
		if nErr != nil {
			return nErr
		}

		return err
	}

	return nil
}

func CreateDirectChat(userId1, userId2 uint32) (uuid.UUID, error) {
	var (
		uuid uuid.UUID
		chat Chat
	)

	db, err := getDbConn()
	if err != nil {
		return uuid, err
	}
	defer db.Close()

	tx, err := db.Beginx()
	if err != nil {
		return uuid, err
	}

	err = db.QueryRowx(`
        SELECT uc.chat_uuid
	        FROM users_chats uc
	        INNER JOIN chats ch ON ch.chat_uuid = uc.chat_uuid 
	        WHERE ch.is_group = false AND (user_id = $1 OR user_id = $2)
	        GROUP BY uc.chat_uuid
	        HAVING COUNT(DISTINCT user_id) = 2;
        `, userId1, userId2).Scan(&uuid)
	if err != nil && err != sql.ErrNoRows {
		return uuid, err
	}

	if err == nil {
		return uuid, nil
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

	err = createMessageTable(tx, &chat)
	if err != nil {
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
	defer db.Close()

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

	err = createMessageTable(tx, &chat)
	if err != nil {
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
	defer db.Close()

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
	defer db.Close()

	err = db.Select(&chats, `
        SELECT c.*
            FROM chats c 
            INNER JOIN users_chats uc ON uc.chat_uuid = c.chat_uuid 
            WHERE uc.user_id = $1
		    GROUP BY c.chat_uuid`,
		user_id)
	if err != nil {
		return chats, err
	}

	return chats, nil
}

func GetChat(userId uint32, chatUUID uuid.UUID) (Chat, error) {
	var chat Chat
	db, err := getDbConn()
	if err != nil {
		return chat, err
	}
	defer db.Close()

	var okInt int
	err = db.QueryRowx(
		"SELECT 1 FROM users_chats WHERE user_id = $1 AND chat_uuid = $2",
		userId, chatUUID,
	).Scan(&okInt)
	if err != nil {
		return chat, fmt.Errorf("Unauthorized")
	}

	err = db.QueryRowx(
		"SELECT * FROM chats WHERE chat_uuid = $1",
		chatUUID,
	).Scan(&chat)
	if err != nil {
		return chat, err
	}

	return chat, nil
}

func UserHasAccessToChat(userId uint32, chatUUID uuid.UUID) bool {
	db, err := getDbConn()
	if err != nil {
		return false
	}
	defer db.Close()

	var okInt int
	err = db.QueryRowx(
		"SELECT 1 FROM users_chats WHERE user_id = $1 AND chat_uuid = $2",
		userId, chatUUID,
	).Scan(&okInt)
	if err != nil {
		return false
	}

	return true
}
