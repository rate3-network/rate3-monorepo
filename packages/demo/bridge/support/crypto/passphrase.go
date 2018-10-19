package crypto

import (
	"bytes"

	"github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/support/terminal"
)

// PromptPassphrase reads in a line of input without the echo as the passphrase.
// If confirmation is required, the function will endlessly loop until the
// passphrase and the confirmation are equal.
func PromptPassphrase(requireConfirmation bool, reader terminal.PasswordPrompt) (passphrase []byte, err error) {
	var isValidPassword bool

	for !isValidPassword {
		passphrase, err = terminal.PromptPassword("Enter passphrase: ", reader)
		if err != nil {
			return nil, err
		}
		if len(passphrase) == 0 {
			_, err := reader.Write([]byte("Passphrase cannot be blank\n"))
			if err != nil {
				return nil, err
			}
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
				_, err := reader.Write([]byte("Passphrase do not match\n"))
				if err != nil {
					return nil, err
				}
			}
		} else {
			isValidPassword = true
		}
	}

	return passphrase, nil
}
