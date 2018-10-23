// Code generated - DO NOT EDIT.
// This file is a generated binding and any manual changes will be lost.

package identityregistry

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

// IdentityregistryABI is the input ABI used to generate the binding from.
const IdentityregistryABI = "[{\"constant\":true,\"inputs\":[],\"name\":\"owner\",\"outputs\":[{\"name\":\"\",\"type\":\"address\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"name\":\"networkAccounts\",\"outputs\":[{\"name\":\"\",\"type\":\"address\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"ETH_NETWORK\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"_newOwner\",\"type\":\"address\"}],\"name\":\"transferOwnership\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"\",\"type\":\"address\"}],\"name\":\"identities\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"name\":\"_keyEnums\",\"type\":\"address\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"name\":\"sender\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"identity\",\"type\":\"address\"}],\"name\":\"NewIdentity\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"previousOwner\",\"type\":\"address\"}],\"name\":\"OwnershipRenounced\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"previousOwner\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"newOwner\",\"type\":\"address\"}],\"name\":\"OwnershipTransferred\",\"type\":\"event\"},{\"constant\":false,\"inputs\":[],\"name\":\"createIdentity\",\"outputs\":[{\"name\":\"\",\"type\":\"address\"}],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"acc\",\"type\":\"address\"}],\"name\":\"setEthereumIdentityAccounts\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"network\",\"type\":\"uint256\"},{\"name\":\"acc\",\"type\":\"address\"}],\"name\":\"setIdentityAccounts\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"network\",\"type\":\"uint256\"}],\"name\":\"removeIdentityAccounts\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"}]"

// Identityregistry is an auto generated Go binding around an Ethereum contract.
type Identityregistry struct {
	IdentityregistryCaller     // Read-only binding to the contract
	IdentityregistryTransactor // Write-only binding to the contract
	IdentityregistryFilterer   // Log filterer for contract events
}

// IdentityregistryCaller is an auto generated read-only Go binding around an Ethereum contract.
type IdentityregistryCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// IdentityregistryTransactor is an auto generated write-only Go binding around an Ethereum contract.
type IdentityregistryTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// IdentityregistryFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type IdentityregistryFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// IdentityregistrySession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type IdentityregistrySession struct {
	Contract     *Identityregistry // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// IdentityregistryCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type IdentityregistryCallerSession struct {
	Contract *IdentityregistryCaller // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts           // Call options to use throughout this session
}

// IdentityregistryTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type IdentityregistryTransactorSession struct {
	Contract     *IdentityregistryTransactor // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts           // Transaction auth options to use throughout this session
}

// IdentityregistryRaw is an auto generated low-level Go binding around an Ethereum contract.
type IdentityregistryRaw struct {
	Contract *Identityregistry // Generic contract binding to access the raw methods on
}

// IdentityregistryCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type IdentityregistryCallerRaw struct {
	Contract *IdentityregistryCaller // Generic read-only contract binding to access the raw methods on
}

// IdentityregistryTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type IdentityregistryTransactorRaw struct {
	Contract *IdentityregistryTransactor // Generic write-only contract binding to access the raw methods on
}

