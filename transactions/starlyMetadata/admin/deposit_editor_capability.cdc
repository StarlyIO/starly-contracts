import StarlyMetadata from "../../../contracts/StarlyMetadata.cdc"

transaction {

    let resourceStoragePath: StoragePath
    let capabilityPrivatePath: CapabilityPath
    let editorCapability: Capability<&StarlyMetadata.Editor>

    prepare(signer: AuthAccount) {
        // These paths must be unique within the StarlyMetadata contract account's storage
        self.resourceStoragePath = /storage/starlyMetadataEditor_01
        self.capabilityPrivatePath = /private/starlyMetadataEditor_01

        let admin = signer.borrow<&StarlyMetadata.Admin>(from: StarlyMetadata.AdminStoragePath)
            ?? panic("Could not borrow a reference to the admin resource")

        let editor <- admin.createNewEditor()
        signer.save(<- editor, to: self.resourceStoragePath)
        self.editorCapability = signer.link<&StarlyMetadata.Editor>(
            self.capabilityPrivatePath,
            target: self.resourceStoragePath
        ) ?? panic("Could not link editor")
    }

    execute {
        let editorAccount = getAccount(0x421786879ce99765)
        let capabilityReceiver = editorAccount.getCapability
            <&StarlyMetadata.EditorProxy{StarlyMetadata.EditorProxyPublic}>
            (StarlyMetadata.EditorProxyPublicPath)!
            .borrow() ?? panic("Could not borrow capability receiver reference")
        capabilityReceiver.setEditorCapability(cap: self.editorCapability)
    }
}
