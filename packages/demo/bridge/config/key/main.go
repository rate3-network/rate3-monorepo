package key

import (
	"encoding/hex"
	"fmt"

	"github.com/ethereum/go-ethereum/crypto"
	"github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/support/terminal"
	"github.com/stellar/go/keypair"
	"github.com/stellar/go/strkey"
)

// Ethereum holds the encoded and decoded private keys
type Ethereum struct {
	DecryptedPrivateKey []byte `toml:"-"`
	EncryptedPrivateKey string `toml:"PrivateKey"`
}

// Stellar holds the encoded and decoded private secrets
type Stellar struct {
	DecryptedSecret []byte `toml:"-"`
	EncryptedSecret string `toml:"Secret"`
}

// NewEthereumKey validates the private key and creates a new Ethereum struct.
func NewEthereumKey(decryptedPrivateKey []byte) (*Ethereum, error) {
	if !EthereumPrivateKeyValidate(decryptedPrivateKey) {
		return nil, ErrInvalidEthereumPrivateKey
	}
	return &Ethereum{
		DecryptedPrivateKey: decryptedPrivateKey,
	}, nil
}

// NewStellarKey validates the secret and creates a new Stellar struct.
func NewStellarKey(decryptedSecret []byte) (*Stellar, error) {
	if !StellarSecretValidate(decryptedSecret) {
		return nil, ErrInvalidStellarSecret
	}
	return &Stellar{
		DecryptedSecret: decryptedSecret,
	}, nil
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

// PromptEthereumPrivateKey reads a line without the echo, validates that the
// input is a valid ethereum private key and returns the new Ethereum struct.
func PromptEthereumPrivateKey(reader terminal.PasswordReader) (key *Ethereum, err error) {
	for {
		ethPrivateKey, err := terminal.PromptPassword(promptEthPrivateKey, reader)
		if err != nil {
			return nil, err
		}
		if key, err = NewEthereumKey(ethPrivateKey); err != nil {
			fmt.Println(err.Error())
			continue
		} else {
			return key, err
		}
	}
}

// PromptStellarSecret reads a line without the echo, validates that the
// input is a valid stellar secret and returns the new Stellar struct.
func PromptStellarSecret(reader terminal.PasswordReader) (key *Stellar, err error) {
	for {
		stellarSecret, err := terminal.PromptPassword(promptStellarSecret, reader)
		if err != nil {
			return nil, err
		}
		if key, err = NewStellarKey(stellarSecret); err != nil {
			fmt.Println(err.Error())
			continue
		} else {
			return key, err
		}
	}
}
