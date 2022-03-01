import StarlyCardMarket from "../../contracts/StarlyCardMarket.cdc"

// This transaction configures an account to hold SaleOffer items.

transaction {
    prepare(signer: AuthAccount) {

        // if the account doesn't already have a collection
        if signer.borrow<&StarlyCardMarket.Collection>(from: StarlyCardMarket.CollectionStoragePath) == nil {

            // create a new empty collection
            let collection <- StarlyCardMarket.createEmptyCollection() as! @StarlyCardMarket.Collection

            // save it to the account
            signer.save(<-collection, to: StarlyCardMarket.CollectionStoragePath)

            // create a public capability for the collection
            signer.link<&StarlyCardMarket.Collection{StarlyCardMarket.CollectionPublic}>(StarlyCardMarket.CollectionPublicPath, target: StarlyCardMarket.CollectionStoragePath)
        }
    }
}
