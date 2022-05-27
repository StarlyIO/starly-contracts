import StarlyMetadata from "../../contracts/StarlyMetadata.cdc"
import StarlyMetadataViews from "../../contracts/StarlyMetadataViews.cdc"

transaction() {

    let editor: &StarlyMetadata.EditorProxy

    prepare(signer: AuthAccount) {
        self.editor = signer.borrow<&StarlyMetadata.EditorProxy>(from: StarlyMetadata.EditorProxyStoragePath)
            ?? panic("Could not borrow a reference to the StarlyMetadata.EditorProxy")
    }

    execute {
        {{CODE}}
    }
}
