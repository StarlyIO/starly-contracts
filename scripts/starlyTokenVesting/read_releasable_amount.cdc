import StarlyTokenVesting from "../../contracts/StarlyTokenVesting.cdc"

pub fun main(address: Address, id: UInt64): UFix64 {
    let account = getAccount(address)
    let vestingCollectionRef = account.getCapability(StarlyTokenVesting.CollectionPublicPath)!
        .borrow<&{StarlyTokenVesting.CollectionPublic}>()
        ?? panic("Could not borrow capability from public StarlyTokenVesting collection!")
    let vestingRef = vestingCollectionRef.borrowVestingPublic(id: id)
    return vestingRef.getReleasableAmount()
}
