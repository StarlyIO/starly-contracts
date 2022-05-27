import MetadataViews from "../../contracts/MetadataViews.cdc"
import StarlyTokenVesting from "../../contracts/StarlyTokenVesting.cdc"

pub fun main(address: Address, id: UInt64): AnyStruct? {
    let account = getAccount(address)
    let vestingCollectionRef = account.getCapability(StarlyTokenVesting.CollectionPublicPath)!
        .borrow<&{MetadataViews.ResolverCollection}>()
        ?? panic("Could not borrow capability from public StarlyTokenVesting collection!")
    let viewResolverRef = vestingCollectionRef.borrowViewResolver(id: id)
    return viewResolverRef.resolveView(Type<MetadataViews.Display>())
}
