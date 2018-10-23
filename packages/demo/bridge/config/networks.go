package config

type networks struct {
	Test    bool
	Stellar struct {
		URL string
	}
	Ethereum struct {
		URL                         string
		StellarIdentityAccountsAddr string
		IdentityRegistryAddr        string
	}
}
