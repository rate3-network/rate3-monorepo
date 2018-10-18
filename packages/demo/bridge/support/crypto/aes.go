package crypto

import (
	"crypto/aes"
	"crypto/cipher"

	"golang.org/x/crypto/scrypt"
)

// EncryptAES will encrypt a byte array using a key derived from the passphrase
// and the nonce.
func EncryptAES(passphrase, data, nonce []byte) (ciphertext []byte, err error) {
	key, err := keyFromPassphrase(passphrase, nonce)
	if err != nil {
		return nil, err
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	aesgcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	ciphertext = aesgcm.Seal(nil, nonce, data, nil)

	return ciphertext, nil
}

// DecryptAES will decrypt a byte array using a key derived from the passphrase
// and the nonce.
func DecryptAES(passphrase, ciphertext, nonce []byte) (plaintext []byte, err error) {
	key, err := keyFromPassphrase(passphrase, nonce)
	if err != nil {
		return nil, err
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	aesgcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	plaintext, err = aesgcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return nil, err
	}

	return plaintext, nil
}

func keyFromPassphrase(passphrase, salt []byte) (key []byte, err error) {
	return scrypt.Key(passphrase, salt, 1<<15, 8, 1, 32)
}
