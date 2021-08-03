package test

import (
	"github.com/onflow/cadence"
	"testing"
)

func TestStarlyCardMarket(t *testing.T) {
	env := NewEnvironment(t)
	alice := NewTestUser(env)
	bob := NewTestUser(env)
	charlie := NewTestUser(env)
	debra := NewTestUser(env)

	result := env.ReadStarlyCardMarketCollectionLengthScript(alice.accountAddress)
	assertEqual(t, cadence.NewInt(0), result)

	result = env.ReadStarlyCardMarketCollectionIdsScript(alice.accountAddress)
	assertEqual(t, cadence.NewArray([]cadence.Value{}), result)

	t.Run("Create sale offer", func(t *testing.T) {

		env.MintStarlyCards(alice.accountAddress, []string{"cardA"})
		env.CreateSaleOffer(
			0,
			"100.0",
			bob.accountAddress,
			"0.05",
			charlie.accountAddress,
			"0.15",
			alice.accountAddress,
			alice.accountSigner)

		result := env.ReadStarlyCardMarketCollectionLengthScript(alice.accountAddress)
		assertEqual(t, cadence.NewInt(1), result)

		result = env.ReadStarlyCardMarketCollectionIdsScript(alice.accountAddress)
		assertEqual(t, cadence.NewArray([]cadence.Value{cadence.UInt64(0)}), result)

	})

	t.Run("Accept sale offer", func(t *testing.T) {

		env.MintFUSD(debra.accountAddress, "100.0")
		env.AcceptSaleOffer(
			0,
			alice.accountAddress,
			debra.accountAddress,
			debra.accountSigner)

		aliceBalance := env.GetFUSDBalance(alice.accountAddress)
		bobBalance := env.GetFUSDBalance(bob.accountAddress)
		charlieBalance := env.GetFUSDBalance(charlie.accountAddress)
		debraBalance := env.GetFUSDBalance(debra.accountAddress)

		assertEqual(t, CadenceUFix64("80.0"), aliceBalance)
		assertEqual(t, CadenceUFix64("5.0"), bobBalance)
		assertEqual(t, CadenceUFix64("15.0"), charlieBalance)
		assertEqual(t, CadenceUFix64("0.0"), debraBalance)

		result := env.ReadStarlyCardMarketCollectionLengthScript(alice.accountAddress)
		assertEqual(t, cadence.NewInt(0), result)

		result = env.ReadStarlyCardMarketCollectionLengthScript(alice.accountAddress)
		assertEqual(t, cadence.NewInt(0), result)

		result = env.ReadStarlyCardCollectionLength(alice.accountAddress)
		assertEqual(t, cadence.NewInt(0), result)

		result = env.ReadStarlyCardCollectionLength(debra.accountAddress)
		assertEqual(t, cadence.NewInt(1), result)
	})

	t.Run("Cancel sale offer", func(t *testing.T) {

		env.MintStarlyCards(alice.accountAddress, []string{"cardB"})
		env.CreateSaleOffer(
			1,
			"100.0",
			bob.accountAddress,
			"0.05",
			charlie.accountAddress,
			"0.15",
			alice.accountAddress,
			alice.accountSigner)

		result := env.ReadStarlyCardMarketCollectionLengthScript(alice.accountAddress)
		assertEqual(t, cadence.NewInt(1), result)

		result = env.ReadStarlyCardMarketCollectionIdsScript(alice.accountAddress)
		assertEqual(t, cadence.NewArray([]cadence.Value{cadence.UInt64(1)}), result)

		env.CancelSaleOffer(1, alice.accountAddress, alice.accountSigner)

		result = env.ReadStarlyCardMarketCollectionLengthScript(alice.accountAddress)
		assertEqual(t, cadence.NewInt(0), result)
	})
}
