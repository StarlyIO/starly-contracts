import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import StarlyCard from "../../contracts/StarlyCard.cdc"

// This transaction configures an account to hold StarlyCard collection.

transaction {
    prepare(signer: AuthAccount) {
        // if the account doesn't already have a collection
        if signer.borrow<&StarlyCard.Collection>(from: StarlyCard.CollectionStoragePath) == nil {

            // create a new empty collection
            let collection <- StarlyCard.createEmptyCollection()

            // save it to the account
            signer.save(<-collection, to: StarlyCard.CollectionStoragePath)

            // create a public capability for the collection
            signer.link<&StarlyCard.Collection{NonFungibleToken.CollectionPublic, StarlyCard.StarlyCardCollectionPublic}>(StarlyCard.CollectionPublicPath, target: StarlyCard.CollectionStoragePath)
        }
    }
}
