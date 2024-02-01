package data

import (
	"log"
	"regexp"
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

func GetUserListLDAP() ([]LdapUser, error) {
	var users []LdapUser
	l, err := getLdapConn()
	if err != nil {
		return nil, err
	}

	re := regexp.MustCompile("%username%")
	searchRequest := ldap.NewSearchRequest(
		basedn,
		ldap.ScopeWholeSubtree, ldap.NeverDerefAliases, 0, 0, false,
		re.ReplaceAllString(filter, "*"),
		[]string{"dn", "cn", "displayName"},
		nil,
	)

	sr, err := l.Search(searchRequest)
	if err != nil {
		return nil, err
	}

	for _, en := range sr.Entries {
		user := LdapUser{}

		err := en.Unmarshal(&user)
		if err != nil {
			return nil, err
		}

		users = append(users, user)
	}

	return users, nil
}

func InitLDAP() {
	url = u.EnvExit("LDAP_URL")
	bindUser = u.EnvExit("LDAP_USER_DN")
	bindPass = u.EnvExit("LDAP_PASS")
	basedn = u.EnvExit("LDAP_BASE_DN")
	filter = u.EnvOr("LDAP_USER_FILTER", "(&(objectClass=organizationalPerson)(|(uid=%username%)(cn=%username%)))")

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

	re := regexp.MustCompile("%username%")
	searchRequest := ldap.NewSearchRequest(
		basedn,
		ldap.ScopeWholeSubtree, ldap.NeverDerefAliases, 0, 0, false,
		re.ReplaceAllString(filter, ldap.EscapeFilter(user)),
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
