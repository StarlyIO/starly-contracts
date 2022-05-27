import MetadataViews from "../../contracts/MetadataViews.cdc"
import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import StakedStarlyCard from "../../contracts/StakedStarlyCard.cdc"

pub fun main(address: Address, ids: [UInt64]): {UInt64: AnyStruct} {
    let account = getAccount(address)
    let resolverCollectionRef = account.getCapability(StakedStarlyCard.CollectionPublicPath)!
        .borrow<&{MetadataViews.ResolverCollection}>()
        ?? panic("Could not borrow capability from public StakedStarlyCard collection!")

    let ret: {UInt64: {String: AnyStruct}} = {}
    let hasIDs =  resolverCollectionRef.getIDs()
    for id in ids {
        if hasIDs.contains(id) {
            let viewResolverRef = resolverCollectionRef.borrowViewResolver(id: id)
            if let metadata = (viewResolverRef.resolveView(Type<StakedStarlyCard.StakeMetadataView>()) as! StakedStarlyCard.StakeMetadataView?) {
                ret.insert(key: id, {
                    "starlyID": metadata.starlyID,
                    "stakeTimestamp": metadata.stakeTimestamp,
                    "remainingResource": metadata.remainingResource,
                    "remainingResourceAtStakeTimestamp": metadata.remainingResourceAtStakeTimestamp
                })
            }
        }
    }
    return ret
}
