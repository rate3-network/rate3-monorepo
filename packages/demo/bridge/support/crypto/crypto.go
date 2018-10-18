package crypto

import (
	"crypto/rand"
	"io"
)

// GenNonce generates a random byte array of the supplied length.
func GenNonce(length int) (nonce []byte, err error) {
	// Never use more than 2^32 random nonces with a given key because of the risk of a repeat.
	nonce = make([]byte, 12)
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, err
	}
	return nonce, err
}
