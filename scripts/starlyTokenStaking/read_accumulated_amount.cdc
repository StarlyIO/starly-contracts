import StarlyTokenStaking from "../../contracts/StarlyTokenStaking.cdc"

pub fun main(address: Address, id: UInt64): UFix64 {
    let account = getAccount(address)
    let stakeCollectionRef = account.getCapability(StarlyTokenStaking.CollectionPublicPath)!
        .borrow<&{StarlyTokenStaking.CollectionPublic}>()
        ?? panic("Could not borrow capability from public StarlyTokenStaking collection!")
    let stakeRef = stakeCollectionRef.borrowStakePublic(id: id)
    return stakeRef.getAccumulatedAmount()
}
