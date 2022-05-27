import StarlyMetadata from "../../../contracts/StarlyMetadata.cdc"

transaction {
    prepare(signer: AuthAccount) {
        let editorProxy <- StarlyMetadata.createEditorProxy()
        signer.save(<- editorProxy, to: StarlyMetadata.EditorProxyStoragePath)
        signer.link<&StarlyMetadata.EditorProxy{StarlyMetadata.EditorProxyPublic}>(
            StarlyMetadata.EditorProxyPublicPath,
            target: StarlyMetadata.EditorProxyStoragePath
        )
    }
}
