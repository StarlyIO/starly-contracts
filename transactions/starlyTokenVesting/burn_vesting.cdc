import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import StarlyTokenVesting from "../../contracts/StarlyTokenVesting.cdc"

transaction() {
    let vesting: @NonFungibleToken.NFT

    prepare(acct: AuthAccount) {
        let vestingCollectionRef = acct.borrow<&StarlyTokenVesting.Collection>(from: StarlyTokenVesting.CollectionStoragePath)!
        self.vesting <- vestingCollectionRef.withdraw(withdrawID: vestingCollectionRef.getIDs()[0])
    }

    execute {
        destroy self.vesting
    }
}
