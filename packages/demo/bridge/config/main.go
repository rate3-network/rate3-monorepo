package config

import (
	"bytes"
	"io/ioutil"
	"os"

	"github.com/BurntSushi/toml"
	"github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/config/key"
	"github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/support/terminal"
)

// FileName of the bridge.toml file for storing the config.
const FileName = "bridge.toml"

// NewConfig initializes a new config.
func NewConfig() *Config {
	return &Config{
		Keys: &keys{
			Stellar:  &key.Stellar{},
			Ethereum: &key.Ethereum{},
		},
	}
}

// Config holds the data to be loaded from and saved to the bridge.toml file.
type Config struct {
	Database string
	Keys     *keys
	Networks networks
}

// Init will initialize a config from an existing one bridge.toml file.
// A new config file is created if there is no existing file.
func Init() (*Config, error) {
	var cfg *Config
	if Exists() {
		var err error
		cfg, err = Load()
		if err != nil {
			return nil, err
		}
	} else {
		cfg = NewConfig()
		err := Save(cfg)
		if err != nil {
			return nil, err
		}
	}

	reader := terminal.NewTerminalPasswordPrompt(os.Stdout)
	err := initKeys(cfg, reader)
	if err != nil {
		return nil, err
	}
	err = Save(cfg)
	if err != nil {
		return nil, err
	}

	return cfg, nil
}

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
