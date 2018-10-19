package crypto_test

import (
	"testing"

	"github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/support/crypto"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/stretchr/testify/suite"
)

type AESTestSuite struct {
	suite.Suite
}

func (suite *AESTestSuite) SetupTest() {
}

func (suite *AESTestSuite) TestEncryptDecrypt() {
	t := suite.T()

	passphrase := []byte("pass")
	data := []byte("data")
	nonce := []uint8{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12}

	cipherText, err := crypto.EncryptAES(passphrase, data, nonce)
	require.NoError(t, err)

	plainText, err := crypto.DecryptAES(passphrase, cipherText, nonce)
	require.NoError(t, err)

	assert.EqualValues(t, data, plainText)
}

func (suite *AESTestSuite) TestDecryptIncorrectNonce() {
	t := suite.T()

	passphrase := []byte("pass")

	// correct nonce is []uint8{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12}
	// cipherText generated from []byte("data")
	nonce := []uint8{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0}
	cipherText := []byte{16, 110, 178, 206, 168, 205, 166, 173, 196, 219, 27, 99, 233, 216, 101, 104, 144, 113, 114, 144}

	_, err := crypto.DecryptAES(passphrase, cipherText, nonce)
	assert.Error(t, err)
}

func (suite *AESTestSuite) TestNonceLengthError() {
	t := suite.T()

	passphrase := []byte("pass")
	data := []byte("data")

	assert.Panics(t, func() {
		nonce := []uint8{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13}
		crypto.EncryptAES(passphrase, data, nonce)
	})
	assert.Panics(t, func() {
		nonce := []uint8{1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11}
		crypto.EncryptAES(passphrase, data, nonce)
	})
}
func TestAES(t *testing.T) {
	suite.Run(t, new(AESTestSuite))
}
