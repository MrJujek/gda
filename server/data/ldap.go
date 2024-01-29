package data

import (
	"fmt"
	"log"
	u "server/util"

	"github.com/go-ldap/ldap/v3"
)

var (
	l        *ldap.Conn
	bindUser string
	bindPass string
	basedn   string
)

func InitLDAP() {
	url := u.EnvExit("LDAP_URL")
	bindUser = u.EnvExit("LDAP_USER")
	bindPass = u.EnvExit("LDAP_PASS")
	basedn = u.EnvExit("LDAP_BASE_DN")
	var err error

	l, err = ldap.DialURL(url)
	if err != nil {
		log.Fatal("Connection with LDAP server could have not been established.")
	}

	err = l.Bind(bindUser, bindPass)
	if err != nil {
		log.Fatal("Wrong LDAP bind username or password.")
	}

	log.Print("Connection with LDAP server established.")
}

func rebind() {
	err := l.Bind(bindUser, bindPass)
	if err != nil {
		log.Print("Wrong ldap bind username or password.")
	}
}

func LDAPLogin(user, pass string) bool {
	defer rebind()

	searchRequest := ldap.NewSearchRequest(
		basedn,
		ldap.ScopeWholeSubtree, ldap.NeverDerefAliases, 0, 0, false,
		fmt.Sprintf("(&(objectClass=organizationalPerson)(uid=%s))", ldap.EscapeFilter(user)),
		[]string{"dn"},
		nil,
	)

	sr, err := l.Search(searchRequest)
	if err != nil {
		log.Print(err)
		return false
	}

	if len(sr.Entries) != 1 {
		return false
	}

	userdn := sr.Entries[0].DN
	err = l.Bind(userdn, pass)
	if err != nil {
		return false
	}

	return true
}
