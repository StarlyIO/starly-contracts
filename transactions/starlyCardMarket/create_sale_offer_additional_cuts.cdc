import FungibleToken from "../../contracts/FungibleToken.cdc"
import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import FUSD from "../../contracts/FUSD.cdc"
import StarlyCard from "../../contracts/StarlyCard.cdc"
import StarlyCardMarket from "../../contracts/StarlyCardMarket.cdc"

transaction(
    itemID: UInt64,
    price: UFix64,
    beneficiaryAddress: Address,
    beneficiaryCutPercent: UFix64,
    creatorAddress: Address,
    creatorCutPercent: UFix64,
    minterAddress: Address,
    minterCutPercent: UFix64,
    somebodyAddress: Address,
    somebodyCutPercent: UFix64) {

    let starlyCardCollection: Capability<&StarlyCard.Collection{NonFungibleToken.Provider, StarlyCard.StarlyCardCollectionPublic}>
    let marketCollection: &StarlyCardMarket.Collection
    let sellerFUSDVault: Capability<&FUSD.Vault{FungibleToken.Receiver}>
    let beneficiaryFUSDVault: Capability<&FUSD.Vault{FungibleToken.Receiver}>
    let creatorFUSDVault: Capability<&FUSD.Vault{FungibleToken.Receiver}>
    let minterFUSDVault: Capability<&FUSD.Vault{FungibleToken.Receiver}>
    let somebodyFUSDVault: Capability<&FUSD.Vault{FungibleToken.Receiver}>

    prepare(signer: AuthAccount) {
        // we need a provider capability, but one is not provided by default so we create one.
        let StarlyCardCollectionProviderPrivatePath = /private/starlyCardCollectionProvider
        if !signer.getCapability<&StarlyCard.Collection{NonFungibleToken.Provider, StarlyCard.StarlyCardCollectionPublic}>(StarlyCardCollectionProviderPrivatePath)!.check() {
            signer.link<&StarlyCard.Collection{NonFungibleToken.Provider, StarlyCard.StarlyCardCollectionPublic}>(StarlyCardCollectionProviderPrivatePath, target: StarlyCard.CollectionStoragePath)
        }

        self.starlyCardCollection = signer.getCapability<&StarlyCard.Collection{NonFungibleToken.Provider, StarlyCard.StarlyCardCollectionPublic}>(StarlyCardCollectionProviderPrivatePath)!
        assert(self.starlyCardCollection.borrow() != nil, message: "Missing or mis-typed StarlyCardCollection provider")

        self.marketCollection = signer.borrow<&StarlyCardMarket.Collection>(from: StarlyCardMarket.CollectionStoragePath)
            ?? panic("Missing or mis-typed StarlyCardMarket Collection")

        self.sellerFUSDVault = signer.getCapability<&FUSD.Vault{FungibleToken.Receiver}>(/public/fusdReceiver)!
        assert(self.sellerFUSDVault.borrow() != nil, message: "Missing or mis-typed seller FUSD receiver")

        let beneficiary = getAccount(beneficiaryAddress);
        self.beneficiaryFUSDVault = beneficiary.getCapability<&FUSD.Vault{FungibleToken.Receiver}>(/public/fusdReceiver)!
        assert(self.beneficiaryFUSDVault.borrow() != nil, message: "Missing or mis-typed FUSD receiver (beneficiary)")

        let creator = getAccount(creatorAddress)
        self.creatorFUSDVault = creator.getCapability<&FUSD.Vault{FungibleToken.Receiver}>(/public/fusdReceiver)!
        assert(self.creatorFUSDVault.borrow() != nil, message: "Missing or mis-typed FUSD receiver (creator)")

        let minter = getAccount(minterAddress)
        self.minterFUSDVault = minter.getCapability<&FUSD.Vault{FungibleToken.Receiver}>(/public/fusdReceiver)!
        assert(self.minterFUSDVault.borrow() != nil, message: "Missing or mis-typed FUSD receiver (minter)")

        let somebody = getAccount(somebodyAddress)
        self.somebodyFUSDVault = somebody.getCapability<&FUSD.Vault{FungibleToken.Receiver}>(/public/fusdReceiver)!
        assert(self.somebodyFUSDVault.borrow() != nil, message: "Missing or mis-typed FUSD receiver (somebody)")
    }

    execute {
        let sellerCutPercent = 1.0 - beneficiaryCutPercent - creatorCutPercent - minterCutPercent - somebodyCutPercent;
        let offer <- StarlyCardMarket.createSaleOffer (
            itemID: itemID,
            starlyID: self.starlyCardCollection.borrow()!.borrowStarlyCard(id: itemID)!.starlyID,
            price: price,
            sellerItemProvider: self.starlyCardCollection,
            sellerSaleCutReceiver: StarlyCardMarket.SaleCutReceiver(
                receiver: self.sellerFUSDVault,
                percent: sellerCutPercent),
            beneficiarySaleCutReceiver: StarlyCardMarket.SaleCutReceiver(
                receiver: self.beneficiaryFUSDVault,
                percent: beneficiaryCutPercent),
            creatorSaleCutReceiver: StarlyCardMarket.SaleCutReceiver(
                receiver: self.creatorFUSDVault,
                percent: creatorCutPercent),
            additionalSaleCutReceivers: [
                StarlyCardMarket.SaleCutReceiver(
                    receiver: self.minterFUSDVault,
                    percent: minterCutPercent),
                StarlyCardMarket.SaleCutReceiver(
                    receiver: self.somebodyFUSDVault,
                    percent: somebodyCutPercent)
            ])
        self.marketCollection.insert(offer: <-offer)
    }
}
