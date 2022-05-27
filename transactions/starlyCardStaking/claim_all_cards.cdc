import StarlyCard from "../../contracts/StarlyCard.cdc"
import StakedStarlyCard from "../../contracts/StakedStarlyCard.cdc"

transaction() {

    let collectionRef: &StakedStarlyCard.Collection

    prepare(signer: AuthAccount) {
        self.collectionRef = signer.borrow<&StakedStarlyCard.Collection>(from: StakedStarlyCard.CollectionStoragePath)
            ?? panic("Could not borrow a reference to the StakedStarlyCard collection!")
    }

    execute {
        self.collectionRef.claimAll(limit: 90)
    }
}
