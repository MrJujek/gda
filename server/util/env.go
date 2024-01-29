package util

import (
	"log"
	"os"

	_ "github.com/joho/godotenv/autoload"
)

// Function which returns the env or default value if env is missing
func EnvOr(env, defValue string) string {
	value, ok := os.LookupEnv(env)
	if !ok {
		value = defValue
	}

	return value
}

// Function which returns the env or exits with error message if env is missing
func EnvExit(env string) string {
	value, ok := os.LookupEnv(env)
	if !ok {
		log.Fatalf("Variable %v is not set", env)
	}

	return value
}
