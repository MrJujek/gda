package ldap_wrapper

import (
	"fmt"
	"log"

	"github.com/go-ldap/ldap/v3"
)

func UserImage(userDn string) ([]byte, error) {
	var imageData []byte

	l, err := getLdapConn()
	if err != nil {
		log.Print(err)
		return imageData, err
	}
	defer l.Close()

	searchRequest := ldap.NewSearchRequest(
		userDn,
		ldap.ScopeBaseObject,
		ldap.NeverDerefAliases,
		0,
		0,
		false,
		"(objectClass=*)",
		[]string{imageAttr},
		nil,
	)

	sr, err := l.Search(searchRequest)
	if err != nil {
		return imageData, err
	}

	if len(sr.Entries) != 1 {
		return imageData, fmt.Errorf("Search returned wrong number of entries")
	}

	imageData = sr.Entries[0].GetRawAttributeValue(imageAttr)
	return imageData, nil
}
