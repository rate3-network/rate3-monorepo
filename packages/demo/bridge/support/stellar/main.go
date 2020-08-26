package stellar

import (
	"encoding/base64"
	"encoding/hex"

	"github.com/ethereum/go-ethereum/common"
)

type MemoType int64

const (
	_ MemoType = iota
	MemoTypeText
	MemoTypeID
	MemoTypeHash
	MemoTypeReturn
)

func ToMemoType(memoType string) (MemoType, bool) {
	switch memoType {
	case "text":
		return MemoTypeText, true
	case "id":
		return MemoTypeID, true
	case "hash":
		return MemoTypeHash, true
	case "return":
		return MemoTypeReturn, true
	default:
		return 0, false
	}
}

func ExtractMemoToEthereumAddress(memoType, memoValue string) (ethAddress string, err error) {
	switch memoType {
	case "hash":
		memoBytes, err := base64.StdEncoding.DecodeString(memoValue)
		if err != nil {
			return "", err
		}
		if len(memoBytes) != 32 {
			return "", ErrInvalidEthAddress
		}

		address := hex.EncodeToString(memoBytes[12:])
		if !common.IsHexAddress(address) {
			return "", ErrInvalidEthAddress
		}

		return address, nil
	default:
		return "", ErrInvalidMemoType
	}
}
