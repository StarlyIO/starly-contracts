package transactions

//go:generate go run github.com/kevinburke/go-bindata/go-bindata -prefix ../../../transactions -o internal/assets/assets.go -pkg assets -nometadata -nomemcopy ../../../transactions/...

import (
	"fmt"
	"strings"

	"github.com/MintMe/starly-contracts/lib/go/transactions/internal/assets"
)

const (
	defaultFungibleTokenAddress    = "0xFUNGIBLETOKENADDRESS"
	defaultNonFungibleTokenAddress = "0xNONFUNGIBLETOKENADDRESS"
	defaultFlowTokenAddress        = "0xFLOWTOKENADDRESS"
	defaultFUSDAddress             = "0xFUSDADDRESS"
	defaultStarlyCardAddress       = "0xSTARLYCARDADDRESS"
	defaultStarlyCardMarketAddress = "0xSTARLYCARDMARKETADDRESS"
	defaultStarlyCardPackAddress   = "0xSTARLYPACKADDRESS"

	// Common
	setupAccountFilename = "setup_account.cdc"

    // FLOW
	mintFlowFilename = "flow/mint_tokens.cdc"
	transferFlowFilename = "flow/transfer.cdc"

	// FUSD
	mintFUSDFilename = "fusd/mint_tokens.cdc"

	// StarlyCard
	burnStarlyCardFilename     = "starlyCard/burn_starly_card.cdc"
	mintStarlyCardFilename     = "starlyCard/mint_starly_card.cdc"
	mintStarlyCardsFilename    = "starlyCard/mint_starly_cards.cdc"
	setupStarlyCardFilename    = "starlyCard/setup_starly_card.cdc"
	transferStarlyCardFilename = "starlyCard/transfer_starly_card.cdc"

	// StarlyCardMarket
	acceptSaleOfferFilename = "starlyCardMarket/accept_sale_offer.cdc"
	cancelSaleOfferFilename = "starlyCardMarket/cancel_sale_offer.cdc"
	createSaleOfferFilename = "starlyCardMarket/create_sale_offer.cdc"

	// StarlyPack
	buyStarlyPackFilename = "starlyPack/buy_pack.cdc"
	buyStarlyPackFlowFilename = "starlyPack/buy_pack_flow.cdc"
)

func withHexPrefix(address string) string {
	if address == "" {
		return ""
	}

	if address[0:2] == "0x" {
		return address
	}

	return fmt.Sprintf("0x%s", address)
}

// SetupAccountTransaction runs a transaction that initializes all the necessary storages for Starly contracts
func SetupAccountTransaction(
	fungibleTokenAddress string,
	nonFungibleTokenAddress string,
	fusdAddress string,
	starlyCardAddress string,
	starlyCardMarketAddress string,
) []byte {
	code := assets.MustAssetString(setupAccountFilename)

	code = strings.ReplaceAll(
		code,
		defaultFungibleTokenAddress,
		withHexPrefix(fungibleTokenAddress),
	)
	code = strings.ReplaceAll(
		code,
		defaultNonFungibleTokenAddress,
		withHexPrefix(nonFungibleTokenAddress),
	)
	code = strings.ReplaceAll(
		code,
		defaultFUSDAddress,
		withHexPrefix(fusdAddress),
	)
	code = strings.ReplaceAll(
		code,
		defaultStarlyCardAddress,
		withHexPrefix(starlyCardAddress),
	)
	code = strings.ReplaceAll(
		code,
		defaultStarlyCardMarketAddress,
		withHexPrefix(starlyCardMarketAddress),
	)

	return []byte(code)
}

func TransferFlowTransaction(
	fungibleTokenAddress string,
	flowTokenAddress string,
) []byte {
	code := assets.MustAssetString(transferFlowFilename)

	code = strings.ReplaceAll(
		code,
		defaultFungibleTokenAddress,
		withHexPrefix(fungibleTokenAddress),
	)
	code = strings.ReplaceAll(
		code,
		defaultFlowTokenAddress,
		withHexPrefix(flowTokenAddress),
	)

	return []byte(code)
}

