import FungibleToken from "../../contracts/FungibleToken.cdc"
import StarlyToken from "../../contracts/StarlyToken.cdc"

transaction(totalAmount: UFix64, addresses: {Address: UFix64}) {

    let receiverRef: &AnyResource{FungibleToken.Receiver}
    let sentVault: @FungibleToken.Vault

    prepare(signer: AuthAccount) {
        let vaultRef = signer.borrow<&StarlyToken.Vault>(from: StarlyToken.TokenStoragePath)
            ?? panic("Could not borrow reference to the owner's Vault!")

        self.receiverRef = signer.getCapability(StarlyToken.TokenPublicReceiverPath).borrow<&{FungibleToken.Receiver}>()
            ?? panic("Could not borrow reference to the owner's receiver!")

        self.sentVault <- vaultRef.withdraw(amount: totalAmount)
    }

    execute {
        var depositedAmount: UFix64 = 0.0
        for address in addresses.keys {
            let amount = addresses![address]!
            depositedAmount = depositedAmount + amount
            let recipient = getAccount(address)
            let receiverRef = recipient.getCapability(StarlyToken.TokenPublicReceiverPath).borrow<&{FungibleToken.Receiver}>()
                ?? panic("Could not borrow reference to the receivers's Vault!")

            let vault <- self.sentVault.withdraw(amount: amount)
            receiverRef.deposit(from: <-vault)
        }

        if (depositedAmount != totalAmount) {
            panic("Incorrect amounts");
        }

        // At this point paymentVault should be empty, any residiual amount goes to beneficiary to avoid resource loss.
        self.receiverRef.deposit(from: <- self.sentVault)
    }
}
