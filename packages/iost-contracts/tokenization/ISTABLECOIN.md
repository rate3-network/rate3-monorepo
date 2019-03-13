## SETUP/ADMIN
### Ethereum
1. ADMIN (Rate3)Ethereum account deploys a IOSTConversionReceiver contract.
2. ADMIN specifies feeCollectionWallet address and coldStorageWallet addresses and can ERC20 withdraw tokens from contract.
3. NOTE: This means this is still a relatively centralized escrow service, similar to WBTC (Wrapped Bitcoin).
4. The reason for a 'cold storage' wallet is to minimize the risk in the case the owner of the contract is compromised, minimal funds are lost.

### IOST
1. ADMIN (Rate3) IOST account deploys a BaseToken contract.
2. ADMIN can mint tokens at will, or blacklist accounts.

## FLOW
### ERC20 (USDC) -> IOST (IUSDC)
1. User deposits USDC token into IOSTConversionReceiver contract through requestConversion. (needs to approve contract for us to handle their ERC20 token first before contract interaction)
2. If user at this point has certain amount of RTE ERC20 tokens in their balance, they get discounted fees, else normal fees.
3. If ADMIN approves, tokens are locked in the IOSTConversionReceiver contract with fees deducted. If not, the full amount is refunded back to User.
4. A ConversionAccepted event is emitted, with information such as the token amount and the corresponding IOST account id (to receive the tokens).

5. ADMIN mints the netAmount of tokens (original amount minus fees) on the IOST (IUSDC) contract to the specified IOST account id that is on the emitted Ethereum event.
6. This way, there is transparency. If tokens are minted without the corresponding Ethereum events to match, red flags can be raised. (Each conversion has a unique id)

### IOST (IUSDC) -> ERC20 (USDC)
1. User calls convertToERC20 on IOST (IUSDC) contract, burns tokens while specifying ethAddress.
2. User will also call the Ethereum IOSTConversionReceiver contract requestConversionUnlock method and supply the IOST transaction hash and corresponding Etheruem address for the conversion. (The UI will take care of it)
3.If user at this point has certain amount of RTE ERC20 tokens in their balance, they get discounted fees, else normal fees.
4. ADMIN will approve/reject on the ConversionUnlock, by checking whether the transaction hash on IOST blockchain receipt that indeed tokens have been burned, and that the Ethereum address match the request.

5. If ADMIN approves, netAmount (conversion amount minus fees) of the USDC ERC20 token will be released to the Ethereum address.
6. If ADMIN rejects, this usually means a wrong IOST transaction hash has been supplied and we cant verify, or the wrong Ethereum address requested for conversion.

In this structure, the approve process can be automated, since the sources of truth are on both blockchains, assuming both are not compromised.
