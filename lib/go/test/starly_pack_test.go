package test

import (
	"fmt"
	"testing"
)

func TestStarlyPack(t *testing.T) {
	env := NewEnvironment(t)
	alice := NewTestUser(env)
	bob := NewTestUser(env)
	charlie := NewTestUser(env)
	env.MintFUSD(alice.accountAddress, "1000.0")

	t.Run("Should be able to buy a pack", func(t *testing.T) {

		env.BuyPack(
			"collectionA",
			[]string{"packA", "packB"},
			"100.0",
			bob.accountAddress,
			"0.2",
			charlie.accountAddress,
			"0.8",
			alice.accountAddress,
			alice.accountSigner)

		aliceBalance := env.GetFUSDBalance(alice.accountAddress)
		bobBalance := env.GetFUSDBalance(bob.accountAddress)
		charlieBalance := env.GetFUSDBalance(charlie.accountAddress)

		assertEqual(t, CadenceUFix64("900.0"), aliceBalance)
		assertEqual(t, CadenceUFix64("20.0"), bobBalance)
		assertEqual(t, CadenceUFix64("80.0"), charlieBalance)
	})

	t.Run("There is StarlyPack.Purchase event", func(t *testing.T) {
		packPurchasedEvent := fmt.Sprintf("A.%s.StarlyPack.Purchased", env.starlyPackAddress)
		event := env.GetFirstEventOfType(packPurchasedEvent)
		assertEqual(t, "0x"+alice.accountAddress.String(), event["buyerAddress"])
		assertEqual(t, fmt.Sprintf(
			"A.%s.StarlyCardMarket.SaleCut(address: 0x%s, amount: 20.00000000, percent: 0.20000000)",
			env.starlyCardMarketAddress.String(),
			bob.accountAddress.String()), event["beneficiarySaleCut"])
		assertEqual(t, fmt.Sprintf(
			"A.%s.StarlyCardMarket.SaleCut(address: 0x%s, amount: 80.00000000, percent: 0.80000000)",
			env.starlyCardMarketAddress.String(),
			charlie.accountAddress.String()),
			event["creatorSaleCut"])
		assertEqual(t, "[]", event["additionalSaleCuts"])
	})
}