func MintFlowTransaction(
	fungibleTokenAddress string,
	flowTokenAddress string,
) []byte {
	code := assets.MustAssetString(mintFlowFilename)

	code = strings.ReplaceAll(
		code,
		defaultFungibleTokenAddress,
		withHexPrefix(fungibleTokenAddress),
	)
	code = strings.ReplaceAll(
		code,
		defaultFlowTokenAddress,
		withHexPrefix(flowTokenAddress),
	)

	return []byte(code)
}

func MintFUSDTransaction(
	fungibleTokenAddress string,
	fusdAddress string,
) []byte {
	code := assets.MustAssetString(mintFUSDFilename)

	code = strings.ReplaceAll(
		code,
		defaultFungibleTokenAddress,
		withHexPrefix(fungibleTokenAddress),
	)
	code = strings.ReplaceAll(
		code,
		defaultFUSDAddress,
		withHexPrefix(fusdAddress),
	)

	return []byte(code)
}

func BurnStarlyCardTransaction(
	nonFungibleTokenAddress string,
	starlyCardAddress string,
) []byte {
	code := assets.MustAssetString(burnStarlyCardFilename)

	code = strings.ReplaceAll(
		code,
		defaultNonFungibleTokenAddress,
		withHexPrefix(nonFungibleTokenAddress),
	)
	code = strings.ReplaceAll(
		code,
		defaultStarlyCardAddress,
		withHexPrefix(starlyCardAddress),
	)

	return []byte(code)
}

func MintStarlyCardTransaction(
	nonFungibleTokenAddress string,
	starlyCardAddress string,
) []byte {
	code := assets.MustAssetString(mintStarlyCardFilename)

	code = strings.ReplaceAll(
		code,
		defaultNonFungibleTokenAddress,
		withHexPrefix(nonFungibleTokenAddress),
	)
	code = strings.ReplaceAll(
		code,
		defaultStarlyCardAddress,
		withHexPrefix(starlyCardAddress),
	)

	return []byte(code)
}

func MintStarlyCardsTransaction(
	nonFungibleTokenAddress string,
	starlyCardAddress string,
) []byte {
	code := assets.MustAssetString(mintStarlyCardsFilename)

	code = strings.ReplaceAll(
		code,
		defaultNonFungibleTokenAddress,
		withHexPrefix(nonFungibleTokenAddress),
	)
	code = strings.ReplaceAll(
		code,
		defaultStarlyCardAddress,
		withHexPrefix(starlyCardAddress),
	)

	return []byte(code)
}

func SetupStarlyCardTransaction(
	nonFungibleTokenAddress string,
	starlyCardAddress string,
) []byte {
	code := assets.MustAssetString(setupStarlyCardFilename)

	code = strings.ReplaceAll(
		code,
		defaultNonFungibleTokenAddress,
		withHexPrefix(nonFungibleTokenAddress),
	)
	code = strings.ReplaceAll(
		code,
		defaultStarlyCardAddress,
		withHexPrefix(starlyCardAddress),
	)

	return []byte(code)
}

func TransferStarlyCardTransaction(
	nonFungibleTokenAddress string,
	starlyCardAddress string,
) []byte {
	code := assets.MustAssetString(transferStarlyCardFilename)

	code = strings.ReplaceAll(
		code,
		defaultNonFungibleTokenAddress,
		withHexPrefix(nonFungibleTokenAddress),
	)
	code = strings.ReplaceAll(
		code,
		defaultStarlyCardAddress,
		withHexPrefix(starlyCardAddress),
	)

	return []byte(code)
}

