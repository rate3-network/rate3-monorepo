package key

import (
	"encoding/hex"
)

// SetEncryptedPrivateKey encodes the byte array into a hexadecimal string.
func (k *Ethereum) SetEncryptedPrivateKey(encryptedPrivateKey []byte) {
	k.EncryptedPrivateKey = hex.EncodeToString(encryptedPrivateKey)
}

// GetEncryptedPrivateKey decodes the hexadecimal string to a byte array.
func (k *Ethereum) GetEncryptedPrivateKey() (encryptedPrivateKey []byte, err error) {
	return hex.DecodeString(k.EncryptedPrivateKey)
}
