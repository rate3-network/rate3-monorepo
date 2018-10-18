package main

import (
	"log"

	"github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/config"
)

func main() {
	var cfg *config.Config
	if config.Exists() {
		var err error
		cfg, err = config.Load()
		if err != nil {
			log.Fatal(err)
		}
	} else {
		cfg = config.NewConfig()
		err := config.Save(cfg)
		if err != nil {
			log.Fatal(err)
		}
	}

	err := config.InitKeys(cfg)
	if err != nil {
		log.Fatal(err)
	}
	err = config.Save(cfg)
	if err != nil {
		log.Fatal(err)
	}
}
