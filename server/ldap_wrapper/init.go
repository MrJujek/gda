package ldap_wrapper

import (
	"log"
	u "server/util"

	"github.com/go-ldap/ldap/v3"
)

var (
	url      string
	bindUser string
	bindPass string
	basedn   string
	filter   string
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
	filter = u.EnvOr("LDAP_USER_FILTER", "(&(objectClass=inetOrgPerson)(uid=%username%))")

	l, err := getLdapConn()
	if err != nil {
		log.Fatal("Connection with LDAP server could have not been established. Server is down or login credentials are wrong.")
	}
	defer l.Close()

	log.Print("Connection with LDAP server established.")
}
