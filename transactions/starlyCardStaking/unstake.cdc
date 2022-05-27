import StarlyCard from "../../contracts/StarlyCard.cdc"
import StakedStarlyCard from "../../contracts/StakedStarlyCard.cdc"

transaction(ids: [UInt64]) {

    let stakeCollectionRef: &StakedStarlyCard.Collection

    prepare(signer: AuthAccount) {
        self.stakeCollectionRef = signer.borrow<&StakedStarlyCard.Collection>(from: StakedStarlyCard.CollectionStoragePath)
            ?? panic("Could not borrow a reference to the StakedStarlyCard collection!")
    }

    execute {
        for id in ids {
            self.stakeCollectionRef.unstake(id: id)
        }
    }
}
