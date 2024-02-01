package ldap_wrapper

import (
	"log"
	"regexp"

	"github.com/go-ldap/ldap/v3"
)

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
