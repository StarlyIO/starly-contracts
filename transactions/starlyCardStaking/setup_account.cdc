import MetadataViews from "../../contracts/MetadataViews.cdc"
import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import StakedStarlyCard from "../../contracts/StakedStarlyCard.cdc"

transaction {
    prepare(acct: AuthAccount) {
        if acct.borrow<&StakedStarlyCard.Collection>(from: StakedStarlyCard.CollectionStoragePath) == nil {
            acct.save(<-StakedStarlyCard.createEmptyCollection(), to: StakedStarlyCard.CollectionStoragePath)
            acct.link<&StakedStarlyCard.Collection{NonFungibleToken.CollectionPublic, MetadataViews.ResolverCollection, StakedStarlyCard.CollectionPublic}>(
                StakedStarlyCard.CollectionPublicPath,
                target: StakedStarlyCard.CollectionStoragePath)
        }
    }
}
