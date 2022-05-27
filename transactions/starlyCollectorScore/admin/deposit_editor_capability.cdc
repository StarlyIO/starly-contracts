import StarlyCollectorScore from "../../../contracts/StarlyCollectorScore.cdc"

transaction {

    let resourceStoragePath: StoragePath
    let capabilityPrivatePath: CapabilityPath
    let editorCapability: Capability<&StarlyCollectorScore.Editor>

    prepare(signer: AuthAccount) {
        // These paths must be unique within the StarlyCollectorScore contract account's storage
        self.resourceStoragePath = /storage/starlyCollectorScoreEditor_01
        self.capabilityPrivatePath = /private/starlyCollectorScoreEditor_01

        let admin = signer.borrow<&StarlyCollectorScore.Admin>(from: StarlyCollectorScore.AdminStoragePath)
            ?? panic("Could not borrow a reference to the admin resource")

        let editor <- admin.createNewEditor()
        signer.save(<- editor, to: self.resourceStoragePath)
        self.editorCapability = signer.link<&StarlyCollectorScore.Editor>(
            self.capabilityPrivatePath,
            target: self.resourceStoragePath
        ) ?? panic("Could not link editor")
    }

    execute {
        let editorAccount = getAccount(0x421786879ce99765)
        let capabilityReceiver = editorAccount.getCapability
            <&StarlyCollectorScore.EditorProxy{StarlyCollectorScore.EditorProxyPublic}>
            (StarlyCollectorScore.EditorProxyPublicPath)!
            .borrow() ?? panic("Could not borrow capability receiver reference")
        capabilityReceiver.setEditorCapability(cap: self.editorCapability)
    }
}
