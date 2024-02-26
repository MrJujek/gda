package ldap_wrapper

import (
	"regexp"

	"github.com/go-ldap/ldap/v3"
)

func GetUserListLDAP() ([]LdapUser, error) {
	var users []LdapUser
	l, err := getLdapConn()
	if err != nil {
		return nil, err
	}
	defer l.Close()

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
