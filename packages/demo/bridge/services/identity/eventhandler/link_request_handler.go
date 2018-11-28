package eventhandler

import (
	"context"
	"encoding/hex"
	"fmt"
	"math/big"
	"reflect"

	"go.uber.org/zap"
	"gopkg.in/guregu/null.v3"

	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/rate-engineering/rate3-monorepo/packages/demo/bridge/services/identity/db"
	"github.com/stellar/go/strkey"
)

func (h *LinkRequestHandler) Process(request db.LinkRequest) {
	defer h.Mutex.Unlock() // Unblock for next link request

	if !h.validateZeroAddress(request) {
		return
	}
	if !h.validateIdentityAddress(request) {
		return
	}
	if !h.validateNotLinked(request) {
		return
	}

	nonce, err := h.EthereumClient.PendingNonceAt(context.Background(), h.FromAddress)
	if err != nil {
		h.Logger.Error("Unable to get pending nonce for address",
			zap.Error(err),
			zap.String("Address", h.FromAddress.Hex()),
		)
		return
	}

	gasPrice, err := h.EthereumClient.SuggestGasPrice(context.Background())
	if err != nil {
		h.Logger.Error("Unable to get suggested gas price",
			zap.Error(err),
		)
		return
	}

	auth := bind.NewKeyedTransactor(h.PrivateKey)
	auth.Nonce = big.NewInt(int64(nonce))
	auth.Value = big.NewInt(0)     // in wei
	auth.GasLimit = uint64(300000) // in units
	auth.GasPrice = gasPrice

	identity := common.HexToAddress(request.EthereumAddress)
	account, _ := h.getStellarAccountBytes(request.StellarAccount)
	tx, err := h.Contracts.StellarIdentityAccounts.Instance.AddAccount(auth, identity, account)
	if err != nil {
		h.Logger.Error("Unable to submit transaction",
			zap.Error(err),
			zap.String("Identity", identity.Hex()),
			zap.ByteString("Account", account[:]),
		)
		return
	}

	request.Status = db.LinkRequestStatusQueued
	request.TxHash = null.NewString(hex.EncodeToString(tx.Hash().Bytes()), true)
	request.Nonce = null.NewInt(int64(nonce), true)

	_, err = h.DB.UpdateLinkRequest(request)
	if err != nil {
		h.Logger.Error("Unable to update link request",
			zap.Error(err),
			zap.Int64("ID", request.ID),
			zap.Int64("Status", request.Status),
			zap.String("TxHash", request.TxHash.String),
			zap.Int64("Nonce", request.Nonce.Int64),
		)
		return
	}
}

func (h *LinkRequestHandler) validateZeroAddress(request db.LinkRequest) bool {
	address := common.HexToAddress(request.EthereumAddress)
	if !h.isZeroAddress(address) {
		return true
	}

	request.Status = db.LinkRequestStatusValidationFailed
	request.Remarks = null.NewString("Invalid address: Zero address", true)
	h.Logger.Info("Unable to process link request: Zero address",
		zap.Int64("Link request ID", request.ID),
	)

	_, err := h.DB.UpdateLinkRequest(request)
	if err != nil {
		h.Logger.Error("Unable to update link request",
			zap.Error(err),
			zap.Int64("ID", request.ID),
			zap.Int64("Status", request.Status),
			zap.String("Remarks", request.Remarks.String),
		)
		return false
	}

	return false
}

func (h *LinkRequestHandler) validateIdentityAddress(request db.LinkRequest) bool {
	address := common.HexToAddress(request.EthereumAddress)

	isIdentity, err := h.Contracts.IdentityRegistry.Instance.Identities(nil, address)
	if err != nil {
		h.Logger.Error("Unable to check contract for identity",
			zap.Error(err),
			zap.String("Identity to check", address.String()),
		)
		return false
	}

	if isIdentity {
		return true
	}

	request.Status = db.LinkRequestStatusValidationFailed
	request.Remarks = null.NewString("Invalid address: Non-identity address", true)
	h.Logger.Info("Unable to process link request: Non-identity address",
		zap.Int64("Link request ID", request.ID),
		zap.String("Address", address.Hex()),
	)
	_, err = h.DB.UpdateLinkRequest(request)
	if err != nil {
		h.Logger.Error("Unable to update link request",
			zap.Error(err),
			zap.Int64("ID", request.ID),
			zap.Int64("Status", request.Status),
			zap.String("Remarks", request.Remarks.String),
		)
		return false
	}

	return false
}

func (h *LinkRequestHandler) validateNotLinked(request db.LinkRequest) bool {
	account, ok := h.getStellarAccountBytes(request.StellarAccount)
	if !ok {
		return false
	}

	identityAddress, err := h.Contracts.StellarIdentityAccounts.Instance.GetIdentity(nil, account)
	if err != nil {
		h.Logger.Error("Unable to check contract for existing identity",
			zap.Error(err),
			zap.ByteString("Account to check", account[:]),
		)
		return false
	}

	if h.isZeroAddress(identityAddress) {
		return true
	}

	request.Status = db.LinkRequestStatusValidationFailed
	request.Remarks = null.NewString(fmt.Sprintf(
		"Invalid request: Account linked to existing identity",
	), true)
	h.Logger.Info("Unable to process link request: Contains existing link",
		zap.Int64("Link request ID", request.ID),
		zap.String("Stellar account", request.StellarAccount),
		zap.String("Identity contract", identityAddress.Hex()),
	)

	_, err = h.DB.UpdateLinkRequest(request)
	if err != nil {
		h.Logger.Error("Unable to update link request",
			zap.Error(err),
			zap.Int64("ID", request.ID),
			zap.Int64("Status", request.Status),
			zap.String("Remarks", request.Remarks.String),
		)
		return false
	}

	return false
}

func (h *LinkRequestHandler) isZeroAddress(address common.Address) bool {
	zeroAddressBytes := common.FromHex("0x0000000000000000000000000000000000000000")
	addressBytes := address.Bytes()
	return reflect.DeepEqual(addressBytes, zeroAddressBytes)
}

func (h *LinkRequestHandler) getStellarAccountBytes(account string) ([32]byte, bool) {
	stellarAccount, err := strkey.Decode(strkey.VersionByteAccountID, account)
	if err != nil {
		h.Logger.Error("Unable to decode stellar address to bytes",
			zap.Error(err),
			zap.String("Account", account),
		)
		return [32]byte{}, false
	}
	var res [32]byte
	copy(res[32-len(stellarAccount):], stellarAccount)

	return res, true
}
