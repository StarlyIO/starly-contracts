package transactions_test

import (
	"github.com/StarlyIO/starly-contracts/lib/go/transactions"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestSetupAccountTransaction(t *testing.T) {
	tx := transactions.SetupAccountTransaction("0A", "0B", "0C", "0D", "0E")
	assert.NotNil(t, tx)
}

func TestTransferFlowTransaction(t *testing.T) {
	tx := transactions.TransferFlowTransaction("0A", "0B")
	assert.NotNil(t, tx)
}

func TestMintFlowTransaction(t *testing.T) {
	tx := transactions.MintFlowTransaction("0A", "0B")
	assert.NotNil(t, tx)
}

func TestMintFUSDTransaction(t *testing.T) {
	tx := transactions.MintFUSDTransaction("0A", "0B")
	assert.NotNil(t, tx)
}

func TestMintStarlyCardTransaction(t *testing.T) {
	tx := transactions.MintStarlyCardTransaction("0A", "0B")
	assert.NotNil(t, tx)
}

func TestMintStarlyCardsTransaction(t *testing.T) {
	tx := transactions.MintStarlyCardsTransaction("0A", "0B")
	assert.NotNil(t, tx)
}

func TestSetupStarlyCardTransaction(t *testing.T) {
	tx := transactions.SetupStarlyCardTransaction("0A", "0B")
	assert.NotNil(t, tx)
}

func TestTransferStarlyCardTransaction(t *testing.T) {
	tx := transactions.TransferStarlyCardTransaction("0A", "0B")
	assert.NotNil(t, tx)
}

func TestAcceptSaleOfferTransaction(t *testing.T) {
	tx := transactions.AcceptSaleOfferTransaction("0A", "0B", "0C", "0D", "0E")
	assert.NotNil(t, tx)
}

func TestCancelSaleOfferTransaction(t *testing.T) {
	tx := transactions.CancelSaleOfferTransaction("0A")
	assert.NotNil(t, tx)
}

func TestCreateSaleOfferTransaction(t *testing.T) {
	tx := transactions.CreateSaleOfferTransaction("0A", "0B", "0C", "0D", "0E")
	assert.NotNil(t, tx)
}

func TestBuyStarlyPackTransaction(t *testing.T) {
	tx := transactions.BuyStarlyPackTransaction("0A", "0B", "0C", "0D")
	assert.NotNil(t, tx)
}

func TestBuyStarlyPackFlowTransaction(t *testing.T) {
	tx := transactions.BuyStarlyPackFlowTransaction("0A", "0B", "0C", "0D")
	assert.NotNil(t, tx)
}

