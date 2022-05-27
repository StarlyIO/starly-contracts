import StarlyCardStaking from "../../../contracts/StarlyCardStaking.cdc"

transaction {
    prepare(signer: AuthAccount) {
        let editorProxy <- StarlyCardStaking.createEditorProxy()
        signer.save(<- editorProxy, to: StarlyCardStaking.EditorProxyStoragePath)
        signer.link<&StarlyCardStaking.EditorProxy{StarlyCardStaking.EditorProxyPublic}>(
            StarlyCardStaking.EditorProxyPublicPath,
            target: StarlyCardStaking.EditorProxyStoragePath
        )
    }
}
