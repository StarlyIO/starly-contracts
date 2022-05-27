import FungibleToken from 0xf233dcee88fe0abe
import StarlyToken from 0x142fa6570b62fd97
import TeleportCustodyBSC from 0xc2fa71c36fd5b840

transaction(amount: UFix64, target: String) {

    // The TeleportUser reference for teleport operations
    let teleportUserRef: &TeleportCustodyBSC.TeleportAdmin{TeleportCustodyBSC.TeleportUser}

    // The Vault resource that holds the tokens that are being transferred
    let sentVault: @FungibleToken.Vault

    prepare(signer: AuthAccount) {
        self.teleportUserRef = getAccount(0x8c0832edb0aef3aa).getCapability(TeleportCustodyBSC.TeleportAdminTeleportUserPath)
            .borrow<&TeleportCustodyBSC.TeleportAdmin{TeleportCustodyBSC.TeleportUser}>()
            ?? panic("Could not borrow a reference to TeleportOut")

        let vaultRef = signer.borrow<&StarlyToken.Vault>(from: StarlyToken.TokenStoragePath)
            ?? panic("Could not borrow a reference to the vault resource")

        self.sentVault <- vaultRef.withdraw(amount: amount)
    }

    execute {
        self.teleportUserRef.lock(from: <- self.sentVault, to: target.decodeHex())
    }
}