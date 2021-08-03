import NonFungibleToken from 0xNONFUNGIBLETOKENADDRESS
import StarlyCard from 0xSTARLYCARDADDRESS

// This script returns the metadata for an NFT in an account's collection.

pub fun main(address: Address, itemID: UInt64): String {

    // get the public account object for the token owner
    let owner = getAccount(address)

    let collectionBorrow = owner.getCapability(StarlyCard.CollectionPublicPath)!
        .borrow<&{StarlyCard.StarlyCardCollectionPublic}>()
        ?? panic("Could not borrow StarlyCardCollectionPublic")

    // borrow a reference to a specific NFT in the collection
    let starlyCard = collectionBorrow.borrowStarlyCard(id: itemID)
        ?? panic("No such itemID in that collection")

    return starlyCard.starlyID
}
