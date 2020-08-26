package config

// HasPassphrase checks that a passphrase has been used to encrypt either the
// ethereum private key or the stellar secret.
func (c *Config) HasPassphrase() bool {
	return c.Keys != nil && c.Keys.Nonce != "" &&
		(c.Keys.HasEthereumPrivateKey() || c.Keys.HasStellarSecret())
}
