package crypto

import (
	"bytes"
	"fmt"

	"github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/support/terminal"
)

// PromptPassphrase reads in a line of input without the echo as the passphrase.
// If confirmation is required, the function will endlessly loop until the
// passphrase and the confirmation are equal.
func PromptPassphrase(requireConfirmation bool, reader terminal.PasswordReader) (passphrase []byte, err error) {
	var isValidPassword bool

	for !isValidPassword {
		passphrase, err = terminal.PromptPassword("Enter passphrase: ", reader)
		if err != nil {
			return nil, err
		}
		if len(passphrase) == 0 {
			fmt.Println("Passphrase cannot be blank")
			continue
		}

		if requireConfirmation {
			confirmation, err := terminal.PromptPassword("Re-enter passphrase: ", reader)
			if err != nil {
				return nil, err
			}
			if bytes.Equal(passphrase, confirmation) {
				isValidPassword = true
			} else {
				fmt.Println("Passphrase do not match")
			}
		} else {
			isValidPassword = true
		}
	}

	return passphrase, nil
}
