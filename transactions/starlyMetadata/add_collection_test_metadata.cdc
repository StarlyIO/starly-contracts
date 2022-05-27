import StarlyIDParser from "../../contracts/StarlyIDParser.cdc"
import StarlyMetadata from "../../contracts/StarlyMetadata.cdc"
import StarlyMetadataViews from "../../contracts/StarlyMetadataViews.cdc"

transaction(collectionID: String) {

    let editor: &StarlyMetadata.Editor

    prepare(signer: AuthAccount) {
        self.editor = signer.borrow<&StarlyMetadata.Editor>(from: StarlyMetadata.EditorStoragePath)
            ?? panic("Could not borrow a reference to the StarlyMetadata editor")
    }

    execute {
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

        let cards: {UInt32: StarlyMetadataViews.Card} = {}
        var cardID: UInt32 = 1;
        var legendaryCount = 4;
        var rareCount = 6;
        var commonCount = 11;
        while legendaryCount > 0 {
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
            legendaryCount = legendaryCount - 1
            cards[cardID] = card
            cardID = cardID + 1
        }
        while rareCount > 0 {
            let card = StarlyMetadataViews.Card(
                id: cardID,
                title: "test",
                description: "test",
                editions: 200,
                rarity: "rare",
                mediaType: "image",
                media: [],
                url: "https://starly.io/test.jpg",
                previewUrl: "https://preview.starly.io/test.jpg")
            rareCount = rareCount - 1
            cards[cardID] = card
            cardID = cardID + 1
        }
        while commonCount > 0 {
            let card = StarlyMetadataViews.Card(
                id: cardID,
                title: "test",
                description: "test",
                editions: 600,
                rarity: "common",
                mediaType: "image",
                media: [],
                url: "https://starly.io/test.jpg",
                previewUrl: "https://preview.starly.io/test.jpg")
            commonCount = commonCount - 1
            cards[cardID] = card
            cardID = cardID + 1
        }
        let metadata = StarlyMetadata.CollectionMetadata(
           collection: collection,
           cards: cards)

        self.editor.putMetadata(
            collectionID: collectionID,
            metadata: metadata
        )
    }
}
