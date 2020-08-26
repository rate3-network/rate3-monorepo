package stellar

import (
	"fmt"
)

// Errors
var (
	ErrInvalidMemoType   = fmt.Errorf("Invalid memo type")
	ErrInvalidEthAddress = fmt.Errorf("Invalid ethereum address")
)
