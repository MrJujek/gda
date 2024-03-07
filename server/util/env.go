package util

import (
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/google/uuid"
	_ "github.com/joho/godotenv/autoload"
)

// Function which returns the env or default value if env is missing
func EnvOr(env, defValue string) string {
	value, ok := os.LookupEnv(env)
	if !ok {
		return defValue
	}

	return value
}

// Function which returns the env or default value if env is missing
func EnvOrInt(env string, defValue int) int {
	stringValue, ok := os.LookupEnv(env)
	if !ok {
		return defValue
	}

	value, err := strconv.ParseInt(stringValue, 10, 64)
	if err != nil {
		log.Fatalf("Variable %v is not an integer", env)
	}
	return int(value)
}

// Function which returns the env or exits with error message if env is missing
func EnvExit(env string) string {
	value, ok := os.LookupEnv(env)
	if !ok {
		log.Fatalf("Variable %v is not set", env)
	}

	return value
}

func UUIDToMessageTable(ChatUUID uuid.UUID) string {
	return "messages_" + strings.ReplaceAll(ChatUUID.String(), "-", "")
}
