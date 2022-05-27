import StarlyMetadata from "../../contracts/StarlyMetadata.cdc"
import StarlyMetadataViews from "../../contracts/StarlyMetadataViews.cdc"

transaction() {

    let editor: &StarlyMetadata.Editor

    prepare(signer: AuthAccount) {
        self.editor = signer.borrow<&StarlyMetadata.Editor>(from: StarlyMetadata.EditorStoragePath)
            ?? panic("Could not borrow a reference to the StarlyMetadata editor")
    }

    execute {
        {{CODE}}
    }
}
