package main

import (
	"server/data"
	"server/network"
)

func main() {
	data.InitLDAP()
	data.InitDB()
	network.InitRouter()
}
