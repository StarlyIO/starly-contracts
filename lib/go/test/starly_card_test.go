package test

import (
	"fmt"
	"github.com/MintMe/starly-contracts/lib/go/scripts"
	"github.com/onflow/cadence"
	jsoncdc "github.com/onflow/cadence/encoding/json"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"testing"
)

func TestStarlyCard(t *testing.T) {
	env := NewEnvironment(t)
	alice := NewTestUser(env)

	result := env.ReadStarlyCardSupply()
	assertEqual(t, cadence.UInt64(0), result)

	result = env.ReadStarlyCardCollectionLength(alice.accountAddress)
	assertEqual(t, cadence.NewInt(0), result)

	t.Run("Should be able to mint a Starly Card", func(t *testing.T) {
		env.MintStarlyCards(alice.accountAddress, []string{"starlyCardA"})

		result := env.ReadStarlyCardSupply()
		assertEqual(t, cadence.UInt64(1), result)

		result = env.ReadStarlyCardCollectionLength(alice.accountAddress)
		assertEqual(t, cadence.NewInt(1), result)

		result = env.ReadStarlyCardCollectionIdsScript(alice.accountAddress)
		assertEqual(t, cadence.NewArray([]cadence.Value{cadence.UInt64(0)}), result)
	})

	t.Run("Should be able to mint multiple Starly Card in one transaction", func(t *testing.T) {
		env.MintStarlyCards(alice.accountAddress, []string{"starlyCardB", "starlyCardC"})

		result := env.ReadStarlyCardSupply()
		assertEqual(t, cadence.UInt64(3), result)

		result = env.ReadStarlyCardCollectionLength(alice.accountAddress)
		assertEqual(t, cadence.NewInt(3), result)

		result = env.ReadStarlyCardCollectionIdsScript(alice.accountAddress)
		assertEqual(t, cadence.NewArray([]cadence.Value{
			cadence.UInt64(0),
			cadence.UInt64(1),
			cadence.UInt64(2),
		}), result)
	})

	t.Run("Should not be able to borrow a reference to an NFT that doesn't exist", func(t *testing.T) {
		scriptCode := scripts.ReadStarlyIdScript(
			env.nonFungibleTokenAddress.String(),
			env.starlyCardAddress.String(),
		)
		result, err := env.b.ExecuteScript(scriptCode, [][]byte{jsoncdc.MustEncode(cadence.NewInt(10))})
		require.NoError(t, err)
		assert.True(t, result.Reverted())
	})

	t.Run("Should be able to destroy owned Starly Card", func(t *testing.T) {
		env.BurnStarlyCard(alice.accountAddress, alice.accountSigner, 1)

		result := env.ReadStarlyCardSupply()
		assertEqual(t, cadence.UInt64(3), result)

		result = env.ReadStarlyCardCollectionLength(alice.accountAddress)
		assertEqual(t, cadence.NewInt(2), result)

		result = env.ReadStarlyCardCollectionIdsScript(alice.accountAddress)
		assertEqual(t, cadence.NewArray([]cadence.Value{
			cadence.UInt64(0),
			cadence.UInt64(2),
		}), result)

		burnedEvent := fmt.Sprintf("A.%s.StarlyCard.Burned", env.starlyCardAddress)
		event := env.GetFirstEventOfType(burnedEvent)
		assertEqual(t, "1", event["id"])
		assertEqual(t, "\"starlyCardB\"", event["starlyID"])
	})
}
