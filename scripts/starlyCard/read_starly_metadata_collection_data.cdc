import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import MetadataViews from "../../contracts/MetadataViews.cdc"
import StarlyCard from "../../contracts/StarlyCard.cdc"

pub fun main(address: Address, itemID: UInt64): AnyStruct? {

    let owner = getAccount(address)

    let collectionBorrow = owner.getCapability(StarlyCard.CollectionPublicPath)!
        .borrow<&{StarlyCard.StarlyCardCollectionPublic}>()
        ?? panic("Could not borrow StarlyCardCollectionPublic")

    let starlyCard = collectionBorrow.borrowStarlyCard(id: itemID)
        ?? panic("No such itemID in that collection")

    return MetadataViews.getNFTCollectionData(starlyCard)?.publicPath
}
