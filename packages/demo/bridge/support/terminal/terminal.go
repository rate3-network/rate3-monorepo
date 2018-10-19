package terminal

import (
	"io"

	"golang.org/x/crypto/ssh/terminal"
)

type PasswordPrompt interface {
	io.Writer
	ReadPassword() ([]byte, error)
}

type terminalPasswordPrompt struct {
	io.Writer
}

func (t terminalPasswordPrompt) ReadPassword() ([]byte, error) {
	return terminal.ReadPassword(0)
}

func NewTerminalPasswordPrompt(writer io.Writer) PasswordPrompt {
	return terminalPasswordPrompt{
		Writer: writer,
	}
}

// PromptPassword takes in a prompt text to display, then reads a line of input
// from a terminal without local echo. This is commonly used for inputting
// passwords and other sensitive data. The slice returned does not include the
// newline. A newline is added after the prompt.
func PromptPassword(promptText string, reader PasswordPrompt) (password []byte, err error) {
	_, err = reader.Write([]byte(promptText))
	if err != nil {
		return nil, err
	}

	password, err = reader.ReadPassword()
	if err != nil {
		return nil, err
	}

	_, err = reader.Write([]byte("\n"))
	if err != nil {
		return nil, err
	}

	return password, nil
}
