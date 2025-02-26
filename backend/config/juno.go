package config

type JunoConfig struct {
	ChainID        string
	RPCEndpoint    string
	ContractAddress string
	GasPrice       string
	GasAdjustment  float64
}

func NewJunoConfig() *JunoConfig {
	return &JunoConfig{
		ChainID:        "juno-1", // Mainnet
		RPCEndpoint:    "https://rpc-juno.itastakers.com",
		ContractAddress: "", // To be set after contract deployment
		GasPrice:       "0.0025ujuno",
		GasAdjustment:  1.3,
	}
}

func NewJunoTestConfig() *JunoConfig {
	return &JunoConfig{
		ChainID:        "uni-6", // Testnet
		RPCEndpoint:    "https://rpc.uni.juno.deuslabs.fi",
		ContractAddress: "", // To be set after contract deployment
		GasPrice:       "0.0025ujunox",
		GasAdjustment:  1.3,
	}
}