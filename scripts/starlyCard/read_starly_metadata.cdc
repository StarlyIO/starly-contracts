import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import StarlyCard from "../../contracts/StarlyCard.cdc"
import StarlyMetadata from "../../contracts/StarlyMetadata.cdc"
import StarlyMetadataViews from "../../contracts/StarlyMetadataViews.cdc"

pub fun main(address: Address, itemID: UInt64): AnyStruct? {

    let owner = getAccount(address)

    let collectionBorrow = owner.getCapability(StarlyCard.CollectionPublicPath)!
        .borrow<&{StarlyCard.StarlyCardCollectionPublic}>()
        ?? panic("Could not borrow StarlyCardCollectionPublic")

    let starlyCard = collectionBorrow.borrowStarlyCard(id: itemID)
        ?? panic("No such itemID in that collection")

    let metadata = starlyCard.resolveView(Type<StarlyMetadataViews.CardEdition>()) as! StarlyMetadataViews.CardEdition?
    return metadata
}
