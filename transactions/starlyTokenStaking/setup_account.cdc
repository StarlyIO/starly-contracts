import MetadataViews from "../../contracts/MetadataViews.cdc"
import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import StarlyTokenStaking from "../../contracts/StarlyTokenStaking.cdc"

transaction {
    prepare(acct: AuthAccount) {
        if acct.borrow<&StarlyTokenStaking.Collection>(from: StarlyTokenStaking.CollectionStoragePath) == nil {
            acct.save(<-StarlyTokenStaking.createEmptyCollection(), to: StarlyTokenStaking.CollectionStoragePath)
            acct.link<&StarlyTokenStaking.Collection{NonFungibleToken.CollectionPublic, MetadataViews.ResolverCollection, StarlyTokenStaking.CollectionPublic}>(
                StarlyTokenStaking.CollectionPublicPath,
                target: StarlyTokenStaking.CollectionStoragePath)
        }
    }
}
