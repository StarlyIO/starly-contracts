import MetadataViews from "../../contracts/MetadataViews.cdc"
import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import StarlyTokenVesting from "../../contracts/StarlyTokenVesting.cdc"

transaction {
    prepare(acct: AuthAccount) {
        if acct.borrow<&StarlyTokenVesting.Collection>(from: StarlyTokenVesting.CollectionStoragePath) == nil {
            acct.save(<-StarlyTokenVesting.createEmptyCollectionAndNotify(beneficiary: acct.address), to: StarlyTokenVesting.CollectionStoragePath)
            acct.link<&StarlyTokenVesting.Collection{NonFungibleToken.CollectionPublic, MetadataViews.ResolverCollection, StarlyTokenVesting.CollectionPublic}>(
                StarlyTokenVesting.CollectionPublicPath,
                target: StarlyTokenVesting.CollectionStoragePath)
        }
    }
}
