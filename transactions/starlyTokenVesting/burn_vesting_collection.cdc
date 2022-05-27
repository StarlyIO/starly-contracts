import StarlyTokenVesting from "../../contracts/StarlyTokenVesting.cdc"

transaction() {
    let vestingCollection: @StarlyTokenVesting.Collection?

    prepare(acct: AuthAccount) {
        self.vestingCollection <- acct.load<@StarlyTokenVesting.Collection>(from: StarlyTokenVesting.CollectionStoragePath)
    }

    execute {
        destroy self.vestingCollection
    }
}
