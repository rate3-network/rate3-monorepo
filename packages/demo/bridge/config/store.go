package config

import (
	"bytes"
	"io/ioutil"
	"os"

	"github.com/BurntSushi/toml"
)

// Exists checks that the bridge.toml file exists in the file system.
func Exists() bool {
	if _, err := os.Stat(FileName); !os.IsNotExist(err) {
		return true
	}

	return false
}

// Load the bridge.toml file contents into a Config struct.
func Load() (config *Config, err error) {
	data, err := ioutil.ReadFile(FileName)
	if err != nil {
		return nil, err
	}
	config = NewConfig()
	if _, err := toml.Decode(string(data), config); err != nil {
		return nil, err
	}

	return config, nil
}

// Save the config struct into the bridge.toml file.
func Save(config *Config) (err error) {
	if config == nil {
		return nil // no-op
	}
	buf := new(bytes.Buffer)
	if err := toml.NewEncoder(buf).Encode(config); err != nil {
		return err
	}

	return ioutil.WriteFile(FileName, buf.Bytes(), os.ModePerm)
}
