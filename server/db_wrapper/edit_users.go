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
