import StarlyCardMarket from "../../contracts/StarlyCardMarket.cdc"

// This script returns the size of an account's SaleOffer collection.

pub fun main(marketCollectionAddress: Address): Int {
    let marketCollectionRef = getAccount(marketCollectionAddress)
        .getCapability<&StarlyCardMarket.Collection{StarlyCardMarket.CollectionPublic}>(
             StarlyCardMarket.CollectionPublicPath
        )
        .borrow()
        ?? panic("Could not borrow market collection from market address")

    return marketCollectionRef.getSaleOfferIDs().length
}
