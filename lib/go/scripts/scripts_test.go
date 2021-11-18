package scripts_test

import (
	"github.com/MintMe/starly-contracts/lib/go/scripts"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestReadFlowBalanceScript(t *testing.T) {
	script := scripts.ReadFlowBalanceScript("0A", "0B")
	assert.NotNil(t, script)
}

func TestReadFUSDBalanceScript(t *testing.T) {
	script := scripts.ReadFUSDBalanceScript("0A", "0B")
	assert.NotNil(t, script)
}

func TestReadStarlyCardCollectionIdsScript(t *testing.T) {
	script := scripts.ReadStarlyCardCollectionIdsScript("0A", "0B")
	assert.NotNil(t, script)
}

func TestReadStarlyCardCollectionLengthScript(t *testing.T) {
	script := scripts.ReadStarlyCardCollectionLengthScript("0A", "0B")
	assert.NotNil(t, script)
}

func TestReadStarlyIdScript(t *testing.T) {
	script := scripts.ReadStarlyIdScript("0A", "0B")
	assert.NotNil(t, script)
}

func TestReadStarlyCardSupplyScript(t *testing.T) {
	script := scripts.ReadStarlyCardSupplyScript("0A")
	assert.NotNil(t, script)
}

func TestReadStarlyCardMarketCollectionIdsScript(t *testing.T) {
	script := scripts.ReadStarlyCardMarketCollectionIdsScript("0A")
	assert.NotNil(t, script)
}

func TestReadStarlyCardMarketCollectionLengthScript(t *testing.T) {
	script := scripts.ReadStarlyCardMarketCollectionLengthScript("0A")
	assert.NotNil(t, script)
}
