import StarlyCard from "../../contracts/StarlyCard.cdc"
import StakedStarlyCard from "../../contracts/StakedStarlyCard.cdc"
import StarlyCardStakingClaims from "../../contracts/StarlyCardStakingClaims.cdc"

transaction(ids: [UInt64]) {

    let collectionRef: &StakedStarlyCard.Collection

    prepare(signer: AuthAccount) {
        self.collectionRef = signer.borrow<&StakedStarlyCard.Collection>(from: StakedStarlyCard.CollectionStoragePath)
            ?? panic("Could not borrow a reference to the StakedStarlyCard collection!")
    }

    pre {
        ids.length > 0
    }

    execute {
        let stake = self.collectionRef.borrowStakePublic(id: ids[0])
        let beneficiary = stake.getBeneficiary()
        StarlyCardStakingClaims.claim(ids: ids, address: beneficiary)
    }
}
