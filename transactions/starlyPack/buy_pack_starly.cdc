import FungibleToken from 0xFUNGIBLETOKENADDRESS
import StarlyToken from 0xSTARLYTOKENADDRESS
import StarlyCardMarket from 0xSTARLYCARDMARKETADDRESS
import StarlyPack from 0xSTARLYPACKADDRESS

transaction(
    collectionID: String,
    packIDs: [String],
    price: UFix64,
    beneficiaryAddress: Address,
    beneficiaryCutPercent: UFix64,
    creatorAddress: Address,
    creatorCutPercent: UFix64,
    additionalSaleCutsPercents: {Address: UFix64}) {

    let paymentVault: @FungibleToken.Vault
    let beneficiaryVault: Capability<&StarlyToken.Vault{FungibleToken.Receiver}>
    let creatorVault: Capability<&StarlyToken.Vault{FungibleToken.Receiver}>
    let buyerAddress: Address
    let beneficiarySaleCutReceiver: StarlyCardMarket.SaleCutReceiverV2
    let creatorSaleCutReceiver: StarlyCardMarket.SaleCutReceiverV2
    let additionalSaleCutReceivers: [StarlyCardMarket.SaleCutReceiverV2]

    prepare(signer: AuthAccount) {
        self.buyerAddress = signer.address;
        let buyerVault = signer.borrow<&StarlyToken.Vault>(from: /storage/starlyTokenVault)
            ?? panic("Cannot borrow STARLY vault from acct storage")
        self.paymentVault <- buyerVault.withdraw(amount: price)

        let beneficiary = getAccount(beneficiaryAddress);
        self.beneficiaryVault = beneficiary.getCapability<&StarlyToken.Vault{FungibleToken.Receiver}>(/public/starlyTokenReceiver)!
        assert(self.beneficiaryVault.borrow() != nil, message: "Missing or mis-typed STARLY receiver (beneficiary)")
        self.beneficiarySaleCutReceiver = StarlyCardMarket.SaleCutReceiverV2(receiver: self.beneficiaryVault, percent: beneficiaryCutPercent)

        let creator = getAccount(creatorAddress)
        self.creatorVault = creator.getCapability<&StarlyToken.Vault{FungibleToken.Receiver}>(/public/starlyTokenReceiver)!
        assert(self.creatorVault.borrow() != nil, message: "Missing or mis-typed STARLY receiver (creator)")
        self.creatorSaleCutReceiver = StarlyCardMarket.SaleCutReceiverV2(receiver: self.creatorVault, percent: creatorCutPercent)

        self.additionalSaleCutReceivers = []
        for address in additionalSaleCutsPercents.keys {
            let additionalAccount = getAccount(address);
            let additionalCutPercent = additionalSaleCutsPercents[address]!
            let additionalVault = additionalAccount.getCapability<&StarlyToken.Vault{FungibleToken.Receiver}>(/public/starlyTokenReceiver)!
            assert(additionalVault.borrow() != nil, message: "Missing or mis-typed STARLY receiver (additional)")
            let additionalSaleCutReceiver = StarlyCardMarket.SaleCutReceiverV2(receiver: additionalVault, percent: additionalCutPercent)
            self.additionalSaleCutReceivers.append(additionalSaleCutReceiver)
        }
    }

    execute {
        StarlyPack.purchaseV2(
            collectionID: collectionID,
            packIDs: packIDs,
            price: price,
            currency: Type<@StarlyToken.Vault>(),
            buyerAddress: self.buyerAddress,
            paymentVault: <- self.paymentVault,
            beneficiarySaleCutReceiver: self.beneficiarySaleCutReceiver,
            creatorSaleCutReceiver: self.creatorSaleCutReceiver,
            additionalSaleCutReceivers: self.additionalSaleCutReceivers)
    }
}
