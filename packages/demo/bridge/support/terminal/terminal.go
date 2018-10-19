package terminal

import (
	"fmt"

	"golang.org/x/crypto/ssh/terminal"
)

type PasswordReader interface {
	ReadPassword() ([]byte, error)
}

type terminalPasswordReader struct{}

func (t terminalPasswordReader) ReadPassword() ([]byte, error) {
	return terminal.ReadPassword(0)
}

func NewTerminalPasswordReader() PasswordReader {
	return terminalPasswordReader{}
}

// PromptPassword takes in a prompt text to display, then reads a line of input
// from a terminal without local echo. This is commonly used for inputting
// passwords and other sensitive data. The slice returned does not include the
// newline. A newline is added after the prompt.
func PromptPassword(promptText string, reader PasswordReader) (password []byte, err error) {
	fmt.Print(promptText)
	password, err = reader.ReadPassword()
	fmt.Println()
	if err != nil {
		return nil, err
	}
	return password, nil
}
