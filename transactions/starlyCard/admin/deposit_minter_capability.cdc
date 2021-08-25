import StarlyCard from 0xSTARLYCARDADDRESS

transaction {

    let resourceStoragePath: StoragePath
    let capabilityPrivatePath: CapabilityPath
    let minterCapability: Capability<&StarlyCard.NFTMinter>

    prepare(signer: AuthAccount) {
        // These paths must be unique within the StarlyCard contract account's storage
        self.resourceStoragePath = /storage/starlyCardMinter_01
        self.capabilityPrivatePath = /private/starlyCardMinter_01

        let admin = signer.borrow<&StarlyCard.Administrator>(from: StarlyCard.AdminStoragePath)
            ?? panic("Could not borrow a reference to the admin resource")

        let minter <- admin.createNewMinter()
        signer.save(<- minter, to: self.resourceStoragePath)
        self.minterCapability = signer.link<&StarlyCard.NFTMinter>(
            self.capabilityPrivatePath,
            target: self.resourceStoragePath
        ) ?? panic("Could not link minter")
    }

    execute {
        let minterAccount = getAccount(0x01cf0e2f2f715450)
        let capabilityReceiver = minterAccount.getCapability
            <&StarlyCard.MinterProxy{StarlyCard.MinterProxyPublic}>
            (StarlyCard.MinterProxyPublicPath)!
            .borrow() ?? panic("Could not borrow capability receiver reference")
        capabilityReceiver.setMinterCapability(capability: self.minterCapability)
    }
}
