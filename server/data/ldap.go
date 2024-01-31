package data

import (
	"fmt"
	"log"
	u "server/util"

	"github.com/go-ldap/ldap/v3"
)

var (
	url      string
	bindUser string
	bindPass string
	basedn   string
)

func getLdapConn() (*ldap.Conn, error) {
	conn, err := ldap.DialURL(url)
	if err != nil {
		return nil, err
	}

	err = conn.Bind(bindUser, bindPass)
	if err != nil {
		return nil, err
	}

	return conn, nil
}

func InitLDAP() {
	url = u.EnvExit("LDAP_URL")
	bindUser = u.EnvExit("LDAP_USER_DN")
	bindPass = u.EnvExit("LDAP_PASS")
	basedn = u.EnvExit("LDAP_BASE_DN")

	l, err := getLdapConn()
	if err != nil {
		log.Fatal(`Connection with LDAP server could have not been established.\
Server is down or login credentials are wrong.`)
	}
	defer l.Close()

	log.Print("Connection with LDAP server established.")
}

func LDAPLogin(user, pass string) (bool, error) {
	l, err := getLdapConn()
	if err != nil {
		log.Print(err)
		return false, err
	}

	searchRequest := ldap.NewSearchRequest(
		basedn,
		ldap.ScopeWholeSubtree, ldap.NeverDerefAliases, 0, 0, false,
		fmt.Sprintf(
			// TODO udpate to filter from env or better idea?
			"(&(objectClass=organizationalPerson)(uid=%s))",
			ldap.EscapeFilter(user),
		),
		[]string{"dn"},
		nil,
	)

	sr, err := l.Search(searchRequest)
	if err != nil {
		log.Print(err)
		return false, nil
	}

	if len(sr.Entries) != 1 {
		log.Print(err)
		return false, nil
	}

	userdn := sr.Entries[0].DN
	err = l.Bind(userdn, pass)
	if err != nil {
		log.Print(err)
		return false, nil
	}

	return true, nil
}
