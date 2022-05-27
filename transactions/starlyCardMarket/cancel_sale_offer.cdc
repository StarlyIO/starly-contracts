import StarlyCardMarket from "../../contracts/StarlyCardMarket.cdc"

transaction(itemID: UInt64) {
    let marketCollection: &StarlyCardMarket.Collection

    prepare(signer: AuthAccount) {
        self.marketCollection = signer.borrow<&StarlyCardMarket.Collection>(from: StarlyCardMarket.CollectionStoragePath)
            ?? panic("Missing or mis-typed StarlyCardMarket Collection")
    }

    execute {
        let offer <-self.marketCollection.remove(itemID: itemID)
        destroy offer
    }
}

