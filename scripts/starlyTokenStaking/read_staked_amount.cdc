import StarlyTokenStaking from "../../contracts/StarlyTokenStaking.cdc"

pub fun main(address: Address): UFix64 {
    let account = getAccount(address)
    let stakeCollectionRef = account.getCapability(StarlyTokenStaking.CollectionPublicPath)!
        .borrow<&{StarlyTokenStaking.CollectionPublic}>()
        ?? panic("Could not borrow capability from public StarlyTokenStaking collection!")
    return stakeCollectionRef.getStakedAmount()
}
