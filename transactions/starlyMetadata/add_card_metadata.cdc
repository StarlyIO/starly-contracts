import StarlyIDParser from "../../contracts/StarlyIDParser.cdc"
import StarlyMetadata from "../../contracts/StarlyMetadata.cdc"
import StarlyMetadataViews from "../../contracts/StarlyMetadataViews.cdc"

transaction(starlyID: String) {

    let editor: &StarlyMetadata.Editor

    prepare(signer: AuthAccount) {
        self.editor = signer.borrow<&StarlyMetadata.Editor>(from: StarlyMetadata.EditorStoragePath)
            ?? panic("Could not borrow a reference to the StarlyMetadata editor")
    }

    execute {
        let parsedStarlyID = StarlyIDParser.parse(starlyID: starlyID)
        let collectionID = parsedStarlyID.collectionID
        let cardID = parsedStarlyID.cardID
        let edition = parsedStarlyID.edition

        let creator = StarlyMetadataViews.Creator(
            id: "creatorA",
            name: "test",
            username: "test",
            address: nil,
            url: "https://starly.io/test")

        let collection = StarlyMetadataViews.Collection(
            id: collectionID,
            creator: creator,
            title: "test",
            description: "test",
            priceCoefficient: 1.0,
            url: "https://starly.io/c/".concat(collectionID))

        let card = StarlyMetadataViews.Card(
            id: cardID,
            title: "test",
            description: "test",
            editions: 50,
            rarity: "legendary",
            mediaType: "image",
            media: [],
            url: "https://starly.io/test.jpg",
            previewUrl: "https://preview.starly.io/test.jpg")

        let cards: {UInt32: StarlyMetadataViews.Card} = {}
        cards[cardID] = card
        let metadata = StarlyMetadata.CollectionMetadata(
           collection: collection,
           cards: cards)

        self.editor.putMetadata(
            collectionID: collectionID,
            metadata: metadata
        )
    }
}
