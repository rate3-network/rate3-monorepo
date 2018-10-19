package config

import (
	"github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/config/key"
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

// HasPassphrase checks that a passphrase has been used to encrypt either the
// ethereum private key or the stellar secret.
func (c *Config) HasPassphrase() bool {
	return c.Keys != nil && c.Keys.Nonce != "" &&
		(c.Keys.HasEthereumPrivateKey() || c.Keys.HasStellarSecret())
}