// NewIdentityregistry creates a new instance of Identityregistry, bound to a specific deployed contract.
func NewIdentityregistry(address common.Address, backend bind.ContractBackend) (*Identityregistry, error) {
	contract, err := bindIdentityregistry(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &Identityregistry{IdentityregistryCaller: IdentityregistryCaller{contract: contract}, IdentityregistryTransactor: IdentityregistryTransactor{contract: contract}, IdentityregistryFilterer: IdentityregistryFilterer{contract: contract}}, nil
}

// NewIdentityregistryCaller creates a new read-only instance of Identityregistry, bound to a specific deployed contract.
func NewIdentityregistryCaller(address common.Address, caller bind.ContractCaller) (*IdentityregistryCaller, error) {
	contract, err := bindIdentityregistry(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &IdentityregistryCaller{contract: contract}, nil
}

// NewIdentityregistryTransactor creates a new write-only instance of Identityregistry, bound to a specific deployed contract.
func NewIdentityregistryTransactor(address common.Address, transactor bind.ContractTransactor) (*IdentityregistryTransactor, error) {
	contract, err := bindIdentityregistry(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &IdentityregistryTransactor{contract: contract}, nil
}

// NewIdentityregistryFilterer creates a new log filterer instance of Identityregistry, bound to a specific deployed contract.
func NewIdentityregistryFilterer(address common.Address, filterer bind.ContractFilterer) (*IdentityregistryFilterer, error) {
	contract, err := bindIdentityregistry(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &IdentityregistryFilterer{contract: contract}, nil
}

// bindIdentityregistry binds a generic wrapper to an already deployed contract.
func bindIdentityregistry(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := abi.JSON(strings.NewReader(IdentityregistryABI))
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_Identityregistry *IdentityregistryRaw) Call(opts *bind.CallOpts, result interface{}, method string, params ...interface{}) error {
	return _Identityregistry.Contract.IdentityregistryCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_Identityregistry *IdentityregistryRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Identityregistry.Contract.IdentityregistryTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_Identityregistry *IdentityregistryRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _Identityregistry.Contract.IdentityregistryTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_Identityregistry *IdentityregistryCallerRaw) Call(opts *bind.CallOpts, result interface{}, method string, params ...interface{}) error {
	return _Identityregistry.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_Identityregistry *IdentityregistryTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Identityregistry.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_Identityregistry *IdentityregistryTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _Identityregistry.Contract.contract.Transact(opts, method, params...)
}

// ETHNETWORK is a free data retrieval call binding the contract method 0xd1ae75fa.
//
// Solidity: function ETH_NETWORK() constant returns(uint256)
func (_Identityregistry *IdentityregistryCaller) ETHNETWORK(opts *bind.CallOpts) (*big.Int, error) {
	var (
		ret0 = new(*big.Int)
	)
	out := ret0
	err := _Identityregistry.contract.Call(opts, out, "ETH_NETWORK")
	return *ret0, err
}

// ETHNETWORK is a free data retrieval call binding the contract method 0xd1ae75fa.
//
// Solidity: function ETH_NETWORK() constant returns(uint256)
func (_Identityregistry *IdentityregistrySession) ETHNETWORK() (*big.Int, error) {
	return _Identityregistry.Contract.ETHNETWORK(&_Identityregistry.CallOpts)
}

// ETHNETWORK is a free data retrieval call binding the contract method 0xd1ae75fa.
//
// Solidity: function ETH_NETWORK() constant returns(uint256)
func (_Identityregistry *IdentityregistryCallerSession) ETHNETWORK() (*big.Int, error) {
	return _Identityregistry.Contract.ETHNETWORK(&_Identityregistry.CallOpts)
}

// Identities is a free data retrieval call binding the contract method 0xf653b81e.
//
// Solidity: function identities( address) constant returns(bool)
func (_Identityregistry *IdentityregistryCaller) Identities(opts *bind.CallOpts, arg0 common.Address) (bool, error) {
	var (
		ret0 = new(bool)
	)
	out := ret0
	err := _Identityregistry.contract.Call(opts, out, "identities", arg0)
	return *ret0, err
}

// Identities is a free data retrieval call binding the contract method 0xf653b81e.
//
// Solidity: function identities( address) constant returns(bool)
func (_Identityregistry *IdentityregistrySession) Identities(arg0 common.Address) (bool, error) {
	return _Identityregistry.Contract.Identities(&_Identityregistry.CallOpts, arg0)
}

// Identities is a free data retrieval call binding the contract method 0xf653b81e.
//
// Solidity: function identities( address) constant returns(bool)
func (_Identityregistry *IdentityregistryCallerSession) Identities(arg0 common.Address) (bool, error) {
	return _Identityregistry.Contract.Identities(&_Identityregistry.CallOpts, arg0)
}

// NetworkAccounts is a free data retrieval call binding the contract method 0xb8566785.
//
// Solidity: function networkAccounts( uint256) constant returns(address)
func (_Identityregistry *IdentityregistryCaller) NetworkAccounts(opts *bind.CallOpts, arg0 *big.Int) (common.Address, error) {
	var (
		ret0 = new(common.Address)
	)
	out := ret0
	err := _Identityregistry.contract.Call(opts, out, "networkAccounts", arg0)
	return *ret0, err
}

// NetworkAccounts is a free data retrieval call binding the contract method 0xb8566785.
//
// Solidity: function networkAccounts( uint256) constant returns(address)
func (_Identityregistry *IdentityregistrySession) NetworkAccounts(arg0 *big.Int) (common.Address, error) {
	return _Identityregistry.Contract.NetworkAccounts(&_Identityregistry.CallOpts, arg0)
}

// NetworkAccounts is a free data retrieval call binding the contract method 0xb8566785.
//
// Solidity: function networkAccounts( uint256) constant returns(address)
func (_Identityregistry *IdentityregistryCallerSession) NetworkAccounts(arg0 *big.Int) (common.Address, error) {
	return _Identityregistry.Contract.NetworkAccounts(&_Identityregistry.CallOpts, arg0)
}

// Owner is a free data retrieval call binding the contract method 0x8da5cb5b.
//
// Solidity: function owner() constant returns(address)
func (_Identityregistry *IdentityregistryCaller) Owner(opts *bind.CallOpts) (common.Address, error) {
	var (
		ret0 = new(common.Address)
	)
	out := ret0
	err := _Identityregistry.contract.Call(opts, out, "owner")
	return *ret0, err
}

// Owner is a free data retrieval call binding the contract method 0x8da5cb5b.
//
// Solidity: function owner() constant returns(address)
func (_Identityregistry *IdentityregistrySession) Owner() (common.Address, error) {
	return _Identityregistry.Contract.Owner(&_Identityregistry.CallOpts)
}

// Owner is a free data retrieval call binding the contract method 0x8da5cb5b.
//
// Solidity: function owner() constant returns(address)
func (_Identityregistry *IdentityregistryCallerSession) Owner() (common.Address, error) {
	return _Identityregistry.Contract.Owner(&_Identityregistry.CallOpts)
}

// CreateIdentity is a paid mutator transaction binding the contract method 0x59d21ad9.
//
// Solidity: function createIdentity() returns(address)
func (_Identityregistry *IdentityregistryTransactor) CreateIdentity(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Identityregistry.contract.Transact(opts, "createIdentity")
}

// CreateIdentity is a paid mutator transaction binding the contract method 0x59d21ad9.
//
// Solidity: function createIdentity() returns(address)
func (_Identityregistry *IdentityregistrySession) CreateIdentity() (*types.Transaction, error) {
	return _Identityregistry.Contract.CreateIdentity(&_Identityregistry.TransactOpts)
}

// CreateIdentity is a paid mutator transaction binding the contract method 0x59d21ad9.
//
// Solidity: function createIdentity() returns(address)
func (_Identityregistry *IdentityregistryTransactorSession) CreateIdentity() (*types.Transaction, error) {
	return _Identityregistry.Contract.CreateIdentity(&_Identityregistry.TransactOpts)
}

// RemoveIdentityAccounts is a paid mutator transaction binding the contract method 0x2a437ac7.
//
// Solidity: function removeIdentityAccounts(network uint256) returns()
func (_Identityregistry *IdentityregistryTransactor) RemoveIdentityAccounts(opts *bind.TransactOpts, network *big.Int) (*types.Transaction, error) {
	return _Identityregistry.contract.Transact(opts, "removeIdentityAccounts", network)
}

// RemoveIdentityAccounts is a paid mutator transaction binding the contract method 0x2a437ac7.
//
// Solidity: function removeIdentityAccounts(network uint256) returns()
func (_Identityregistry *IdentityregistrySession) RemoveIdentityAccounts(network *big.Int) (*types.Transaction, error) {
	return _Identityregistry.Contract.RemoveIdentityAccounts(&_Identityregistry.TransactOpts, network)
}

// RemoveIdentityAccounts is a paid mutator transaction binding the contract method 0x2a437ac7.
//
// Solidity: function removeIdentityAccounts(network uint256) returns()
func (_Identityregistry *IdentityregistryTransactorSession) RemoveIdentityAccounts(network *big.Int) (*types.Transaction, error) {
	return _Identityregistry.Contract.RemoveIdentityAccounts(&_Identityregistry.TransactOpts, network)
}

// SetEthereumIdentityAccounts is a paid mutator transaction binding the contract method 0x36ee830d.
//
// Solidity: function setEthereumIdentityAccounts(acc address) returns()
func (_Identityregistry *IdentityregistryTransactor) SetEthereumIdentityAccounts(opts *bind.TransactOpts, acc common.Address) (*types.Transaction, error) {
	return _Identityregistry.contract.Transact(opts, "setEthereumIdentityAccounts", acc)
}

// SetEthereumIdentityAccounts is a paid mutator transaction binding the contract method 0x36ee830d.
//
// Solidity: function setEthereumIdentityAccounts(acc address) returns()
func (_Identityregistry *IdentityregistrySession) SetEthereumIdentityAccounts(acc common.Address) (*types.Transaction, error) {
	return _Identityregistry.Contract.SetEthereumIdentityAccounts(&_Identityregistry.TransactOpts, acc)
}

// SetEthereumIdentityAccounts is a paid mutator transaction binding the contract method 0x36ee830d.
//
// Solidity: function setEthereumIdentityAccounts(acc address) returns()
func (_Identityregistry *IdentityregistryTransactorSession) SetEthereumIdentityAccounts(acc common.Address) (*types.Transaction, error) {
	return _Identityregistry.Contract.SetEthereumIdentityAccounts(&_Identityregistry.TransactOpts, acc)
}

// SetIdentityAccounts is a paid mutator transaction binding the contract method 0xc83296a8.
//
// Solidity: function setIdentityAccounts(network uint256, acc address) returns()
func (_Identityregistry *IdentityregistryTransactor) SetIdentityAccounts(opts *bind.TransactOpts, network *big.Int, acc common.Address) (*types.Transaction, error) {
	return _Identityregistry.contract.Transact(opts, "setIdentityAccounts", network, acc)
}

// SetIdentityAccounts is a paid mutator transaction binding the contract method 0xc83296a8.
//
// Solidity: function setIdentityAccounts(network uint256, acc address) returns()
func (_Identityregistry *IdentityregistrySession) SetIdentityAccounts(network *big.Int, acc common.Address) (*types.Transaction, error) {
	return _Identityregistry.Contract.SetIdentityAccounts(&_Identityregistry.TransactOpts, network, acc)
}

// SetIdentityAccounts is a paid mutator transaction binding the contract method 0xc83296a8.
//
// Solidity: function setIdentityAccounts(network uint256, acc address) returns()
func (_Identityregistry *IdentityregistryTransactorSession) SetIdentityAccounts(network *big.Int, acc common.Address) (*types.Transaction, error) {
	return _Identityregistry.Contract.SetIdentityAccounts(&_Identityregistry.TransactOpts, network, acc)
}

// TransferOwnership is a paid mutator transaction binding the contract method 0xf2fde38b.
//
// Solidity: function transferOwnership(_newOwner address) returns()
func (_Identityregistry *IdentityregistryTransactor) TransferOwnership(opts *bind.TransactOpts, _newOwner common.Address) (*types.Transaction, error) {
	return _Identityregistry.contract.Transact(opts, "transferOwnership", _newOwner)
}

// TransferOwnership is a paid mutator transaction binding the contract method 0xf2fde38b.
//
// Solidity: function transferOwnership(_newOwner address) returns()
func (_Identityregistry *IdentityregistrySession) TransferOwnership(_newOwner common.Address) (*types.Transaction, error) {
	return _Identityregistry.Contract.TransferOwnership(&_Identityregistry.TransactOpts, _newOwner)
}

// TransferOwnership is a paid mutator transaction binding the contract method 0xf2fde38b.
//
// Solidity: function transferOwnership(_newOwner address) returns()
func (_Identityregistry *IdentityregistryTransactorSession) TransferOwnership(_newOwner common.Address) (*types.Transaction, error) {
	return _Identityregistry.Contract.TransferOwnership(&_Identityregistry.TransactOpts, _newOwner)
}

// IdentityregistryNewIdentityIterator is returned from FilterNewIdentity and is used to iterate over the raw logs and unpacked data for NewIdentity events raised by the Identityregistry contract.
type IdentityregistryNewIdentityIterator struct {
	Event *IdentityregistryNewIdentity // Event containing the contract specifics and raw log

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
func (it *IdentityregistryNewIdentityIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(IdentityregistryNewIdentity)
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
		it.Event = new(IdentityregistryNewIdentity)
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
func (it *IdentityregistryNewIdentityIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *IdentityregistryNewIdentityIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// IdentityregistryNewIdentity represents a NewIdentity event raised by the Identityregistry contract.
type IdentityregistryNewIdentity struct {
	Sender   common.Address
	Identity common.Address
	Raw      types.Log // Blockchain specific contextual infos
}

// FilterNewIdentity is a free log retrieval operation binding the contract event 0x4bbb10c11c6c8c35689f097fa303b69ba45da8472d34886663ebbf3b1a42ce28.
//
// Solidity: e NewIdentity(sender address, identity address)
func (_Identityregistry *IdentityregistryFilterer) FilterNewIdentity(opts *bind.FilterOpts) (*IdentityregistryNewIdentityIterator, error) {

	logs, sub, err := _Identityregistry.contract.FilterLogs(opts, "NewIdentity")
	if err != nil {
		return nil, err
	}
	return &IdentityregistryNewIdentityIterator{contract: _Identityregistry.contract, event: "NewIdentity", logs: logs, sub: sub}, nil
}

// WatchNewIdentity is a free log subscription operation binding the contract event 0x4bbb10c11c6c8c35689f097fa303b69ba45da8472d34886663ebbf3b1a42ce28.
//
// Solidity: e NewIdentity(sender address, identity address)
func (_Identityregistry *IdentityregistryFilterer) WatchNewIdentity(opts *bind.WatchOpts, sink chan<- *IdentityregistryNewIdentity) (event.Subscription, error) {

	logs, sub, err := _Identityregistry.contract.WatchLogs(opts, "NewIdentity")
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(IdentityregistryNewIdentity)
				if err := _Identityregistry.contract.UnpackLog(event, "NewIdentity", log); err != nil {
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

// IdentityregistryOwnershipRenouncedIterator is returned from FilterOwnershipRenounced and is used to iterate over the raw logs and unpacked data for OwnershipRenounced events raised by the Identityregistry contract.
type IdentityregistryOwnershipRenouncedIterator struct {
	Event *IdentityregistryOwnershipRenounced // Event containing the contract specifics and raw log

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
func (it *IdentityregistryOwnershipRenouncedIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(IdentityregistryOwnershipRenounced)
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
		it.Event = new(IdentityregistryOwnershipRenounced)
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
func (it *IdentityregistryOwnershipRenouncedIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *IdentityregistryOwnershipRenouncedIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// IdentityregistryOwnershipRenounced represents a OwnershipRenounced event raised by the Identityregistry contract.
type IdentityregistryOwnershipRenounced struct {
	PreviousOwner common.Address
	Raw           types.Log // Blockchain specific contextual infos
}

// FilterOwnershipRenounced is a free log retrieval operation binding the contract event 0xf8df31144d9c2f0f6b59d69b8b98abd5459d07f2742c4df920b25aae33c64820.
//
// Solidity: e OwnershipRenounced(previousOwner indexed address)
func (_Identityregistry *IdentityregistryFilterer) FilterOwnershipRenounced(opts *bind.FilterOpts, previousOwner []common.Address) (*IdentityregistryOwnershipRenouncedIterator, error) {

	var previousOwnerRule []interface{}
	for _, previousOwnerItem := range previousOwner {
		previousOwnerRule = append(previousOwnerRule, previousOwnerItem)
	}

	logs, sub, err := _Identityregistry.contract.FilterLogs(opts, "OwnershipRenounced", previousOwnerRule)
	if err != nil {
		return nil, err
	}
	return &IdentityregistryOwnershipRenouncedIterator{contract: _Identityregistry.contract, event: "OwnershipRenounced", logs: logs, sub: sub}, nil
}

// WatchOwnershipRenounced is a free log subscription operation binding the contract event 0xf8df31144d9c2f0f6b59d69b8b98abd5459d07f2742c4df920b25aae33c64820.
//
// Solidity: e OwnershipRenounced(previousOwner indexed address)
func (_Identityregistry *IdentityregistryFilterer) WatchOwnershipRenounced(opts *bind.WatchOpts, sink chan<- *IdentityregistryOwnershipRenounced, previousOwner []common.Address) (event.Subscription, error) {

	var previousOwnerRule []interface{}
	for _, previousOwnerItem := range previousOwner {
		previousOwnerRule = append(previousOwnerRule, previousOwnerItem)
	}

	logs, sub, err := _Identityregistry.contract.WatchLogs(opts, "OwnershipRenounced", previousOwnerRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(IdentityregistryOwnershipRenounced)
				if err := _Identityregistry.contract.UnpackLog(event, "OwnershipRenounced", log); err != nil {
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

// IdentityregistryOwnershipTransferredIterator is returned from FilterOwnershipTransferred and is used to iterate over the raw logs and unpacked data for OwnershipTransferred events raised by the Identityregistry contract.
type IdentityregistryOwnershipTransferredIterator struct {
	Event *IdentityregistryOwnershipTransferred // Event containing the contract specifics and raw log

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
func (it *IdentityregistryOwnershipTransferredIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(IdentityregistryOwnershipTransferred)
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
		it.Event = new(IdentityregistryOwnershipTransferred)
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
func (it *IdentityregistryOwnershipTransferredIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *IdentityregistryOwnershipTransferredIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// IdentityregistryOwnershipTransferred represents a OwnershipTransferred event raised by the Identityregistry contract.
type IdentityregistryOwnershipTransferred struct {
	PreviousOwner common.Address
	NewOwner      common.Address
	Raw           types.Log // Blockchain specific contextual infos
}

// FilterOwnershipTransferred is a free log retrieval operation binding the contract event 0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0.
//
// Solidity: e OwnershipTransferred(previousOwner indexed address, newOwner indexed address)
func (_Identityregistry *IdentityregistryFilterer) FilterOwnershipTransferred(opts *bind.FilterOpts, previousOwner []common.Address, newOwner []common.Address) (*IdentityregistryOwnershipTransferredIterator, error) {

	var previousOwnerRule []interface{}
	for _, previousOwnerItem := range previousOwner {
		previousOwnerRule = append(previousOwnerRule, previousOwnerItem)
	}
	var newOwnerRule []interface{}
	for _, newOwnerItem := range newOwner {
		newOwnerRule = append(newOwnerRule, newOwnerItem)
	}

	logs, sub, err := _Identityregistry.contract.FilterLogs(opts, "OwnershipTransferred", previousOwnerRule, newOwnerRule)
	if err != nil {
		return nil, err
	}
	return &IdentityregistryOwnershipTransferredIterator{contract: _Identityregistry.contract, event: "OwnershipTransferred", logs: logs, sub: sub}, nil
}

// WatchOwnershipTransferred is a free log subscription operation binding the contract event 0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0.
//
// Solidity: e OwnershipTransferred(previousOwner indexed address, newOwner indexed address)
func (_Identityregistry *IdentityregistryFilterer) WatchOwnershipTransferred(opts *bind.WatchOpts, sink chan<- *IdentityregistryOwnershipTransferred, previousOwner []common.Address, newOwner []common.Address) (event.Subscription, error) {

	var previousOwnerRule []interface{}
	for _, previousOwnerItem := range previousOwner {
		previousOwnerRule = append(previousOwnerRule, previousOwnerItem)
	}
	var newOwnerRule []interface{}
	for _, newOwnerItem := range newOwner {
		newOwnerRule = append(newOwnerRule, newOwnerItem)
	}

	logs, sub, err := _Identityregistry.contract.WatchLogs(opts, "OwnershipTransferred", previousOwnerRule, newOwnerRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(IdentityregistryOwnershipTransferred)
				if err := _Identityregistry.contract.UnpackLog(event, "OwnershipTransferred", log); err != nil {
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
