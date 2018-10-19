package config

import (
	"encoding/hex"

	"github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/config/key"
)

type keys struct {
	Nonce    string
	Stellar  *key.Stellar
	Ethereum *key.Ethereum
}

// SetNonce encodes the byte array into a hexadecimal string.
func (k *keys) SetNonce(nonce []byte) {
	k.Nonce = hex.EncodeToString(nonce)
}

// GetNonce decodes the hexadecimal string to a byte array.
func (k *keys) GetNonce() (nonce []byte, err error) {
	return hex.DecodeString(k.Nonce)
}

// HasStellarSecret checks that the stellar secret exists.
func (k *keys) HasStellarSecret() bool {
	return k.Stellar != nil && k.Stellar.EncryptedSecret != ""
}

func (k *keys) getEncryptedStellarSecret() ([]byte, error) {
	if !k.HasStellarSecret() {
		return nil, nil
	}

	return k.Stellar.GetEncryptedSecret()
}

// HasEthereumPrivateKey checks that the ethereum private key exists.
func (k *keys) HasEthereumPrivateKey() bool {
	return k.Ethereum != nil && k.Ethereum.EncryptedPrivateKey != ""
}

func (k *keys) getEncryptedEthereumPrivateKey() ([]byte, error) {
	if !k.HasEthereumPrivateKey() {
		return nil, nil
	}

	return k.Ethereum.GetEncryptedPrivateKey()
}
