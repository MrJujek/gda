package ldap_wrapper

type LdapUser struct {
	Dn          string `ldap:"dn"`
	CommonName  string `ldap:"cn"`
	DisplayName string `ldap:"displayName"`
}
