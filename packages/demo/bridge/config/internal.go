package config

import (
	"fmt"
	"strings"

	"github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/config/key"
	"github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/support/crypto"
	"github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/support/terminal"
)

func initKeys(_config *Config, reader terminal.PasswordPrompt) (err error) {
	if !_config.HasPassphrase() {
		return initKeysOverrideExisting(_config, reader)
	}

	return initKeysFromExisting(_config, reader)
}

func initKeysOverrideExisting(_config *Config, reader terminal.PasswordPrompt) (err error) {
	ethKey, err := key.PromptEthereumPrivateKey(reader)
	if err != nil {
		return err
	}

	stellarKey, err := key.PromptStellarSecret(reader)
	if err != nil {
		return err
	}

	nonce, err := crypto.GenNonce(12)
	if err != nil {
		return err
	}

	passphrase, err := crypto.PromptPassphrase(true, reader)
	if err != nil {
		return err
	}

	encryptedEthPrivateKey, err := crypto.EncryptAES(passphrase, ethKey.DecryptedPrivateKey, nonce)
	if err != nil {
		return err
	}
	encryptedStellarSecret, err := crypto.EncryptAES(passphrase, stellarKey.DecryptedSecret, nonce)
	if err != nil {
		return err
	}

	_config.Keys = &keys{
		Ethereum: ethKey,
		Stellar:  stellarKey,
	}
	_config.Keys.SetNonce(nonce)
	_config.Keys.Ethereum.SetEncryptedPrivateKey(encryptedEthPrivateKey)
	_config.Keys.Stellar.SetEncryptedSecret(encryptedStellarSecret)

	return nil
}

func initKeysFromExisting(_config *Config, reader terminal.PasswordPrompt) (err error) {
	var nonce []byte
	var ethPrivateKeyEnc []byte
	var stellarSecretEnc []byte
	var ethPrivateKey []byte
	var stellarSecret []byte
	var isValidPassphrase bool
	var passphrase []byte
	var ok bool

	if nonce, err = _config.Keys.GetNonce(); err != nil {
		return err
	}
	if ethPrivateKeyEnc, err = _config.Keys.getEncryptedEthereumPrivateKey(); err != nil {
		return err
	}
	if stellarSecretEnc, err = _config.Keys.getEncryptedStellarSecret(); err != nil {
		return err
	}

	for !isValidPassphrase {
		isValidPassphrase = true // Only invalid if cannot decode key
		if passphrase, err = crypto.PromptPassphrase(false, reader); err != nil {
			return err
		}

		if ethPrivateKeyEnc != nil {
			ethPrivateKey, ok, err = keyDecryptAndValidate(passphrase, ethPrivateKeyEnc, nonce, key.EthereumPrivateKeyValidate)
			if err != nil {
				return err
			} else if ethPrivateKey == nil {
				fmt.Println("Incorrect password")
				isValidPassphrase = false
				continue
			}
			if ok {
				_config.Keys.Ethereum.DecryptedPrivateKey = ethPrivateKey
			} else {
				ethPrivateKeyEnc = nil
			}
		}

		if stellarSecretEnc != nil {
			stellarSecret, ok, err = keyDecryptAndValidate(passphrase, stellarSecretEnc, nonce, key.StellarSecretValidate)
			if err != nil {
				return err
			} else if ethPrivateKey == nil {
				fmt.Println("Incorrect password")
				isValidPassphrase = false
				continue
			}
			if ok {
				_config.Keys.Stellar.DecryptedSecret = stellarSecret
			} else {
				stellarSecretEnc = nil
			}
		}
	}

	if ethPrivateKeyEnc == nil {
		var ethKey *key.Ethereum
		if ethKey, err = key.PromptEthereumPrivateKey(reader); err != nil {
			return err
		}
		if ethPrivateKeyEnc, err = crypto.EncryptAES(passphrase, ethPrivateKey, nonce); err != nil {
			return err
		}
		_config.Keys.Ethereum = ethKey
		_config.Keys.Ethereum.SetEncryptedPrivateKey(ethPrivateKeyEnc)
	}

	if stellarSecretEnc == nil {
		var stellarKey *key.Stellar
		if stellarKey, err = key.PromptStellarSecret(reader); err != nil {
			return err
		}
		if stellarSecretEnc, err = crypto.EncryptAES(passphrase, stellarSecret, nonce); err != nil {
			return err
		}
		_config.Keys.Stellar = stellarKey
		_config.Keys.Stellar.SetEncryptedSecret(stellarSecretEnc)
	}

	return nil
}

func keyDecryptAndValidate(passphrase, encrypted, nonce []byte, validator func([]byte) bool) (decrypted []byte, validated bool, err error) {
	decrypted, err = crypto.DecryptAES(passphrase, encrypted, nonce)
	if err != nil {
		if isMessageAuthenticationFailed(err) {
			return nil, false, nil // Not an error
		}
		return nil, false, err
	}
	return decrypted, validator(decrypted), nil
}

func isMessageAuthenticationFailed(err error) bool {
	if err == nil {
		return false
	}
	return strings.Contains(err.Error(), "cipher: message authentication failed")
}
