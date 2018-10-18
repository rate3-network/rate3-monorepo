package key

import (
	"encoding/hex"
	"fmt"

	"github.com/stellar/go/keypair"
	"github.com/stellar/go/strkey"
)

// Error messages for Stellar keys
var (
	ErrInvalidStellarSecret = fmt.Errorf("Stellar: Invalid secret format")
)

// NewStellarKey validates the secret and creates a new Stellar struct.
func NewStellarKey(decryptedSecret []byte) (*Stellar, error) {
	if !StellarSecretValidate(decryptedSecret) {
		return nil, ErrInvalidStellarSecret
	}
	return &Stellar{
		DecryptedSecret: decryptedSecret,
	}, nil
}

// Stellar holds the encoded and decoded private secrets
type Stellar struct {
	DecryptedSecret []byte `toml:"-"`
	EncryptedSecret string `toml:"Secret"`
}

// SetEncryptedSecret encodes the byte array into a hexadecimal string.
func (k *Stellar) SetEncryptedSecret(encryptedSecret []byte) {
	k.EncryptedSecret = hex.EncodeToString(encryptedSecret)
}

// GetEncryptedSecret decodes the hexadecimal string to a byte array.
func (k *Stellar) GetEncryptedSecret() (encryptedSecret []byte, err error) {
	return hex.DecodeString(k.EncryptedSecret)
}

// StellarSecretValidate checks that the secret is valid.
func StellarSecretValidate(secret []byte) (ok bool) {
	_, err := strkey.Decode(strkey.VersionByteSeed, string(secret))
	if err != nil {
		return false
	}
	return true
}

// StellarKeypairFromSecret creates a new keypair from the secret.
func StellarKeypairFromSecret(secret []byte) (*keypair.Full, error) {
	decoded, err := strkey.Decode(strkey.VersionByteSeed, string(secret))
	if err != nil {
		return nil, err
	}
	var accountBytes [32]byte
	copy(accountBytes[:], decoded)

	return keypair.FromRawSeed(accountBytes)

}
