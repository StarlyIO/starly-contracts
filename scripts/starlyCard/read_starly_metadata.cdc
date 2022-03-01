import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import StarlyCard from "../../contracts/StarlyCard.cdc"
import StarlyMetadata from "../../contracts/StarlyMetadata.cdc"
import StarlyMetadataViews from "../../contracts/StarlyMetadataViews.cdc"

// This script returns the metadata for an NFT in an account's collection.

pub fun main(address: Address, itemID: UInt64): AnyStruct? {

    // get the public account object for the token owner
    let owner = getAccount(address)

    let collectionBorrow = owner.getCapability(StarlyCard.CollectionPublicPath)!
        .borrow<&{StarlyCard.StarlyCardCollectionPublic}>()
        ?? panic("Could not borrow StarlyCardCollectionPublic")

    // borrow a reference to a specific NFT in the collection
    let starlyCard = collectionBorrow.borrowStarlyCard(id: itemID)
        ?? panic("No such itemID in that collection")

    let metadata = starlyCard.resolveView(Type<StarlyMetadataViews.CardEdition>()) as! StarlyMetadataViews.CardEdition?
    return metadata
}
