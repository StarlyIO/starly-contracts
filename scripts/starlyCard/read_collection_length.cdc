import NonFungibleToken from 0xNONFUNGIBLETOKENADDRESS
import StarlyCard from 0xSTARLYCARDADDRESS

// This script returns the size of an account's StarlyCard collection.

pub fun main(address: Address): Int {
    let account = getAccount(address)

    let collectionRef = account.getCapability(StarlyCard.CollectionPublicPath)!
        .borrow<&{NonFungibleToken.CollectionPublic}>()
        ?? panic("Could not borrow capability from public collection")

    return collectionRef.getIDs().length
}
