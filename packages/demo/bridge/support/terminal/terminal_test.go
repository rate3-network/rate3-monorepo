package terminal_test

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"

	mocks "github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/mocks/support/terminal"
	"github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/support/terminal"
	"github.com/stretchr/testify/require"
)

type PromptPasswordTestSuite struct {
	suite.Suite
	mockPrompt *mocks.PasswordPrompt
}

func (suite *PromptPasswordTestSuite) SetupTest() {
	suite.mockPrompt = &mocks.PasswordPrompt{}
}

func (suite *PromptPasswordTestSuite) TestPrompt() {
	t := suite.T()

	testInput := "test_in"
	testOutput := "test_out: "

	suite.mockPrompt.On("ReadPassword").Return([]byte(testInput), nil)
	suite.mockPrompt.On("Write", []byte(testOutput)).Return(0, nil).Once()
	suite.mockPrompt.On("Write", []byte("\n")).Return(0, nil).Once()

	pw, err := terminal.PromptPassword(testOutput, suite.mockPrompt)
	require.NoError(t, err)

	assert.Equal(t, []byte(testInput), pw)
	suite.mockPrompt.AssertExpectations(t)
}

func (suite *PromptPasswordTestSuite) TestPromptWriteError() {
	t := suite.T()

	testInput := "test_in"
	testOutput := "test_out: "
	testWriteErr := fmt.Errorf("write error")
	testReadErr := fmt.Errorf("read error")

	suite.mockPrompt.On("ReadPassword").Return([]byte(testInput), testReadErr)
	suite.mockPrompt.On("Write", []byte(testOutput)).Return(0, testWriteErr).Once()
	suite.mockPrompt.On("Write", []byte("\n")).Return(0, nil).Once()

	_, err := terminal.PromptPassword(testOutput, suite.mockPrompt)
	assert.EqualError(t, err, testWriteErr.Error())
}

func (suite *PromptPasswordTestSuite) TestPromptReadError() {
	t := suite.T()

	testInput := "test_in"
	testOutput := "test_out: "
	testWriteErr := fmt.Errorf("write error")
	testReadErr := fmt.Errorf("read error")

	suite.mockPrompt.On("ReadPassword").Return([]byte(testInput), testReadErr)
	suite.mockPrompt.On("Write", []byte(testOutput)).Return(0, nil).Once()
	suite.mockPrompt.On("Write", []byte("\n")).Return(0, testWriteErr).Once()

	_, err := terminal.PromptPassword(testOutput, suite.mockPrompt)
	assert.EqualError(t, err, testReadErr.Error())
}

func TestPasswordPrompt(t *testing.T) {
	suite.Run(t, new(PromptPasswordTestSuite))
}
