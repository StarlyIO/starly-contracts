import StarlyMetadata from "../../contracts/StarlyMetadata.cdc"

transaction(collectionID: String) {

    let editor: &StarlyMetadata.Editor

    prepare(signer: AuthAccount) {
        self.editor = signer.borrow<&StarlyMetadata.Editor>(from: StarlyMetadata.EditorStoragePath)
            ?? panic("Could not borrow a reference to the metadata editor")
    }

    execute {
        self.editor.deleteMetadata(collectionID: collectionID)
    }
}
