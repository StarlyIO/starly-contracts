import StarlyTokenVesting from "../../contracts/StarlyTokenVesting.cdc"

pub fun main(address: Address): [UInt64] {
    let account = getAccount(address)

    let capability = account.getCapability(StarlyTokenVesting.CollectionPublicPath)
    let collectionBorrow = capability!.borrow<&{StarlyTokenVesting.CollectionPublic}>()
        ?? panic("Could not borrow StarlyTokenVesting.CollectionPublic!")

    let nftIds = collectionBorrow.getIDs()
    return nftIds
}
