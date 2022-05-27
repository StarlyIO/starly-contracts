import StarlyCard from "../../contracts/StarlyCard.cdc"
import StakedStarlyCard from "../../contracts/StakedStarlyCard.cdc"
import StarlyCardMarket from "../../contracts/StarlyCardMarket.cdc"

transaction(ids: [UInt64]) {

    let beneficiary: Address
    let collectionRef: &StarlyCard.Collection
    let stakeCollectionRef: &StakedStarlyCard.Collection
    let marketCollectionRef: &StarlyCardMarket.Collection

    prepare(signer: AuthAccount) {
        self.beneficiary = signer.address
        self.collectionRef = signer.borrow<&StarlyCard.Collection>(from: StarlyCard.CollectionStoragePath)
            ?? panic("Could not borrow a reference to the StarlyCard collection!")
        self.stakeCollectionRef = signer.borrow<&StakedStarlyCard.Collection>(from: StakedStarlyCard.CollectionStoragePath)
            ?? panic("Could not borrow a reference to the StakedStarlyCard collection!")
        self.marketCollectionRef = signer.borrow<&StarlyCardMarket.Collection>(from: StarlyCardMarket.CollectionStoragePath)
            ?? panic("Could not borrow a reference to the StarlyCardMarket Collection!")
    }

    execute {
        let offerIds = self.marketCollectionRef.getSaleOfferIDs()
        for id in ids {
            let starlyCard <-(self.collectionRef.withdraw(withdrawID: id) as! @StarlyCard.NFT)
            if offerIds.contains(starlyCard.id) {
                let offer <-self.marketCollectionRef.remove(itemID: starlyCard.id)
                destroy offer
            }       
            self.stakeCollectionRef.stake(starlyCard: <-starlyCard, beneficiary: self.beneficiary)
        }
    }
}
