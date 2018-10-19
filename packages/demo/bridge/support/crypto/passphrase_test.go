package crypto_test

import (
	"testing"

	mocks "github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/mocks/support/terminal"
	"github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/support/crypto"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/stretchr/testify/suite"
)

type PromptPassphraseTestSuite struct {
	suite.Suite
	mockPrompt *mocks.PasswordPrompt
}

func (suite *PromptPassphraseTestSuite) SetupTest() {
	suite.mockPrompt = &mocks.PasswordPrompt{}
}

func (suite *PromptPassphraseTestSuite) TestPromptNoConfirmation() {
	t := suite.T()

	testInput := "test_in"

	suite.mockPrompt.On("Write", []byte("Enter passphrase: ")).Return(0, nil).Once()
	suite.mockPrompt.On("ReadPassword").Return([]byte(testInput), nil)
	suite.mockPrompt.On("Write", []byte("\n")).Return(0, nil).Once()

	pw, err := crypto.PromptPassphrase(false, suite.mockPrompt)
	require.NoError(t, err)

	assert.Equal(t, []byte(testInput), pw)
	suite.mockPrompt.AssertExpectations(t)
}

func (suite *PromptPassphraseTestSuite) TestPromptConfirmation() {
	t := suite.T()

	testInput := "test_in"

	suite.mockPrompt.On("Write", []byte("Enter passphrase: ")).Return(0, nil).Once()
	suite.mockPrompt.On("ReadPassword").Return([]byte(testInput), nil)
	suite.mockPrompt.On("Write", []byte("\n")).Return(0, nil).Once()
	suite.mockPrompt.On("Write", []byte("Re-enter passphrase: ")).Return(0, nil).Once()
	suite.mockPrompt.On("Write", []byte("\n")).Return(0, nil).Once()

	pw, err := crypto.PromptPassphrase(true, suite.mockPrompt)
	require.NoError(t, err)

	assert.Equal(t, []byte(testInput), pw)
	suite.mockPrompt.AssertExpectations(t)
}

func (suite *PromptPassphraseTestSuite) TestPromptBlankMessage() {
	t := suite.T()

	testInput := "test_in"

	suite.mockPrompt.On("Write", []byte("Enter passphrase: ")).Return(0, nil).Once()
	suite.mockPrompt.On("ReadPassword").Return([]byte(""), nil).Once()
	suite.mockPrompt.On("Write", []byte("\n")).Return(0, nil).Once()
	suite.mockPrompt.On("Write", []byte("Passphrase cannot be blank\n")).Return(0, nil).Once()
	suite.mockPrompt.On("Write", []byte("Enter passphrase: ")).Return(0, nil).Once()
	suite.mockPrompt.On("ReadPassword").Return([]byte(testInput), nil).Once()
	suite.mockPrompt.On("Write", []byte("\n")).Return(0, nil).Once()

	pw, err := crypto.PromptPassphrase(false, suite.mockPrompt)
	require.NoError(t, err)

	assert.Equal(t, []byte(testInput), pw)
	suite.mockPrompt.AssertExpectations(t)
}

func (suite *PromptPassphraseTestSuite) TestPromptConfirmationNotMatch() {
	t := suite.T()

	testInput := "test_in"

	suite.mockPrompt.On("Write", []byte("Enter passphrase: ")).Return(0, nil).Once()
	suite.mockPrompt.On("ReadPassword").Return([]byte(testInput), nil).Once()
	suite.mockPrompt.On("Write", []byte("\n")).Return(0, nil).Once()
	suite.mockPrompt.On("Write", []byte("Re-enter passphrase: ")).Return(0, nil).Once()
	suite.mockPrompt.On("ReadPassword").Return([]byte(testInput+"_"), nil).Once()
	suite.mockPrompt.On("Write", []byte("\n")).Return(0, nil).Once()
	suite.mockPrompt.On("Write", []byte("Passphrase do not match\n")).Return(0, nil).Once()

	suite.mockPrompt.On("Write", []byte("Enter passphrase: ")).Return(0, nil).Once()
	suite.mockPrompt.On("ReadPassword").Return([]byte(testInput), nil)
	suite.mockPrompt.On("Write", []byte("\n")).Return(0, nil).Once()
	suite.mockPrompt.On("Write", []byte("Re-enter passphrase: ")).Return(0, nil).Once()
	suite.mockPrompt.On("Write", []byte("\n")).Return(0, nil).Once()

	pw, err := crypto.PromptPassphrase(true, suite.mockPrompt)
	require.NoError(t, err)

	assert.Equal(t, []byte(testInput), pw)
	suite.mockPrompt.AssertExpectations(t)
}

func TestPassphrase(t *testing.T) {
	suite.Run(t, new(PromptPassphraseTestSuite))
}
