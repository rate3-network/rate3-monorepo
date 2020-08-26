package key

import (
	"encoding/hex"
)

// SetEncryptedSecret encodes the byte array into a hexadecimal string.
func (k *Stellar) SetEncryptedSecret(encryptedSecret []byte) {
	k.EncryptedSecret = hex.EncodeToString(encryptedSecret)
}

// GetEncryptedSecret decodes the hexadecimal string to a byte array.
func (k *Stellar) GetEncryptedSecret() (encryptedSecret []byte, err error) {
	return hex.DecodeString(k.EncryptedSecret)
}
