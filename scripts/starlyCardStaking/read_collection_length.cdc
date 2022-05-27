import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import StakedStarlyCard from "../../contracts/StakedStarlyCard.cdc"

pub fun main(address: Address): Int {
    let account = getAccount(address)

    let collectionRef = account.getCapability(StakedStarlyCard.CollectionPublicPath)!
        .borrow<&{NonFungibleToken.CollectionPublic}>()
        ?? panic("Could not borrow capability from public collection")

    return collectionRef.getIDs().length
}
