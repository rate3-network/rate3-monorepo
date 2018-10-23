// Code generated - DO NOT EDIT.
// This file is a generated binding and any manual changes will be lost.

package stellaridentityaccounts

import (
	"math/big"
	"strings"

	ethereum "github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/event"
)

// Reference imports to suppress errors if they are not otherwise used.
var (
	_ = big.NewInt
	_ = strings.NewReader
	_ = ethereum.NotFound
	_ = abi.U256
	_ = bind.Bind
	_ = common.Big1
	_ = types.BloomLookup
	_ = event.NewSubscription
)

// StellaridentityaccountsABI is the input ABI used to generate the binding from.
const StellaridentityaccountsABI = "[{\"constant\":true,\"inputs\":[],\"name\":\"registry\",\"outputs\":[{\"name\":\"\",\"type\":\"address\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"owner\",\"outputs\":[{\"name\":\"\",\"type\":\"address\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_newOwner\",\"type\":\"address\"}],\"name\":\"transferOwnership\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"name\":\"_registry\",\"type\":\"address\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"name\":\"identity\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"account\",\"type\":\"bytes32\"}],\"name\":\"AccountRequested\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"name\":\"identity\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"account\",\"type\":\"bytes32\"}],\"name\":\"AccountAdded\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"name\":\"identity\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"account\",\"type\":\"bytes32\"}],\"name\":\"AccountRemoved\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"previousOwner\",\"type\":\"address\"}],\"name\":\"OwnershipRenounced\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"previousOwner\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"newOwner\",\"type\":\"address\"}],\"name\":\"OwnershipTransferred\",\"type\":\"event\"},{\"constant\":true,\"inputs\":[{\"name\":\"account\",\"type\":\"bytes32\"}],\"name\":\"getIdentity\",\"outputs\":[{\"name\":\"\",\"type\":\"address\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"identity\",\"type\":\"address\"}],\"name\":\"getAccounts\",\"outputs\":[{\"name\":\"\",\"type\":\"bytes32[]\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"identity\",\"type\":\"address\"},{\"name\":\"account\",\"type\":\"bytes32\"}],\"name\":\"addAccount\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"identity\",\"type\":\"address\"},{\"name\":\"account\",\"type\":\"bytes32\"}],\"name\":\"approve\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"identity\",\"type\":\"address\"},{\"name\":\"account\",\"type\":\"bytes32\"}],\"name\":\"removeAccount\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"}]"

// Stellaridentityaccounts is an auto generated Go binding around an Ethereum contract.
type Stellaridentityaccounts struct {
	StellaridentityaccountsCaller     // Read-only binding to the contract
	StellaridentityaccountsTransactor // Write-only binding to the contract
	StellaridentityaccountsFilterer   // Log filterer for contract events
}

// StellaridentityaccountsCaller is an auto generated read-only Go binding around an Ethereum contract.
type StellaridentityaccountsCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// StellaridentityaccountsTransactor is an auto generated write-only Go binding around an Ethereum contract.
type StellaridentityaccountsTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// StellaridentityaccountsFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type StellaridentityaccountsFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// StellaridentityaccountsSession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type StellaridentityaccountsSession struct {
	Contract     *Stellaridentityaccounts // Generic contract binding to set the session for
	CallOpts     bind.CallOpts            // Call options to use throughout this session
	TransactOpts bind.TransactOpts        // Transaction auth options to use throughout this session
}

// StellaridentityaccountsCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type StellaridentityaccountsCallerSession struct {
	Contract *StellaridentityaccountsCaller // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts                  // Call options to use throughout this session
}

// StellaridentityaccountsTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type StellaridentityaccountsTransactorSession struct {
	Contract     *StellaridentityaccountsTransactor // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts                  // Transaction auth options to use throughout this session
}

