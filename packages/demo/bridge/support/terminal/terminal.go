package terminal

import (
	"fmt"

	"golang.org/x/crypto/ssh/terminal"
)

// PromptPassword takes in a prompt text to display, then reads a line of input
// from a terminal without local echo. This is commonly used for inputting
// passwords and other sensitive data. The slice returned does not include the
// newline. A newline is added after the prompt.
func PromptPassword(promptText string) (password []byte, err error) {
	fmt.Print(promptText)
	password, err = terminal.ReadPassword(0)
	fmt.Println()
	if err != nil {
		return nil, err
	}
	return password, nil
}
