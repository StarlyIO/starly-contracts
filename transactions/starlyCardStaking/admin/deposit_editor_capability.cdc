import StarlyCardStaking from "../../../contracts/StarlyCardStaking.cdc"

transaction(address: Address) {

    let resourceStoragePath: StoragePath
    let capabilityPrivatePath: CapabilityPath
    let editorCapability: Capability<&StarlyCardStaking.Editor>

    prepare(signer: AuthAccount) {
        self.resourceStoragePath = /storage/starlyCardStakingEditorForClaims3
        self.capabilityPrivatePath = /private/starlyCardStakingEditorForClaims3

        let admin = signer.borrow<&StarlyCardStaking.Admin>(from: StarlyCardStaking.AdminStoragePath)
            ?? panic("Could not borrow a reference to the StarlyCardStaking.Admin resource!")

        let editor <- admin.createNewEditor()
        signer.save(<-editor, to: self.resourceStoragePath)
        self.editorCapability = signer.link<&StarlyCardStaking.Editor>(
            self.capabilityPrivatePath,
            target: self.resourceStoragePath)
            ?? panic("Could not link StarlyCardStaking.Editor!")
    }

    execute {
        let editorAccount = getAccount(address)
        let capabilityReceiver = editorAccount.getCapability<&StarlyCardStaking.EditorProxy{StarlyCardStaking.EditorProxyPublic}>(StarlyCardStaking.EditorProxyPublicPath)!
           .borrow()
           ?? panic("Could not borrow StarlyCardStaking.EditorProxy capability receiver reference!")
        capabilityReceiver.setEditorCapability(cap: self.editorCapability)
    }
}
