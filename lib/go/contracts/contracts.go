package contracts

//go:generate go run github.com/kevinburke/go-bindata/go-bindata -prefix ../../../contracts -o internal/assets/assets.go -pkg assets -nometadata -nomemcopy ../../../contracts/...

import (
	"fmt"
	"github.com/StarlyIO/starly-contracts/lib/go/contracts/internal/assets"
	"strings"
)

const (
	fungibleTokenFilename    = "FungibleToken.cdc"
	nonFungibleTokenFilename = "NonFungibleToken.cdc"
	FlowTokenFilename        = "FlowToken.cdc"
	FUSDFilename             = "FUSD.cdc"
	StarlyCardFilename       = "StarlyCard.cdc"
	StarlyCardMarketFilename = "StarlyCardMarket.cdc"
	StarlyPackFilename       = "StarlyPack.cdc"

	defaultFungibleTokenAddress    = "0xFUNGIBLETOKENADDRESS"
	defaultNonFungibleTokenAddress = "0xNONFUNGIBLETOKENADDRESS"
	defaultFUSDAddress             = "0xFUSDADDRESS"
	defaultStarlyCardAddress       = "0xSTARLYCARDADDRESS"
	defaultStarlyCardMarketAddress = "0xSTARLYCARDMARKETADDRESS"
	defaultStarlyCardPackAddress   = "0xSTARLYPACKADDRESS"
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

func FungibleToken() []byte {
	return assets.MustAsset(fungibleTokenFilename)
}

func NonFungibleToken() []byte {
	return assets.MustAsset(nonFungibleTokenFilename)
}

func FlowToken(fungibleTokenAddress string) []byte {
	code := assets.MustAssetString(FlowTokenFilename)

	code = strings.ReplaceAll(
		code,
		defaultFungibleTokenAddress,
		withHexPrefix(fungibleTokenAddress),
	)

	return []byte(code)
}

func FUSD(fungibleTokenAddress string) []byte {
	code := assets.MustAssetString(FUSDFilename)

	code = strings.ReplaceAll(
		code,
		defaultFungibleTokenAddress,
		withHexPrefix(fungibleTokenAddress),
	)

	return []byte(code)
}

func StarlyCard(nonFungibleTokenAddress string) []byte {
	code := assets.MustAssetString(StarlyCardFilename)

	code = strings.ReplaceAll(
		code,
		defaultNonFungibleTokenAddress,
		withHexPrefix(nonFungibleTokenAddress),
	)

	return []byte(code)
}

func StarlyCardMarket(
	fungibleTokenAddress string,
	nonFungibleTokenAddress string,
	fusdAddress string,
	starlyCardAddress string) []byte {
	code := assets.MustAssetString(StarlyCardMarketFilename)

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

	return []byte(code)
}

func StarlyPack(
	fungibleTokenAddress string,
	fusdAddress string,
	starlyCardMarketAddress string,
) []byte {
	code := assets.MustAssetString(StarlyPackFilename)

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

	return []byte(code)
}
