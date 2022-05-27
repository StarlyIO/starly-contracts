import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import StakedStarlyCard from "../../contracts/StakedStarlyCard.cdc"

transaction() {
    let stake: @NonFungibleToken.NFT

    prepare(acct: AuthAccount) {
        let stakeCollectionRef = acct.borrow<&StakedStarlyCard.Collection>(from: StakedStarlyCard.CollectionStoragePath)!
        self.stake <- stakeCollectionRef.withdraw(withdrawID: stakeCollectionRef.getIDs()[0])
    }

    execute {
        destroy self.stake
    }
}
