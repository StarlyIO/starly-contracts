package contracts_test

import (
	"testing"

	"github.com/stretchr/testify/assert"

	"github.com/MintMe/starly-contracts/lib/go/contracts"
)

func TestFungibleTokenContract(t *testing.T) {
	contract := contracts.FungibleToken()
	assert.NotNil(t, contract)
}

func TestFlowTokenContract(t *testing.T) {
	contract := contracts.FlowToken("0x0A")
	assert.NotNil(t, contract)
}

func TestNonFungibleTokenContract(t *testing.T) {
	contract := contracts.NonFungibleToken()
	assert.NotNil(t, contract)
}

func TestFUSDContract(t *testing.T) {
	contract := contracts.FUSD("0x0A")
	assert.NotNil(t, contract)
}

func TestStarlyCardContract(t *testing.T) {
	contract := contracts.StarlyCard("0x0A")
	assert.NotNil(t, contract)
}

func TestStarlyCardMarketContract(t *testing.T) {
	contract := contracts.StarlyCardMarket("0x0A", "0x0B", "0x0C", "0x0D")
	assert.NotNil(t, contract)
}

func TestStarlyPackContract(t *testing.T) {
	contract := contracts.StarlyPack("0x0A", "0x0B", "0x0C")
	assert.NotNil(t, contract)
}
