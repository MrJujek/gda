package db_wrapper

func AddKeys(id uint32, pubKey, passEncPrivKey, codeEncPrivKey string) error {
	db, err := getDbConn()
	if err != nil {
		return err
	}
	defer db.Close()

	_, err = db.Exec(`
        UPDATE users
        SET
            public_key = decode($1, 'base64'),
            pass_priv_key = decode($2, 'base64'),
            code_priv_key = decode($3, 'base64')
        WHERE id = $4
    `, pubKey, passEncPrivKey, codeEncPrivKey, id)

	return err
}

func IncrementUserStatus(id uint32) (int, error) {
	var ac = 0
	db, err := getDbConn()
	if err != nil {
		return ac, err
	}
	defer db.Close()

	row := db.QueryRowx(`
        UPDATE users
        SET active_count = active_count + 1
        WHERE id = $1
        RETURNING active_count
    `, id)
	err = row.Scan(&ac)

	return ac, err
}

func DecrementUserStatus(id uint32) (int, error) {
	var ac = 0
	db, err := getDbConn()
	if err != nil {
		return ac, err
	}
	defer db.Close()

	row := db.QueryRowx(`
        UPDATE users
        SET active_count = active_count - 1
        WHERE id = $1
        RETURNING active_count
    `, id)
	err = row.Scan(&ac)

	return ac, err
}
