package stellaridentityaccounts

import (
	"encoding/hex"

	"github.com/stellar/go/strkey"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"go.uber.org/zap/zapcore"
)

type AccountEvent struct {
	Name        string
	Identity    common.Address
	Account     [32]byte
	Raw         types.Log // Blockchain specific contextual infos
	BlockHeader *types.Header
}

type AccountEventSlice []AccountEvent

func (e *AccountEvent) MarshalLogObject(enc zapcore.ObjectEncoder) error {
	enc.AddUint64("Block", e.Raw.BlockNumber)
	enc.AddString("TxHash", e.Raw.TxHash.Hex())
	enc.AddString("Name", e.Name)
	enc.AddString("Identity Address", e.Identity.Hex())
	enc.AddString("Account Address", hex.EncodeToString(e.Account[:]))
	if encoded, err := strkey.Encode(strkey.VersionByteAccountID, e.Account[:]); err == nil {
		enc.AddString("Encoded Account Address", encoded)
	}
	return nil
}

func (s AccountEventSlice) MarshalLogArray(enc zapcore.ArrayEncoder) error {
	for _, e := range s {
		if err := enc.AppendObject(&e); err != nil {
			return err
		}
	}
	return nil
}

func (e *StellaridentityaccountsAccountRequested) MarshalLogObject(enc zapcore.ObjectEncoder) error {
	enc.AddUint64("Block", e.Raw.BlockNumber)
	enc.AddString("TxHash", e.Raw.TxHash.Hex())
	enc.AddString("Identity Address", e.Identity.Hex())
	enc.AddString("Account Address", hex.EncodeToString(e.Account[:]))

	return nil
}

func (e *StellaridentityaccountsAccountAdded) MarshalLogObject(enc zapcore.ObjectEncoder) error {
	enc.AddUint64("Block", e.Raw.BlockNumber)
	enc.AddString("TxHash", e.Raw.TxHash.Hex())
	enc.AddString("Identity Address", e.Identity.Hex())
	enc.AddString("Account Address", hex.EncodeToString(e.Account[:]))

	return nil
}

func (e *StellaridentityaccountsAccountRemoved) MarshalLogObject(enc zapcore.ObjectEncoder) error {
	enc.AddUint64("Block", e.Raw.BlockNumber)
	enc.AddString("TxHash", e.Raw.TxHash.Hex())
	enc.AddString("Identity Address", e.Identity.Hex())
	enc.AddString("Account Address", hex.EncodeToString(e.Account[:]))

	return nil
}
