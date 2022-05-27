import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import StarlyTokenStaking from "../../contracts/StarlyTokenStaking.cdc"

transaction() {
    let stake: @NonFungibleToken.NFT

    prepare(acct: AuthAccount) {
        let stakeCollectionRef = acct.borrow<&StarlyTokenStaking.Collection>(from: StarlyTokenStaking.CollectionStoragePath)!
        self.stake <- stakeCollectionRef.withdraw(withdrawID: stakeCollectionRef.getIDs()[0])
    }

    execute {
        destroy self.stake
    }
}
