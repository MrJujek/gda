package main

import (
    db "server/db_wrapper"
    lw "server/ldap_wrapper"
    controller "server/controller"
)

func main() {
	lw.InitLDAP()
	db.InitDB()
	controller.InitRouter()
}
