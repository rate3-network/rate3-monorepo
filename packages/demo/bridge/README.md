# Stellar Bridge

This folder houses the tools and services for bridging Stellar and Ethereum.

## Dependencies

This repository depends upon a [number of external dependencies](./Gopkg.lock), and uses [dep](https://golang.github.io/dep/) to manage them (see installation instructions [here](https://golang.github.io/dep/docs/installation.html)).

To satisfy dependencies and populate the `vendor` directory run:

```bash
$ dep ensure -v
```

### Smart Contract ABI generation

We need to install a tool called `abigen` for generating the ABI from a solidity smart contract.

Run the following to install the abigen tool.

```bash
$ go get -u github.com/ethereum/go-ethereum
$ cd $GOPATH/src/github.com/ethereum/go-ethereum/
$ make
$ make devtools
```

From the truffle generated build, extract the ABI, the pipe it to `abigen`.

```bash
$ cat build/contracts/SomeContract.json | jq -r ".abi" | abigen --abi - --pkg contract --out main.go
```

This will generate a `main.go` file with the package set as `contract`.

### Issues

There might be an issue with the native golang bindings from go-ethereum and dep, see [here](https://github.com/ethereum/go-ethereum/issues/2738).

The solution for now is to download go-ethereum and manually symlink the `secp256k1` package.

```bash
$ go get -u -v github.com/ethereum/go-ethereum
$ cp -a ${GOPATH}/src/github.com/ethereum/go-ethereum/crypto/secp256k1/libsecp256k1 vendor/github.com/ethereum/go-ethereum/crypto/secp256k1/
```

## Package source layout

While much of the code in individual packages is organized based upon different developers' personal preferences, many of the packages follow a simple convention for organizing the declarations inside of a package that aim to aid in your ability to find code.

In each package, there may be one or more of a set of common files:

- *main.go*: Every package should have a `main.go` file.  This file contains the package documentation (unless a separate `doc.go` file is used), _all_ of the exported vars, consts, types and funcs for the package.
- *internal.go*:  This file should contain unexported vars, consts, types, and funcs.  Conceptually, it should be considered the private counterpart to the `main.go` file of a package
- *errors.go*: This file should contains declarations (both types and vars) for errors that are used by the package.
- *example_test.go*: This file should contains example tests, as described at https://blog.golang.org/examples.

In addition to the above files, a package often has files that contains code that is specific to one declared type.  This file uses the snake case form of the type name (for example `loggly_hook.go` would correspond to the type `LogglyHook`).  This file should contain method declarations, interface implementation assertions and any other declarations that are tied solely to to that type.

Each non-test file can have a test counterpart like normal, whose name ends with `_test.go`.  The common files described above also have their own test counterparts... for example `internal_test.go` should contains tests that test unexported behavior and more commonly test helpers that are unexported.

Generally, file contents are sorted by exported/unexported, then declaration type  (ordered as consts, vars, types, then funcs), then finally alphabetically.

### Mocks

Mock structs are kept in the `mocks` folder, they can be automatically generated using [mockery](https://github.com/vektra/mockery) with the command:

```bash
$ mockery -all -recursive -dir <subdir> -output ./mocks/<subdir> -keeptree
```

*Note*:
- `<subdir>` is used here instead of `-recursive` because `-recursive` includes vendor folder.
- `-keeptree` will prevent any name collisions.

## Coding conventions

- Always document exported package elements: vars, consts, funcs, types, etc.
- Tests are better than no tests.
