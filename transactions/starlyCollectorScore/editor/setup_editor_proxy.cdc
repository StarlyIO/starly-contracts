import StarlyCollectorScore from "../../../contracts/StarlyCollectorScore.cdc"

transaction {
    prepare(signer: AuthAccount) {
        let editorProxy <- StarlyCollectorScore.createEditorProxy()
        signer.save(<- editorProxy, to: StarlyCollectorScore.EditorProxyStoragePath)
        signer.link<&StarlyCollectorScore.EditorProxy{StarlyCollectorScore.EditorProxyPublic}>(
            StarlyCollectorScore.EditorProxyPublicPath,
            target: StarlyCollectorScore.EditorProxyStoragePath
        )
    }
}
