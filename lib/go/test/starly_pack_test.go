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
	debra := NewTestUser(env)
	env.MintFUSD(alice.accountAddress, "1000.0")

	t.Run("Should be able to buy a pack", func(t *testing.T) {

		env.BuyPack(
			"collectionA",
			[]string{"packA", "packB"},
			"100.0",
			bob.accountAddress,
			"0.2",
			charlie.accountAddress,
			"0.75",
			debra.accountAddress,
            "0.05",
			alice.accountAddress,
			alice.accountSigner)

		aliceBalance := env.GetFUSDBalance(alice.accountAddress)
		bobBalance := env.GetFUSDBalance(bob.accountAddress)
		charlieBalance := env.GetFUSDBalance(charlie.accountAddress)
		debraBalance := env.GetFUSDBalance(debra.accountAddress)

		assertEqual(t, CadenceUFix64("900.0"), aliceBalance)
		assertEqual(t, CadenceUFix64("20.0"), bobBalance)
		assertEqual(t, CadenceUFix64("75.0"), charlieBalance)
		assertEqual(t, CadenceUFix64("5.0"), debraBalance)
	})

	t.Run("There is StarlyPack.Purchase event", func(t *testing.T) {
		packPurchasedEvent := fmt.Sprintf("A.%s.StarlyPack.Purchased", env.starlyPackAddress)
		event := env.GetFirstEventOfType(packPurchasedEvent)
		assertEqual(t, "Type<A." + env.fusdAddress.String() + ".FUSD.Vault>()", event["currency"])
		assertEqual(t, "0x"+alice.accountAddress.String(), event["buyerAddress"])
		assertEqual(t, fmt.Sprintf(
			"A.%s.StarlyCardMarket.SaleCut(address: 0x%s, amount: 20.00000000, percent: 0.20000000)",
			env.starlyCardMarketAddress.String(),
			bob.accountAddress.String()), event["beneficiarySaleCut"])
		assertEqual(t, fmt.Sprintf(
			"A.%s.StarlyCardMarket.SaleCut(address: 0x%s, amount: 75.00000000, percent: 0.75000000)",
			env.starlyCardMarketAddress.String(),
			charlie.accountAddress.String()),
			event["creatorSaleCut"])
		assertEqual(t, fmt.Sprintf(
			"[A.%s.StarlyCardMarket.SaleCut(address: 0x%s, amount: 5.00000000, percent: 0.05000000)]",
			env.starlyCardMarketAddress.String(),
			debra.accountAddress.String()),
			event["additionalSaleCuts"])
	})
}

func TestStarlyPackFlow(t *testing.T) {
	env := NewEnvironment(t)
	alice := NewTestUser(env)
	bob := NewTestUser(env)
	charlie := NewTestUser(env)
	debra := NewTestUser(env)
	env.MintFlow(alice.accountAddress, "1000.0")

	t.Run("Should be able to buy a pack using FLOW", func(t *testing.T) {

    		env.BuyPackUsingFlow(
    			"collectionA",
    			[]string{"packA", "packB"},
    			"100.0",
    			bob.accountAddress,
    			"0.2",
    			charlie.accountAddress,
    			"0.75",
    			debra.accountAddress,
                "0.05",
    			alice.accountAddress,
    			alice.accountSigner)

    		aliceBalance := env.GetFlowBalance(alice.accountAddress)
    		bobBalance := env.GetFlowBalance(bob.accountAddress)
    		charlieBalance := env.GetFlowBalance(charlie.accountAddress)
    		debraBalance := env.GetFlowBalance(debra.accountAddress)

    		assertEqual(t, CadenceUFix64("900.0"), aliceBalance)
    		assertEqual(t, CadenceUFix64("20.0"), bobBalance)
    		assertEqual(t, CadenceUFix64("75.0"), charlieBalance)
    		assertEqual(t, CadenceUFix64("5.0"), debraBalance)
    	})

    	t.Run("There is StarlyPack.Purchase event", func(t *testing.T) {
    		packPurchasedEvent := fmt.Sprintf("A.%s.StarlyPack.Purchased", env.starlyPackAddress)
    		event := env.GetFirstEventOfType(packPurchasedEvent)
    		assertEqual(t, "Type<A." + env.flowTokenAddress.String() + ".FlowToken.Vault>()", event["currency"])
    		assertEqual(t, "0x"+alice.accountAddress.String(), event["buyerAddress"])
    		assertEqual(t, fmt.Sprintf(
    			"A.%s.StarlyCardMarket.SaleCut(address: 0x%s, amount: 20.00000000, percent: 0.20000000)",
    			env.starlyCardMarketAddress.String(),
    			bob.accountAddress.String()), event["beneficiarySaleCut"])
    		assertEqual(t, fmt.Sprintf(
    			"A.%s.StarlyCardMarket.SaleCut(address: 0x%s, amount: 75.00000000, percent: 0.75000000)",
    			env.starlyCardMarketAddress.String(),
    			charlie.accountAddress.String()),
    			event["creatorSaleCut"])
    		assertEqual(t, fmt.Sprintf(
    			"[A.%s.StarlyCardMarket.SaleCut(address: 0x%s, amount: 5.00000000, percent: 0.05000000)]",
    			env.starlyCardMarketAddress.String(),
    			debra.accountAddress.String()),
    			event["additionalSaleCuts"])
    	})
}
