package encryption

import (
	u "server/util"
)

var (
	encryptionIterations int
	keyLength            int
)

func Init() {
	encryptionIterations = u.EnvOrInt("PBKDF2_ITERATIONS", 10000)
	keyLength = u.EnvOrInt("PBKDF2_KEY_LENGTH", 32)
}