// StellaridentityaccountsRaw is an auto generated low-level Go binding around an Ethereum contract.
type StellaridentityaccountsRaw struct {
	Contract *Stellaridentityaccounts // Generic contract binding to access the raw methods on
}

// StellaridentityaccountsCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type StellaridentityaccountsCallerRaw struct {
	Contract *StellaridentityaccountsCaller // Generic read-only contract binding to access the raw methods on
}

// StellaridentityaccountsTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type StellaridentityaccountsTransactorRaw struct {
	Contract *StellaridentityaccountsTransactor // Generic write-only contract binding to access the raw methods on
}

// NewStellaridentityaccounts creates a new instance of Stellaridentityaccounts, bound to a specific deployed contract.
func NewStellaridentityaccounts(address common.Address, backend bind.ContractBackend) (*Stellaridentityaccounts, error) {
	contract, err := bindStellaridentityaccounts(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &Stellaridentityaccounts{StellaridentityaccountsCaller: StellaridentityaccountsCaller{contract: contract}, StellaridentityaccountsTransactor: StellaridentityaccountsTransactor{contract: contract}, StellaridentityaccountsFilterer: StellaridentityaccountsFilterer{contract: contract}}, nil
}

// NewStellaridentityaccountsCaller creates a new read-only instance of Stellaridentityaccounts, bound to a specific deployed contract.
func NewStellaridentityaccountsCaller(address common.Address, caller bind.ContractCaller) (*StellaridentityaccountsCaller, error) {
	contract, err := bindStellaridentityaccounts(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &StellaridentityaccountsCaller{contract: contract}, nil
}

// NewStellaridentityaccountsTransactor creates a new write-only instance of Stellaridentityaccounts, bound to a specific deployed contract.
func NewStellaridentityaccountsTransactor(address common.Address, transactor bind.ContractTransactor) (*StellaridentityaccountsTransactor, error) {
	contract, err := bindStellaridentityaccounts(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &StellaridentityaccountsTransactor{contract: contract}, nil
}

// NewStellaridentityaccountsFilterer creates a new log filterer instance of Stellaridentityaccounts, bound to a specific deployed contract.
func NewStellaridentityaccountsFilterer(address common.Address, filterer bind.ContractFilterer) (*StellaridentityaccountsFilterer, error) {
	contract, err := bindStellaridentityaccounts(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &StellaridentityaccountsFilterer{contract: contract}, nil
}

// bindStellaridentityaccounts binds a generic wrapper to an already deployed contract.
func bindStellaridentityaccounts(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := abi.JSON(strings.NewReader(StellaridentityaccountsABI))
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_Stellaridentityaccounts *StellaridentityaccountsRaw) Call(opts *bind.CallOpts, result interface{}, method string, params ...interface{}) error {
	return _Stellaridentityaccounts.Contract.StellaridentityaccountsCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_Stellaridentityaccounts *StellaridentityaccountsRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Stellaridentityaccounts.Contract.StellaridentityaccountsTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_Stellaridentityaccounts *StellaridentityaccountsRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _Stellaridentityaccounts.Contract.StellaridentityaccountsTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_Stellaridentityaccounts *StellaridentityaccountsCallerRaw) Call(opts *bind.CallOpts, result interface{}, method string, params ...interface{}) error {
	return _Stellaridentityaccounts.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_Stellaridentityaccounts *StellaridentityaccountsTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Stellaridentityaccounts.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_Stellaridentityaccounts *StellaridentityaccountsTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _Stellaridentityaccounts.Contract.contract.Transact(opts, method, params...)
}

// GetAccounts is a free data retrieval call binding the contract method 0x3100ceb5.
//
// Solidity: function getAccounts(identity address) constant returns(bytes32[])
func (_Stellaridentityaccounts *StellaridentityaccountsCaller) GetAccounts(opts *bind.CallOpts, identity common.Address) ([][32]byte, error) {
	var (
		ret0 = new([][32]byte)
	)
	out := ret0
	err := _Stellaridentityaccounts.contract.Call(opts, out, "getAccounts", identity)
	return *ret0, err
}

// GetAccounts is a free data retrieval call binding the contract method 0x3100ceb5.
//
// Solidity: function getAccounts(identity address) constant returns(bytes32[])
func (_Stellaridentityaccounts *StellaridentityaccountsSession) GetAccounts(identity common.Address) ([][32]byte, error) {
	return _Stellaridentityaccounts.Contract.GetAccounts(&_Stellaridentityaccounts.CallOpts, identity)
}

// GetAccounts is a free data retrieval call binding the contract method 0x3100ceb5.
//
// Solidity: function getAccounts(identity address) constant returns(bytes32[])
func (_Stellaridentityaccounts *StellaridentityaccountsCallerSession) GetAccounts(identity common.Address) ([][32]byte, error) {
	return _Stellaridentityaccounts.Contract.GetAccounts(&_Stellaridentityaccounts.CallOpts, identity)
}

// GetIdentity is a free data retrieval call binding the contract method 0xa7867212.
//
// Solidity: function getIdentity(account bytes32) constant returns(address)
func (_Stellaridentityaccounts *StellaridentityaccountsCaller) GetIdentity(opts *bind.CallOpts, account [32]byte) (common.Address, error) {
	var (
		ret0 = new(common.Address)
	)
	out := ret0
	err := _Stellaridentityaccounts.contract.Call(opts, out, "getIdentity", account)
	return *ret0, err
}

// GetIdentity is a free data retrieval call binding the contract method 0xa7867212.
//
// Solidity: function getIdentity(account bytes32) constant returns(address)
func (_Stellaridentityaccounts *StellaridentityaccountsSession) GetIdentity(account [32]byte) (common.Address, error) {
	return _Stellaridentityaccounts.Contract.GetIdentity(&_Stellaridentityaccounts.CallOpts, account)
}

// GetIdentity is a free data retrieval call binding the contract method 0xa7867212.
//
// Solidity: function getIdentity(account bytes32) constant returns(address)
func (_Stellaridentityaccounts *StellaridentityaccountsCallerSession) GetIdentity(account [32]byte) (common.Address, error) {
	return _Stellaridentityaccounts.Contract.GetIdentity(&_Stellaridentityaccounts.CallOpts, account)
}

// Owner is a free data retrieval call binding the contract method 0x8da5cb5b.
//
// Solidity: function owner() constant returns(address)
func (_Stellaridentityaccounts *StellaridentityaccountsCaller) Owner(opts *bind.CallOpts) (common.Address, error) {
	var (
		ret0 = new(common.Address)
	)
	out := ret0
	err := _Stellaridentityaccounts.contract.Call(opts, out, "owner")
	return *ret0, err
}

// Owner is a free data retrieval call binding the contract method 0x8da5cb5b.
//
// Solidity: function owner() constant returns(address)
func (_Stellaridentityaccounts *StellaridentityaccountsSession) Owner() (common.Address, error) {
	return _Stellaridentityaccounts.Contract.Owner(&_Stellaridentityaccounts.CallOpts)
}

// Owner is a free data retrieval call binding the contract method 0x8da5cb5b.
//
// Solidity: function owner() constant returns(address)
func (_Stellaridentityaccounts *StellaridentityaccountsCallerSession) Owner() (common.Address, error) {
	return _Stellaridentityaccounts.Contract.Owner(&_Stellaridentityaccounts.CallOpts)
}

// Registry is a free data retrieval call binding the contract method 0x7b103999.
//
// Solidity: function registry() constant returns(address)
func (_Stellaridentityaccounts *StellaridentityaccountsCaller) Registry(opts *bind.CallOpts) (common.Address, error) {
	var (
		ret0 = new(common.Address)
	)
	out := ret0
	err := _Stellaridentityaccounts.contract.Call(opts, out, "registry")
	return *ret0, err
}

// Registry is a free data retrieval call binding the contract method 0x7b103999.
//
// Solidity: function registry() constant returns(address)
func (_Stellaridentityaccounts *StellaridentityaccountsSession) Registry() (common.Address, error) {
	return _Stellaridentityaccounts.Contract.Registry(&_Stellaridentityaccounts.CallOpts)
}

// Registry is a free data retrieval call binding the contract method 0x7b103999.
//
// Solidity: function registry() constant returns(address)
func (_Stellaridentityaccounts *StellaridentityaccountsCallerSession) Registry() (common.Address, error) {
	return _Stellaridentityaccounts.Contract.Registry(&_Stellaridentityaccounts.CallOpts)
}

// AddAccount is a paid mutator transaction binding the contract method 0x5d8b7bb3.
//
// Solidity: function addAccount(identity address, account bytes32) returns(bool)
func (_Stellaridentityaccounts *StellaridentityaccountsTransactor) AddAccount(opts *bind.TransactOpts, identity common.Address, account [32]byte) (*types.Transaction, error) {
	return _Stellaridentityaccounts.contract.Transact(opts, "addAccount", identity, account)
}

// AddAccount is a paid mutator transaction binding the contract method 0x5d8b7bb3.
//
// Solidity: function addAccount(identity address, account bytes32) returns(bool)
func (_Stellaridentityaccounts *StellaridentityaccountsSession) AddAccount(identity common.Address, account [32]byte) (*types.Transaction, error) {
	return _Stellaridentityaccounts.Contract.AddAccount(&_Stellaridentityaccounts.TransactOpts, identity, account)
}

// AddAccount is a paid mutator transaction binding the contract method 0x5d8b7bb3.
//
// Solidity: function addAccount(identity address, account bytes32) returns(bool)
func (_Stellaridentityaccounts *StellaridentityaccountsTransactorSession) AddAccount(identity common.Address, account [32]byte) (*types.Transaction, error) {
	return _Stellaridentityaccounts.Contract.AddAccount(&_Stellaridentityaccounts.TransactOpts, identity, account)
}

// Approve is a paid mutator transaction binding the contract method 0x5cd2f4d3.
//
// Solidity: function approve(identity address, account bytes32) returns(bool)
func (_Stellaridentityaccounts *StellaridentityaccountsTransactor) Approve(opts *bind.TransactOpts, identity common.Address, account [32]byte) (*types.Transaction, error) {
	return _Stellaridentityaccounts.contract.Transact(opts, "approve", identity, account)
}

// Approve is a paid mutator transaction binding the contract method 0x5cd2f4d3.
//
// Solidity: function approve(identity address, account bytes32) returns(bool)
func (_Stellaridentityaccounts *StellaridentityaccountsSession) Approve(identity common.Address, account [32]byte) (*types.Transaction, error) {
	return _Stellaridentityaccounts.Contract.Approve(&_Stellaridentityaccounts.TransactOpts, identity, account)
}

// Approve is a paid mutator transaction binding the contract method 0x5cd2f4d3.
//
// Solidity: function approve(identity address, account bytes32) returns(bool)
func (_Stellaridentityaccounts *StellaridentityaccountsTransactorSession) Approve(identity common.Address, account [32]byte) (*types.Transaction, error) {
	return _Stellaridentityaccounts.Contract.Approve(&_Stellaridentityaccounts.TransactOpts, identity, account)
}

// RemoveAccount is a paid mutator transaction binding the contract method 0xc039f242.
//
// Solidity: function removeAccount(identity address, account bytes32) returns(bool)
func (_Stellaridentityaccounts *StellaridentityaccountsTransactor) RemoveAccount(opts *bind.TransactOpts, identity common.Address, account [32]byte) (*types.Transaction, error) {
	return _Stellaridentityaccounts.contract.Transact(opts, "removeAccount", identity, account)
}

// RemoveAccount is a paid mutator transaction binding the contract method 0xc039f242.
//
// Solidity: function removeAccount(identity address, account bytes32) returns(bool)
func (_Stellaridentityaccounts *StellaridentityaccountsSession) RemoveAccount(identity common.Address, account [32]byte) (*types.Transaction, error) {
	return _Stellaridentityaccounts.Contract.RemoveAccount(&_Stellaridentityaccounts.TransactOpts, identity, account)
}

// RemoveAccount is a paid mutator transaction binding the contract method 0xc039f242.
//
// Solidity: function removeAccount(identity address, account bytes32) returns(bool)
func (_Stellaridentityaccounts *StellaridentityaccountsTransactorSession) RemoveAccount(identity common.Address, account [32]byte) (*types.Transaction, error) {
	return _Stellaridentityaccounts.Contract.RemoveAccount(&_Stellaridentityaccounts.TransactOpts, identity, account)
}

// TransferOwnership is a paid mutator transaction binding the contract method 0xf2fde38b.
//
// Solidity: function transferOwnership(_newOwner address) returns()
func (_Stellaridentityaccounts *StellaridentityaccountsTransactor) TransferOwnership(opts *bind.TransactOpts, _newOwner common.Address) (*types.Transaction, error) {
	return _Stellaridentityaccounts.contract.Transact(opts, "transferOwnership", _newOwner)
}

// TransferOwnership is a paid mutator transaction binding the contract method 0xf2fde38b.
//
// Solidity: function transferOwnership(_newOwner address) returns()
func (_Stellaridentityaccounts *StellaridentityaccountsSession) TransferOwnership(_newOwner common.Address) (*types.Transaction, error) {
	return _Stellaridentityaccounts.Contract.TransferOwnership(&_Stellaridentityaccounts.TransactOpts, _newOwner)
}

// TransferOwnership is a paid mutator transaction binding the contract method 0xf2fde38b.
//
// Solidity: function transferOwnership(_newOwner address) returns()
func (_Stellaridentityaccounts *StellaridentityaccountsTransactorSession) TransferOwnership(_newOwner common.Address) (*types.Transaction, error) {
	return _Stellaridentityaccounts.Contract.TransferOwnership(&_Stellaridentityaccounts.TransactOpts, _newOwner)
}

// StellaridentityaccountsAccountAddedIterator is returned from FilterAccountAdded and is used to iterate over the raw logs and unpacked data for AccountAdded events raised by the Stellaridentityaccounts contract.
type StellaridentityaccountsAccountAddedIterator struct {
	Event *StellaridentityaccountsAccountAdded // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *StellaridentityaccountsAccountAddedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(StellaridentityaccountsAccountAdded)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(StellaridentityaccountsAccountAdded)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *StellaridentityaccountsAccountAddedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *StellaridentityaccountsAccountAddedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// StellaridentityaccountsAccountAdded represents a AccountAdded event raised by the Stellaridentityaccounts contract.
type StellaridentityaccountsAccountAdded struct {
	Identity common.Address
	Account  [32]byte
	Raw      types.Log // Blockchain specific contextual infos
}

// FilterAccountAdded is a free log retrieval operation binding the contract event 0x09163f55dc2f2008a65785b2c4ef132aab22d6825e437d115ce002d126682e32.
//
// Solidity: e AccountAdded(identity address, account bytes32)
func (_Stellaridentityaccounts *StellaridentityaccountsFilterer) FilterAccountAdded(opts *bind.FilterOpts) (*StellaridentityaccountsAccountAddedIterator, error) {

	logs, sub, err := _Stellaridentityaccounts.contract.FilterLogs(opts, "AccountAdded")
	if err != nil {
		return nil, err
	}
	return &StellaridentityaccountsAccountAddedIterator{contract: _Stellaridentityaccounts.contract, event: "AccountAdded", logs: logs, sub: sub}, nil
}

// WatchAccountAdded is a free log subscription operation binding the contract event 0x09163f55dc2f2008a65785b2c4ef132aab22d6825e437d115ce002d126682e32.
//
// Solidity: e AccountAdded(identity address, account bytes32)
func (_Stellaridentityaccounts *StellaridentityaccountsFilterer) WatchAccountAdded(opts *bind.WatchOpts, sink chan<- *StellaridentityaccountsAccountAdded) (event.Subscription, error) {

	logs, sub, err := _Stellaridentityaccounts.contract.WatchLogs(opts, "AccountAdded")
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(StellaridentityaccountsAccountAdded)
				if err := _Stellaridentityaccounts.contract.UnpackLog(event, "AccountAdded", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// StellaridentityaccountsAccountRemovedIterator is returned from FilterAccountRemoved and is used to iterate over the raw logs and unpacked data for AccountRemoved events raised by the Stellaridentityaccounts contract.
type StellaridentityaccountsAccountRemovedIterator struct {
	Event *StellaridentityaccountsAccountRemoved // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *StellaridentityaccountsAccountRemovedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(StellaridentityaccountsAccountRemoved)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(StellaridentityaccountsAccountRemoved)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *StellaridentityaccountsAccountRemovedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *StellaridentityaccountsAccountRemovedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// StellaridentityaccountsAccountRemoved represents a AccountRemoved event raised by the Stellaridentityaccounts contract.
type StellaridentityaccountsAccountRemoved struct {
	Identity common.Address
	Account  [32]byte
	Raw      types.Log // Blockchain specific contextual infos
}

// FilterAccountRemoved is a free log retrieval operation binding the contract event 0x8a01c8fb015f11879628fd01fad3e27c061f05e281d56c62fa6e251be294b72f.
//
// Solidity: e AccountRemoved(identity address, account bytes32)
func (_Stellaridentityaccounts *StellaridentityaccountsFilterer) FilterAccountRemoved(opts *bind.FilterOpts) (*StellaridentityaccountsAccountRemovedIterator, error) {

	logs, sub, err := _Stellaridentityaccounts.contract.FilterLogs(opts, "AccountRemoved")
	if err != nil {
		return nil, err
	}
	return &StellaridentityaccountsAccountRemovedIterator{contract: _Stellaridentityaccounts.contract, event: "AccountRemoved", logs: logs, sub: sub}, nil
}

// WatchAccountRemoved is a free log subscription operation binding the contract event 0x8a01c8fb015f11879628fd01fad3e27c061f05e281d56c62fa6e251be294b72f.
//
// Solidity: e AccountRemoved(identity address, account bytes32)
func (_Stellaridentityaccounts *StellaridentityaccountsFilterer) WatchAccountRemoved(opts *bind.WatchOpts, sink chan<- *StellaridentityaccountsAccountRemoved) (event.Subscription, error) {

	logs, sub, err := _Stellaridentityaccounts.contract.WatchLogs(opts, "AccountRemoved")
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(StellaridentityaccountsAccountRemoved)
				if err := _Stellaridentityaccounts.contract.UnpackLog(event, "AccountRemoved", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// StellaridentityaccountsAccountRequestedIterator is returned from FilterAccountRequested and is used to iterate over the raw logs and unpacked data for AccountRequested events raised by the Stellaridentityaccounts contract.
type StellaridentityaccountsAccountRequestedIterator struct {
	Event *StellaridentityaccountsAccountRequested // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *StellaridentityaccountsAccountRequestedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(StellaridentityaccountsAccountRequested)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(StellaridentityaccountsAccountRequested)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *StellaridentityaccountsAccountRequestedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *StellaridentityaccountsAccountRequestedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// StellaridentityaccountsAccountRequested represents a AccountRequested event raised by the Stellaridentityaccounts contract.
type StellaridentityaccountsAccountRequested struct {
	Identity common.Address
	Account  [32]byte
	Raw      types.Log // Blockchain specific contextual infos
}

// FilterAccountRequested is a free log retrieval operation binding the contract event 0x7330128996a8e25ee5850873f28dbeed6551030d2c577f9210d6764c4b1da4fe.
//
// Solidity: e AccountRequested(identity address, account bytes32)
func (_Stellaridentityaccounts *StellaridentityaccountsFilterer) FilterAccountRequested(opts *bind.FilterOpts) (*StellaridentityaccountsAccountRequestedIterator, error) {

	logs, sub, err := _Stellaridentityaccounts.contract.FilterLogs(opts, "AccountRequested")
	if err != nil {
		return nil, err
	}
	return &StellaridentityaccountsAccountRequestedIterator{contract: _Stellaridentityaccounts.contract, event: "AccountRequested", logs: logs, sub: sub}, nil
}

// WatchAccountRequested is a free log subscription operation binding the contract event 0x7330128996a8e25ee5850873f28dbeed6551030d2c577f9210d6764c4b1da4fe.
//
// Solidity: e AccountRequested(identity address, account bytes32)
func (_Stellaridentityaccounts *StellaridentityaccountsFilterer) WatchAccountRequested(opts *bind.WatchOpts, sink chan<- *StellaridentityaccountsAccountRequested) (event.Subscription, error) {

	logs, sub, err := _Stellaridentityaccounts.contract.WatchLogs(opts, "AccountRequested")
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(StellaridentityaccountsAccountRequested)
				if err := _Stellaridentityaccounts.contract.UnpackLog(event, "AccountRequested", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// StellaridentityaccountsOwnershipRenouncedIterator is returned from FilterOwnershipRenounced and is used to iterate over the raw logs and unpacked data for OwnershipRenounced events raised by the Stellaridentityaccounts contract.
type StellaridentityaccountsOwnershipRenouncedIterator struct {
	Event *StellaridentityaccountsOwnershipRenounced // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *StellaridentityaccountsOwnershipRenouncedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(StellaridentityaccountsOwnershipRenounced)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(StellaridentityaccountsOwnershipRenounced)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *StellaridentityaccountsOwnershipRenouncedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *StellaridentityaccountsOwnershipRenouncedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// StellaridentityaccountsOwnershipRenounced represents a OwnershipRenounced event raised by the Stellaridentityaccounts contract.
type StellaridentityaccountsOwnershipRenounced struct {
	PreviousOwner common.Address
	Raw           types.Log // Blockchain specific contextual infos
}

// FilterOwnershipRenounced is a free log retrieval operation binding the contract event 0xf8df31144d9c2f0f6b59d69b8b98abd5459d07f2742c4df920b25aae33c64820.
//
// Solidity: e OwnershipRenounced(previousOwner indexed address)
func (_Stellaridentityaccounts *StellaridentityaccountsFilterer) FilterOwnershipRenounced(opts *bind.FilterOpts, previousOwner []common.Address) (*StellaridentityaccountsOwnershipRenouncedIterator, error) {

	var previousOwnerRule []interface{}
	for _, previousOwnerItem := range previousOwner {
		previousOwnerRule = append(previousOwnerRule, previousOwnerItem)
	}

	logs, sub, err := _Stellaridentityaccounts.contract.FilterLogs(opts, "OwnershipRenounced", previousOwnerRule)
	if err != nil {
		return nil, err
	}
	return &StellaridentityaccountsOwnershipRenouncedIterator{contract: _Stellaridentityaccounts.contract, event: "OwnershipRenounced", logs: logs, sub: sub}, nil
}

// WatchOwnershipRenounced is a free log subscription operation binding the contract event 0xf8df31144d9c2f0f6b59d69b8b98abd5459d07f2742c4df920b25aae33c64820.
//
// Solidity: e OwnershipRenounced(previousOwner indexed address)
func (_Stellaridentityaccounts *StellaridentityaccountsFilterer) WatchOwnershipRenounced(opts *bind.WatchOpts, sink chan<- *StellaridentityaccountsOwnershipRenounced, previousOwner []common.Address) (event.Subscription, error) {

	var previousOwnerRule []interface{}
	for _, previousOwnerItem := range previousOwner {
		previousOwnerRule = append(previousOwnerRule, previousOwnerItem)
	}

	logs, sub, err := _Stellaridentityaccounts.contract.WatchLogs(opts, "OwnershipRenounced", previousOwnerRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(StellaridentityaccountsOwnershipRenounced)
				if err := _Stellaridentityaccounts.contract.UnpackLog(event, "OwnershipRenounced", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// StellaridentityaccountsOwnershipTransferredIterator is returned from FilterOwnershipTransferred and is used to iterate over the raw logs and unpacked data for OwnershipTransferred events raised by the Stellaridentityaccounts contract.
type StellaridentityaccountsOwnershipTransferredIterator struct {
	Event *StellaridentityaccountsOwnershipTransferred // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *StellaridentityaccountsOwnershipTransferredIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(StellaridentityaccountsOwnershipTransferred)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(StellaridentityaccountsOwnershipTransferred)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *StellaridentityaccountsOwnershipTransferredIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *StellaridentityaccountsOwnershipTransferredIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// StellaridentityaccountsOwnershipTransferred represents a OwnershipTransferred event raised by the Stellaridentityaccounts contract.
type StellaridentityaccountsOwnershipTransferred struct {
	PreviousOwner common.Address
	NewOwner      common.Address
	Raw           types.Log // Blockchain specific contextual infos
}

// FilterOwnershipTransferred is a free log retrieval operation binding the contract event 0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0.
//
// Solidity: e OwnershipTransferred(previousOwner indexed address, newOwner indexed address)
func (_Stellaridentityaccounts *StellaridentityaccountsFilterer) FilterOwnershipTransferred(opts *bind.FilterOpts, previousOwner []common.Address, newOwner []common.Address) (*StellaridentityaccountsOwnershipTransferredIterator, error) {

	var previousOwnerRule []interface{}
	for _, previousOwnerItem := range previousOwner {
		previousOwnerRule = append(previousOwnerRule, previousOwnerItem)
	}
	var newOwnerRule []interface{}
	for _, newOwnerItem := range newOwner {
		newOwnerRule = append(newOwnerRule, newOwnerItem)
	}

	logs, sub, err := _Stellaridentityaccounts.contract.FilterLogs(opts, "OwnershipTransferred", previousOwnerRule, newOwnerRule)
	if err != nil {
		return nil, err
	}
	return &StellaridentityaccountsOwnershipTransferredIterator{contract: _Stellaridentityaccounts.contract, event: "OwnershipTransferred", logs: logs, sub: sub}, nil
}

// WatchOwnershipTransferred is a free log subscription operation binding the contract event 0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0.
//
// Solidity: e OwnershipTransferred(previousOwner indexed address, newOwner indexed address)
func (_Stellaridentityaccounts *StellaridentityaccountsFilterer) WatchOwnershipTransferred(opts *bind.WatchOpts, sink chan<- *StellaridentityaccountsOwnershipTransferred, previousOwner []common.Address, newOwner []common.Address) (event.Subscription, error) {

	var previousOwnerRule []interface{}
	for _, previousOwnerItem := range previousOwner {
		previousOwnerRule = append(previousOwnerRule, previousOwnerItem)
	}
	var newOwnerRule []interface{}
	for _, newOwnerItem := range newOwner {
		newOwnerRule = append(newOwnerRule, newOwnerItem)
	}

	logs, sub, err := _Stellaridentityaccounts.contract.WatchLogs(opts, "OwnershipTransferred", previousOwnerRule, newOwnerRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(StellaridentityaccountsOwnershipTransferred)
				if err := _Stellaridentityaccounts.contract.UnpackLog(event, "OwnershipTransferred", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}
