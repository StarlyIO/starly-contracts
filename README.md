# starly-contracts

# Setting up flow emulator

Do everything from the project root where `flow.json`:
* `flow emulator` -- start flow emulator (empty)
* `flow project deploy` -- deploy contracts

Setup:
* `flow transactions send transactions/fusd/setup_account.cdc`
* `flow transactions send transactions/starlyCard/setup_account.cdc`
* `flow transactions send transactions/starlyCardMarket/setup_account.cdc`

Mint card:
* `flow transactions send transactions/starlyCard/mint_starly_card.cdc 0xf8d6e0586b0a20c7 123/1/1`

Check supply of cards and card itself:
* `flow scripts execute scripts/starlyCard/read_supply.cdc` -- should be 1.
* `flow scripts execute scripts/starlyCard/read_starly_id.cdc 0xf8d6e0586b0a20c7 0` -- should be `123/1/1`.


## Testnet 

* `flow scripts execute scripts/starlyCard/read_collection_length.cdc 0xfc963d69eb651c45 --network testnet`
* `flow scripts execute scripts/starlyCard/read_collection_ids.cdc 0xfc963d69eb651c45 --network testnet`
* `flow scripts execute scripts/starlyCard/read_starly_id.cdc 0xfc963d69eb651c45 3764 --network testnet`
* `flow scripts execute scripts/starlyCard/read_starly_metadata.cdc 0xfc963d69eb651c45 3764 --network testnet`
