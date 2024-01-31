package main

import (
	"server/data"
	"server/network"
)

func main() {
	data.InitDB()
	data.InitLDAP()
	network.InitRouter()
}
