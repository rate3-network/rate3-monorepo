package key

import (
	"fmt"

	"github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/support/terminal"
)

const (
	promptEthPrivateKey = "Enter Ethereum private key: "
	promptStellarSecret = "Enter Stellar secret: "
)

// PromptEthereumPrivateKey reads a line without the echo, validates that the
// input is a valid ethereum private key and returns the new Ethereum struct.
func PromptEthereumPrivateKey() (key *Ethereum, err error) {
	for {
		ethPrivateKey, err := terminal.PromptPassword(promptEthPrivateKey)
		if err != nil {
			return nil, err
		}
		if key, err = NewEthereumKey(ethPrivateKey); err != nil {
			fmt.Println(err.Error())
			continue
		} else {
			return key, err
		}
	}
}

// PromptStellarSecret reads a line without the echo, validates that the
// input is a valid stellar secret and returns the new Stellar struct.
func PromptStellarSecret() (key *Stellar, err error) {
	for {
		stellarSecret, err := terminal.PromptPassword(promptStellarSecret)
		if err != nil {
			return nil, err
		}
		if key, err = NewStellarKey(stellarSecret); err != nil {
			fmt.Println(err.Error())
			continue
		} else {
			return key, err
		}
	}
}
