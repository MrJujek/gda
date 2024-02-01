package main

import (
	controller "server/controller"
	db "server/db_wrapper"
	lw "server/ldap_wrapper"
)

func main() {
	lw.InitLDAP()
	db.InitDB()
	controller.InitRouter()
}
