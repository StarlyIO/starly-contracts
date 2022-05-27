import StakedStarlyCard from "../../contracts/StakedStarlyCard.cdc"

transaction() {
    let stakeCollection: @StakedStarlyCard.Collection?

    prepare(acct: AuthAccount) {
        self.stakeCollection <- acct.load<@StakedStarlyCard.Collection>(from: StakedStarlyCard.CollectionStoragePath)
    }

    execute {
        destroy self.stakeCollection
    }
}
