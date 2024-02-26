package db_wrapper

import "github.com/google/uuid"

type DbFile struct {
	UUID       uuid.UUID `db:"file_uuid"`
	ChatUUID   uuid.UUID `db:"chat_uuid"`
	UploaderId uint32    `db:"uploader_id"`
	Name       string    `db:"file_name"`
}

func AddFileMetadata(userId uint32, chatUUID uuid.UUID, name string) (uuid.UUID, error) {
	var f DbFile

	db, err := getDbConn()
	if err != nil {
		return f.UUID, err
	}
	defer db.Close()

	row := db.QueryRowx(
		"INSERT INTO files (uploader_id, chat_uuid, file_name) VALUES ($1, $2, $3) RETURNING *",
		userId, chatUUID, name,
	)
	err = row.StructScan(&f)
	if err != nil {
		return f.UUID, err
	}

	return f.UUID, nil
}

func GetFileMetadata(fileUUID uuid.UUID) (DbFile, error) {
	var f DbFile

	db, err := getDbConn()
	if err != nil {
		return f, err
	}
	defer db.Close()

	row := db.QueryRowx("SELECT * FROM files WHERE file_uuid = $1", fileUUID)
	err = row.StructScan(&f)
	if err != nil {
		return f, err
	}

	return f, nil
}
