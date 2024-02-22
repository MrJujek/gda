package encryption

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/ecdsa"
	"crypto/sha256"
	"crypto/x509"
	"fmt"
	db "server/db_wrapper"

	"golang.org/x/crypto/pbkdf2"
)

// hard stuff...
func CheckIfPasswordMatches(user db.User, pass string) (bool, error) {
	return true, nil
	// change later

	passBytes := []byte(pass)
	key := pbkdf2.Key(passBytes, user.Salt, encryptionIterations, keyLength, sha256.New)

	block, err := aes.NewCipher(key)
	if err != nil {
		return false, err
	}

	if !user.PublicKey.Valid || !user.PassEncPrivateKey.Valid {
		return false, fmt.Errorf("Public or private key doesn't exist")
	}

	if len(user.PassEncPrivateKey.V) < aes.BlockSize {
		return false, fmt.Errorf("IV not included with encrypted key")
	}

	iv := user.PassEncPrivateKey.V[:aes.BlockSize]
	ciphertext := user.PassEncPrivateKey.V[aes.BlockSize:]

	if len(ciphertext)%aes.BlockSize != 0 {
		return false, fmt.Errorf("Private key is corrupted")
	}

	mode := cipher.NewCBCDecrypter(block, iv)
	mode.CryptBlocks(ciphertext, ciphertext)

	publicKey, err := user.GetPublicKey()
	if err != nil {
		return false, err
	}

	anyPrivateKey, err := x509.ParsePKCS8PrivateKey(ciphertext)
	if err != nil {
		return false, err
	}

	privateKey, ok := anyPrivateKey.(*ecdsa.PrivateKey)
	if !ok {
		return false, nil
	}

	if !privateKey.PublicKey.Equal(publicKey) {
		return false, nil
	}

	return true, nil
}
