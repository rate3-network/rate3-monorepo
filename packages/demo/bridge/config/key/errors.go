package key

import "fmt"

// Errors
var (
	ErrInvalidEthereumPrivateKey = fmt.Errorf("Ethereum: Invalid private key format")
	ErrInvalidStellarSecret      = fmt.Errorf("Stellar: Invalid secret format")
)
