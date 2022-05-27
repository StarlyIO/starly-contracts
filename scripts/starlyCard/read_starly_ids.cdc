import StarlyCard from "../../contracts/StarlyCard.cdc"

// This script returns an array of all Starly cards in an account's collection.

pub fun main(address: Address): [String] {
    let account = getAccount(address)

    let capability = account.getCapability(StarlyCard.CollectionPublicPath)
    let collectionBorrow = capability!.borrow<&{StarlyCard.StarlyCardCollectionPublic}>()
        ?? panic("Could not borrow StarlyCardCollectionPublic")

    let nftIds = collectionBorrow.getIDs()
    let starlyIds: [String] = []
    for nftId in nftIds {
        // borrow a reference to a specific NFT in the collection
        let starlyCard = collectionBorrow.borrowStarlyCard(id: nftId)
            ?? panic("No such itemID in that collection")

        starlyIds.append(starlyCard.starlyID)
    }

    return starlyIds
}
