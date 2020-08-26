package crypto_test

import (
	"testing"

	"github.com/stretchr/testify/require"

	"github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/support/crypto"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
)

type NonceTestSuite struct {
	suite.Suite
}

func (suite *NonceTestSuite) SetupTest() {
}

func (suite *NonceTestSuite) TestEncryptDecrypt() {
	t := suite.T()

	nonce1, err := crypto.GenNonce(12)
	require.NoError(t, err)

	nonce2, err := crypto.GenNonce(12)
	require.NoError(t, err)

	assert.NotEqual(t, nonce1, nonce2)
}

func TestNonce(t *testing.T) {
	suite.Run(t, new(NonceTestSuite))
}
