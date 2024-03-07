package types

import (
	"strings"

	"github.com/google/uuid"
)

type WsType string

type WsRequest struct {
	Type WsType
	Data interface{}
}

type WsMessage struct {
	ChatUUID  uuid.UUID
	AuthorId  uint32
	Message   string
	Encrypted bool
}

func (msg *WsMessage) TableName() string {
	return "messages_" + strings.ReplaceAll(msg.ChatUUID.String(), "-", "")
}

type WsAtivity struct {
	UserId uint32
	Active bool
}
