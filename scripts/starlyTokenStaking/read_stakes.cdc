import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import StarlyTokenStaking from "../../contracts/StarlyTokenStaking.cdc"

pub fun main(address: Address): {UInt64: {String: AnyStruct}} {
    let stakeCollectionRef = getAccount(address).getCapability(StarlyTokenStaking.CollectionPublicPath)!
        .borrow<&{StarlyTokenStaking.CollectionPublic, NonFungibleToken.CollectionPublic}>()
        ?? panic("Could not borrow capability from public StarlyTokenStaking collection!")

    let ret: {UInt64: {String: AnyStruct}} = {}
    let stakeIDs = stakeCollectionRef.getIDs();
    for stakeID in stakeIDs {
        let stakeRef = stakeCollectionRef.borrowStakePublic(id: stakeID)
        ret.insert(key: stakeID, {
            "principal": stakeRef.getPrincipal(),
            "stakeTimestamp": stakeRef.getStakeTimestamp(),
            "minStakingSeconds": stakeRef.getMinStakingSeconds(),
            "accumulatedAmount": stakeRef.getAccumulatedAmount(),
            "k": stakeRef.getK(),
            "unstakingFees": stakeRef.getUnstakingFees(),
            "canUnstake": stakeRef.canUnstake()
        })
    }
    return ret
}