func AcceptSaleOfferTransaction(
	fungibleTokenAddress string,
	nonFungibleTokenAddress string,
	fusdAddress string,
	starlyCardAddress string,
	starlyCardMarketAddress string,
) []byte {
	code := assets.MustAssetString(acceptSaleOfferFilename)

	code = strings.ReplaceAll(
		code,
		defaultFungibleTokenAddress,
		withHexPrefix(fungibleTokenAddress),
	)
	code = strings.ReplaceAll(
		code,
		defaultNonFungibleTokenAddress,
		withHexPrefix(nonFungibleTokenAddress),
	)
	code = strings.ReplaceAll(
		code,
		defaultFUSDAddress,
		withHexPrefix(fusdAddress),
	)
	code = strings.ReplaceAll(
		code,
		defaultStarlyCardAddress,
		withHexPrefix(starlyCardAddress),
	)
	code = strings.ReplaceAll(
		code,
		defaultStarlyCardMarketAddress,
		withHexPrefix(starlyCardMarketAddress),
	)

	return []byte(code)
}

func CancelSaleOfferTransaction(
	starlyCardMarketAddress string,
) []byte {
	code := assets.MustAssetString(cancelSaleOfferFilename)

	code = strings.ReplaceAll(
		code,
		defaultStarlyCardMarketAddress,
		withHexPrefix(starlyCardMarketAddress),
	)

	return []byte(code)
}

func CreateSaleOfferTransaction(
	fungibleTokenAddress string,
	nonFungibleTokenAddress string,
	fusdAddress string,
	starlyCardAddress string,
	starlyCardMarketAddress string,
) []byte {
	code := assets.MustAssetString(createSaleOfferFilename)

	code = strings.ReplaceAll(
		code,
		defaultFungibleTokenAddress,
		withHexPrefix(fungibleTokenAddress),
	)
	code = strings.ReplaceAll(
		code,
		defaultNonFungibleTokenAddress,
		withHexPrefix(nonFungibleTokenAddress),
	)
	code = strings.ReplaceAll(
		code,
		defaultFUSDAddress,
		withHexPrefix(fusdAddress),
	)
	code = strings.ReplaceAll(
		code,
		defaultStarlyCardAddress,
		withHexPrefix(starlyCardAddress),
	)
	code = strings.ReplaceAll(
		code,
		defaultStarlyCardMarketAddress,
		withHexPrefix(starlyCardMarketAddress),
	)

	return []byte(code)
}

func BuyStarlyPackTransaction(
	fungibleTokenAddress string,
	fusdAddress string,
	starlyCardMarketAddress string,
	starlyPackAddress string,
) []byte {
	code := assets.MustAssetString(buyStarlyPackFilename)

	code = strings.ReplaceAll(
		code,
		defaultFungibleTokenAddress,
		withHexPrefix(fungibleTokenAddress),
	)
	code = strings.ReplaceAll(
		code,
		defaultFUSDAddress,
		withHexPrefix(fusdAddress),
	)
	code = strings.ReplaceAll(
		code,
		defaultStarlyCardMarketAddress,
		withHexPrefix(starlyCardMarketAddress),
	)
	code = strings.ReplaceAll(
		code,
		defaultStarlyCardPackAddress,
		withHexPrefix(starlyPackAddress),
	)

	return []byte(code)
}

func BuyStarlyPackFlowTransaction(
	fungibleTokenAddress string,
	flowTokenAddress string,
	starlyCardMarketAddress string,
	starlyPackAddress string,
) []byte {
	code := assets.MustAssetString(buyStarlyPackFlowFilename)

	code = strings.ReplaceAll(
		code,
		defaultFungibleTokenAddress,
		withHexPrefix(fungibleTokenAddress),
	)
	code = strings.ReplaceAll(
		code,
		defaultFlowTokenAddress,
		withHexPrefix(flowTokenAddress),
	)
	code = strings.ReplaceAll(
		code,
		defaultStarlyCardMarketAddress,
		withHexPrefix(starlyCardMarketAddress),
	)
	code = strings.ReplaceAll(
		code,
		defaultStarlyCardPackAddress,
		withHexPrefix(starlyPackAddress),
	)

	return []byte(code)
}
