package test

import (
	"fmt"
	"github.com/StarlyIO/starly-contracts/lib/go/contracts"
	"github.com/StarlyIO/starly-contracts/lib/go/scripts"
	"github.com/StarlyIO/starly-contracts/lib/go/transactions"
	jsoncdc "github.com/onflow/cadence/encoding/json"
	sdktemplates "github.com/onflow/flow-go-sdk/templates"
	"github.com/onflow/flow-go-sdk/test"
	"io/ioutil"
	"testing"

	"github.com/onflow/cadence"
	"github.com/onflow/flow-emulator"
	"github.com/onflow/flow-go-sdk"
	"github.com/onflow/flow-go-sdk/crypto"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type TestUser struct {
	accountKey     *flow.AccountKey
	accountSigner  crypto.Signer
	accountAddress flow.Address
}

func (testUser TestUser) AccountKeys() []*flow.AccountKey {
	return []*flow.AccountKey{testUser.accountKey}
}

func (testUser TestUser) Setup(env Environment) {
	txCode := transactions.SetupAccountTransaction(
		env.fungibleTokenAddress.String(),
		env.nonFungibleTokenAddress.String(),
		env.fusdAddress.String(),
		env.starlyCardAddress.String(),
		env.starlyCardMarketAddress.String(),
	)
	tx := createTxWithTemplateAndAuthorizer(env.b, txCode, testUser.accountAddress)
	signAndSubmit(
		env.t, env.b, tx,
		[]flow.Address{
			env.b.ServiceKey().Address,
			testUser.accountAddress,
		},
		[]crypto.Signer{
			env.b.ServiceKey().Signer(),
			testUser.accountSigner,
		},
		false,
	)
}

func NewTestUser(env Environment) TestUser {
	accountKey, accountSigner := env.accountKeys.NewWithSigner()
	accountAddress, _ := env.b.CreateAccount([]*flow.AccountKey{accountKey}, nil)
	testUser := TestUser{accountKey, accountSigner, accountAddress}
	testUser.Setup(env)
	return testUser
}

type Environment struct {
	t           *testing.T
	b           *emulator.Blockchain
	accountKeys *test.AccountKeys

	fungibleTokenAddress    flow.Address
	nonFungibleTokenAddress flow.Address
	fusdAddress             flow.Address
	fusdAccountKey          *flow.AccountKey
	fusdAccountSigner       crypto.Signer
	starlyCardAddress       flow.Address
	starlyCardKey           *flow.AccountKey
	starlyCardSigner        crypto.Signer
	starlyCardMarketAddress flow.Address
	starlyPackAddress       flow.Address
}

func (env Environment) MintFUSD(address flow.Address, amount string) {
	txCode := transactions.MintFUSDTransaction(
		env.fungibleTokenAddress.String(),
		env.fusdAddress.String(),
	)
	tx := createTxWithTemplateAndAuthorizer(env.b, txCode, env.fusdAddress)
	_ = tx.AddArgument(cadence.Address(address))
	_ = tx.AddArgument(CadenceUFix64(amount))

	signAndSubmit(
		env.t, env.b, tx,
		[]flow.Address{
			env.b.ServiceKey().Address,
			env.fusdAddress,
		},
		[]crypto.Signer{
			env.b.ServiceKey().Signer(),
			env.fusdAccountSigner,
		},
		false,
	)
}

func (env Environment) GetFUSDBalance(address flow.Address) cadence.Value {
	scriptCode := scripts.ReadFUSDBalanceScript(
		env.fungibleTokenAddress.String(),
		env.fusdAddress.String(),
	)
	return executeScriptAndCheck(env.t, env.b, scriptCode, [][]byte{jsoncdc.MustEncode(cadence.Address(address))})
}

func (env Environment) MintStarlyCards(address flow.Address, starlyIDs []string) {
	txCode := transactions.MintStarlyCardsTransaction(
		env.nonFungibleTokenAddress.String(),
		env.starlyCardAddress.String(),
	)
	tx := createTxWithTemplateAndAuthorizer(env.b, txCode, env.starlyCardAddress)
	_ = tx.AddArgument(cadence.Address(address))
	arr := make([]cadence.Value, len(starlyIDs))
	for i, starlyID := range starlyIDs {
		arr[i] = cadence.String(starlyID)
	}
	_ = tx.AddArgument(cadence.NewArray(arr))

	signAndSubmit(
		env.t, env.b, tx,
		[]flow.Address{
			env.b.ServiceKey().Address,
			env.starlyCardAddress,
		},
		[]crypto.Signer{
			env.b.ServiceKey().Signer(),
			env.starlyCardSigner,
		},
		false,
	)
}

func (env Environment) BurnStarlyCard(
	address flow.Address,
	signer crypto.Signer,
	itemID uint64) {
	txCode := transactions.BurnStarlyCardTransaction(
		env.nonFungibleTokenAddress.String(),
		env.starlyCardAddress.String(),
	)
	tx := createTxWithTemplateAndAuthorizer(env.b, txCode, address)
	_ = tx.AddArgument(cadence.UInt64(itemID))

	signAndSubmit(
		env.t, env.b, tx,
		[]flow.Address{
			env.b.ServiceKey().Address,
			address,
		},
		[]crypto.Signer{
			env.b.ServiceKey().Signer(),
			signer,
		},
		false,
	)
}

func (env Environment) ReadStarlyCardSupply() cadence.Value {
	scriptCode := scripts.ReadStarlyCardSupplyScript(
		env.starlyCardAddress.String(),
	)
	return executeScriptAndCheck(env.t, env.b, scriptCode, nil)
}

func (env Environment) ReadStarlyCardCollectionLength(address flow.Address) cadence.Value {
	scriptCode := scripts.ReadStarlyCardCollectionLengthScript(
		env.nonFungibleTokenAddress.String(),
		env.starlyCardAddress.String(),
	)
	return executeScriptAndCheck(
		env.t,
		env.b,
		scriptCode,
		[][]byte{jsoncdc.MustEncode(cadence.Address(address))})
}

func (env Environment) ReadStarlyCardCollectionLengthScript(address flow.Address) cadence.Value {
	scriptCode := scripts.ReadStarlyCardCollectionLengthScript(
		env.nonFungibleTokenAddress.String(),
		env.starlyCardAddress.String(),
	)
	return executeScriptAndCheck(
		env.t,
		env.b,
		scriptCode,
		[][]byte{jsoncdc.MustEncode(cadence.Address(address))})
}

func (env Environment) ReadStarlyCardCollectionIdsScript(address flow.Address) cadence.Value {
	scriptCode := scripts.ReadStarlyCardCollectionIdsScript(
		env.nonFungibleTokenAddress.String(),
		env.starlyCardAddress.String(),
	)
	return executeScriptAndCheck(
		env.t,
		env.b,
		scriptCode,
		[][]byte{jsoncdc.MustEncode(cadence.Address(address))})
}

func (env Environment) GetFirstEventOfType(eventType string) map[string]string {
	var result = make(map[string]string)

	var i uint64 = 0
	for i < 100 {

		results, _ := env.b.GetEventsByHeight(i, eventType)

		for _, event := range results {
			for i, eventType := range event.Value.EventType.Fields {
				result[eventType.Identifier] = event.Value.Fields[i].String()
			}
			return result
		}

		i = i + 1
	}
	return nil
}

func (env Environment) ReadStarlyCardMarketCollectionLengthScript(address flow.Address) cadence.Value {
	scriptCode := scripts.ReadStarlyCardMarketCollectionLengthScript(
		env.starlyCardMarketAddress.String(),
	)
	return executeScriptAndCheck(
		env.t,
		env.b,
		scriptCode,
		[][]byte{jsoncdc.MustEncode(cadence.Address(address))})
}

func (env Environment) ReadStarlyCardMarketCollectionIdsScript(address flow.Address) cadence.Value {
	scriptCode := scripts.ReadStarlyCardMarketCollectionIdsScript(
		env.starlyCardMarketAddress.String(),
	)
	return executeScriptAndCheck(
		env.t,
		env.b,
		scriptCode,
		[][]byte{jsoncdc.MustEncode(cadence.Address(address))})
}

func (env Environment) AcceptSaleOffer(
	itemID uint64,
	sellerAddress flow.Address,
	authorizerAddress flow.Address,
	authorizerSigner crypto.Signer) {
	txCode := transactions.AcceptSaleOfferTransaction(
		env.fungibleTokenAddress.String(),
		env.nonFungibleTokenAddress.String(),
		env.fusdAddress.String(),
		env.starlyCardAddress.String(),
		env.starlyCardMarketAddress.String(),
	)
	tx := createTxWithTemplateAndAuthorizer(env.b, txCode, authorizerAddress)
	_ = tx.AddArgument(cadence.UInt64(itemID))
	_ = tx.AddArgument(cadence.Address(sellerAddress))

	signAndSubmit(
		env.t, env.b, tx,
		[]flow.Address{
			env.b.ServiceKey().Address,
			authorizerAddress,
		},
		[]crypto.Signer{
			env.b.ServiceKey().Signer(),
			authorizerSigner,
		},
		false,
	)
}

func (env Environment) CancelSaleOffer(
	itemID uint64,
	authorizerAddress flow.Address,
	authorizerSigner crypto.Signer) {
	txCode := transactions.CancelSaleOfferTransaction(
		env.starlyCardMarketAddress.String(),
	)
	tx := createTxWithTemplateAndAuthorizer(env.b, txCode, authorizerAddress)
	_ = tx.AddArgument(cadence.UInt64(itemID))

	signAndSubmit(
		env.t, env.b, tx,
		[]flow.Address{
			env.b.ServiceKey().Address,
			authorizerAddress,
		},
		[]crypto.Signer{
			env.b.ServiceKey().Signer(),
			authorizerSigner,
		},
		false,
	)
}

func (env Environment) CreateSaleOffer(
	itemID uint64,
	price string,
	beneficiaryAddress flow.Address,
	beneficiaryCutPercent string,
	creatorAddress flow.Address,
	creatorCutPercent string,
	authorizerAddress flow.Address,
	authorizerSigner crypto.Signer) {
	txCode := transactions.CreateSaleOfferTransaction(
		env.fungibleTokenAddress.String(),
		env.nonFungibleTokenAddress.String(),
		env.fusdAddress.String(),
		env.starlyCardAddress.String(),
		env.starlyCardMarketAddress.String(),
	)
	tx := createTxWithTemplateAndAuthorizer(env.b, txCode, authorizerAddress)
	_ = tx.AddArgument(cadence.UInt64(itemID))
	_ = tx.AddArgument(CadenceUFix64(price))
	_ = tx.AddArgument(cadence.Address(beneficiaryAddress))
	_ = tx.AddArgument(CadenceUFix64(beneficiaryCutPercent))
	_ = tx.AddArgument(cadence.Address(creatorAddress))
	_ = tx.AddArgument(CadenceUFix64(creatorCutPercent))

	signAndSubmit(
		env.t, env.b, tx,
		[]flow.Address{
			env.b.ServiceKey().Address,
			authorizerAddress,
		},
		[]crypto.Signer{
			env.b.ServiceKey().Signer(),
			authorizerSigner,
		},
		false,
	)
}

func (env Environment) BuyPack(
	collectionID string,
	packIDs []string,
	price string,
	beneficiaryAddress flow.Address,
	beneficiaryCurPercent string,
	creatorAddress flow.Address,
	creatorCutPercent string,
	authorizerAddress flow.Address,
	authorizerSigner crypto.Signer) {
	transaction := transactions.BuyStarlyPackTransaction(
		env.fungibleTokenAddress.String(),
		env.fusdAddress.String(),
		env.starlyCardMarketAddress.String(),
		env.starlyPackAddress.String(),
	)

	var cadencePackIDs []cadence.Value
	for _, packID := range packIDs {
		cadencePackIDs = append(cadencePackIDs, cadence.String(packID)) // note the = instead of :=
	}

	tx := createTxWithTemplateAndAuthorizer(env.b, transaction, authorizerAddress)
	_ = tx.AddArgument(cadence.String(collectionID))
	_ = tx.AddArgument(cadence.NewArray(cadencePackIDs))
	_ = tx.AddArgument(CadenceUFix64(price))
	_ = tx.AddArgument(cadence.Address(beneficiaryAddress))
	_ = tx.AddArgument(CadenceUFix64(beneficiaryCurPercent))
	_ = tx.AddArgument(cadence.Address(creatorAddress))
	_ = tx.AddArgument(CadenceUFix64(creatorCutPercent))

	signAndSubmit(
		env.t, env.b, tx,
		[]flow.Address{
			env.b.ServiceKey().Address,
			authorizerAddress,
		},
		[]crypto.Signer{
			env.b.ServiceKey().Signer(),
			authorizerSigner,
		},
		false,
	)
}

func NewEnvironment(t *testing.T) Environment {
	b := newBlockchain()
	accountKeys := test.AccountKeyGenerator()

	fungibleTokenAddress := deployFungibleTokenContract(t, b)
	nonFungibleTokenAddress := deployNonFungibleTokenContract(t, b)
	fusdAddress, fusdAccountKey, fusdAccountSigner := deployFUSDContract(b, accountKeys, fungibleTokenAddress)
	starlyCardAddress, starlyCardAccountKey, starlyCardAccountSigner := deployStarlyCardContract(b, accountKeys, nonFungibleTokenAddress)
	starlyCardMarketAddress := deployStarlyCardMarketContract(
		t,
		b,
		fungibleTokenAddress,
		nonFungibleTokenAddress,
		fusdAddress,
		starlyCardAddress,
	)
	starlyPackAddress := deployStarlyPackContract(t, b, fungibleTokenAddress, fusdAddress, starlyCardMarketAddress)

	return Environment{
		t,
		b,
		accountKeys,
		fungibleTokenAddress,
		nonFungibleTokenAddress,
		fusdAddress, fusdAccountKey, fusdAccountSigner,
		starlyCardAddress, starlyCardAccountKey, starlyCardAccountSigner,
		starlyCardMarketAddress,
		starlyPackAddress,
	}
}

func deployFungibleTokenContract(
	t *testing.T,
	b *emulator.Blockchain,
) flow.Address {
	fungibleTokenCode := contracts.FungibleToken()
	fungibleTokenAddress, err := b.CreateAccount(
		nil,
		[]sdktemplates.Contract{
			{
				Name:   "FungibleToken",
				Source: string(fungibleTokenCode),
			},
		},
	)
	assert.NoError(t, err)
	_, err = b.CommitBlock()
	assert.NoError(t, err)

	return fungibleTokenAddress
}

func deployNonFungibleTokenContract(
	t *testing.T,
	b *emulator.Blockchain,
) flow.Address {
	nonFungibleTokenCode := contracts.NonFungibleToken()
	nonFungibleTokenAddress, err := b.CreateAccount(
		nil,
		[]sdktemplates.Contract{
			{
				Name:   "NonFungibleToken",
				Source: string(nonFungibleTokenCode),
			},
		},
	)
	assert.NoError(t, err)
	_, err = b.CommitBlock()
	assert.NoError(t, err)

	return nonFungibleTokenAddress
}

func deployFUSDContract(
	b *emulator.Blockchain,
	accountKeys *test.AccountKeys,
	fungibleTokenAddress flow.Address,
) (flow.Address, *flow.AccountKey, crypto.Signer) {
	return newAccountWithAddressAndContracts(
		b,
		accountKeys,
		[]sdktemplates.Contract{
			{
				Name:   "FUSD",
				Source: string(contracts.FUSD(fungibleTokenAddress.String())),
			},
		},
	)
}
func deployStarlyCardContract(
	b *emulator.Blockchain,
	accountKeys *test.AccountKeys,
	nonFungibleTokenAddress flow.Address,
) (flow.Address, *flow.AccountKey, crypto.Signer) {
	return newAccountWithAddressAndContracts(
		b,
		accountKeys,
		[]sdktemplates.Contract{
			{
				Name:   "StarlyCard",
				Source: string(contracts.StarlyCard(nonFungibleTokenAddress.String())),
			},
		},
	)
}

func deployStarlyCardMarketContract(
	t *testing.T,
	b *emulator.Blockchain,
	fungibleTokenAddress flow.Address,
	nonFungibleTokenAddress flow.Address,
	fusdAddress flow.Address,
	starlyCardAddress flow.Address,
) flow.Address {
	starlyCardMarketCode := contracts.StarlyCardMarket(
		fungibleTokenAddress.String(),
		nonFungibleTokenAddress.String(),
		fusdAddress.String(),
		starlyCardAddress.String(),
	)
	starlyCardMarketAddress, err := b.CreateAccount(
		nil,
		[]sdktemplates.Contract{
			{
				Name:   "StarlyCardMarket",
				Source: string(starlyCardMarketCode),
			},
		},
	)
	assert.NoError(t, err)
	_, err = b.CommitBlock()
	assert.NoError(t, err)

	return starlyCardMarketAddress
}

func deployStarlyPackContract(
	t *testing.T,
	b *emulator.Blockchain,
	fungibleTokenAddress flow.Address,
	fusdAddress flow.Address,
	starlyCardMarketAddress flow.Address,
) flow.Address {
	starlyPackCode := contracts.StarlyPack(
		fungibleTokenAddress.String(),
		fusdAddress.String(),
		starlyCardMarketAddress.String())
	starlyPackAddress, err := b.CreateAccount(
		nil,
		[]sdktemplates.Contract{
			{
				Name:   "StarlyPack",
				Source: string(starlyPackCode),
			},
		},
	)
	assert.NoError(t, err)
	_, err = b.CommitBlock()
	assert.NoError(t, err)

	return starlyPackAddress
}

// newBlockchain returns an emulator blockchain for testing.
func newBlockchain(opts ...emulator.Option) *emulator.Blockchain {
	b, err := emulator.NewBlockchain(
		append(
			[]emulator.Option{
				emulator.WithStorageLimitEnabled(false),
			},
			opts...,
		)...,
	)
	if err != nil {
		panic(err)
	}
	return b
}

func newAccountWithAddressAndContracts(
	b *emulator.Blockchain,
	accountKeys *test.AccountKeys,
	contracts []sdktemplates.Contract,
) (flow.Address, *flow.AccountKey, crypto.Signer) {
	newAccountKey, newSigner := accountKeys.NewWithSigner()
	newAddress, _ := b.CreateAccount([]*flow.AccountKey{newAccountKey}, contracts)

	return newAddress, newAccountKey, newSigner
}

func createTxWithTemplateAndAuthorizer(
	b *emulator.Blockchain,
	transactionCode []byte,
	authorizerAddress flow.Address,
) *flow.Transaction {

	tx := flow.NewTransaction().
		SetScript(transactionCode).
		SetGasLimit(9999).
		SetProposalKey(b.ServiceKey().Address, b.ServiceKey().Index, b.ServiceKey().SequenceNumber).
		SetPayer(b.ServiceKey().Address).
		AddAuthorizer(authorizerAddress)

	return tx
}

// signAndSubmit signs a transaction with an array of signers and adds their signatures to the transaction
// before submitting it to the emulator.
//
// If the private keys do not match up with the addresses, the transaction will not succeed.
//
// The shouldRevert parameter indicates whether the transaction should fail or not.
//
// This function asserts the correct result and commits the block if it passed.
func signAndSubmit(
	t *testing.T,
	b *emulator.Blockchain,
	tx *flow.Transaction,
	signerAddresses []flow.Address,
	signers []crypto.Signer,
	shouldRevert bool,
) {
	// sign transaction with each signer
	for i := len(signerAddresses) - 1; i >= 0; i-- {
		signerAddress := signerAddresses[i]
		signer := signers[i]

		if i == 0 {
			err := tx.SignEnvelope(signerAddress, 0, signer)
			assert.NoError(t, err)
		} else {
			err := tx.SignPayload(signerAddress, 0, signer)
			assert.NoError(t, err)
		}
	}

	Submit(t, b, tx, shouldRevert)
}

// Submit submits a transaction and checks if it fails or not.
func Submit(
	t *testing.T,
	b *emulator.Blockchain,
	tx *flow.Transaction,
	shouldRevert bool,
) {
	// submit the signed transaction
	err := b.AddTransaction(*tx)
	require.NoError(t, err)

	result, err := b.ExecuteNextTransaction()
	require.NoError(t, err)

	if shouldRevert {
		assert.True(t, result.Reverted())
	} else {
		if !assert.True(t, result.Succeeded()) {
			t.Log(result.Error.Error())
		}
	}

	_, err = b.CommitBlock()
	assert.NoError(t, err)
}

// executeScriptAndCheck executes a script and checks to make sure that it succeeded.
func executeScriptAndCheck(t *testing.T, b *emulator.Blockchain, script []byte, arguments [][]byte) cadence.Value {
	result, err := b.ExecuteScript(script, arguments)
	require.NoError(t, err)
	if !assert.True(t, result.Succeeded()) {
		t.Log(result.Error.Error())
	}

	return result.Value
}

func readFile(path string) []byte {
	contents, err := ioutil.ReadFile(path)
	if err != nil {
		panic(err)
	}
	return contents
}

// CadenceUFix64 returns a UFix64 value
func CadenceUFix64(value string) cadence.Value {
	newValue, err := cadence.NewUFix64(value)

	if err != nil {
		panic(err)
	}

	return newValue
}

func bytesToCadenceArray(b []byte) cadence.Array {
	values := make([]cadence.Value, len(b))

	for i, v := range b {
		values[i] = cadence.NewUInt8(v)
	}

	return cadence.NewArray(values)
}

// assertEqual asserts that two objects are equal.
//
//    assertEqual(t, 123, 123)
//
// Pointer variable equality is determined based on the equality of the
// referenced values (as opposed to the memory addresses). Function equality
// cannot be determined and will always fail.
//
func assertEqual(t *testing.T, expected, actual interface{}) bool {

	if assert.ObjectsAreEqual(expected, actual) {
		return true
	}

	message := fmt.Sprintf(
		"Not equal: \nexpected: %s\nactual  : %s",
		expected,
		actual,
	)

	return assert.Fail(t, message)
}
