package key

import (
	"encoding/hex"
	"fmt"

	"github.com/ethereum/go-ethereum/crypto"
)

// Error messages for Ethereum keys
var (
	ErrInvalidEthereumPrivateKey = fmt.Errorf("Ethereum: Invalid private key format")
)

// NewEthereumKey validates the private key and creates a new Ethereum struct.
func NewEthereumKey(decryptedPrivateKey []byte) (*Ethereum, error) {
	if !EthereumPrivateKeyValidate(decryptedPrivateKey) {
		return nil, ErrInvalidEthereumPrivateKey
	}
	return &Ethereum{
		DecryptedPrivateKey: decryptedPrivateKey,
	}, nil
}

// Ethereum holds the encoded and decoded private keys
type Ethereum struct {
	DecryptedPrivateKey []byte `toml:"-"`
	EncryptedPrivateKey string `toml:"PrivateKey"`
}

// SetEncryptedPrivateKey encodes the byte array into a hexadecimal string.
func (k *Ethereum) SetEncryptedPrivateKey(encryptedPrivateKey []byte) {
	k.EncryptedPrivateKey = hex.EncodeToString(encryptedPrivateKey)
}

// GetEncryptedPrivateKey decodes the hexadecimal string to a byte array.
func (k *Ethereum) GetEncryptedPrivateKey() (encryptedPrivateKey []byte, err error) {
	return hex.DecodeString(k.EncryptedPrivateKey)
}

// EthereumPrivateKeyValidate checks that the private key is valid.
func EthereumPrivateKeyValidate(privateKey []byte) (ok bool) {
	privateKeyHex, err := hex.DecodeString(string(privateKey))
	if err != nil {
		return false
	}
	if _, err := crypto.ToECDSA(privateKeyHex); err != nil {
		return false
	}
	return true
}
