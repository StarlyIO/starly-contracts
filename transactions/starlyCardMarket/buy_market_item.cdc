import FungibleToken from "../../contracts/FungibleToken.cdc"
import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import Starling from "../../contracts/Starling.cdc"
import StarlyCard from "../../contracts/StarlyCard.cdc"
import StarlyCardMarket from "../../contracts/StarlyCardMarket.cdc"

transaction(itemID: UInt64, marketCollectionAddress: Address) {
    let paymentVault: @FungibleToken.Vault
    let starlyCardCollection: &StarlyCard.Collection{NonFungibleToken.Receiver}
    let marketCollection: &StarlyCardMarket.Collection{StarlyCardMarket.CollectionPublic}
    let buyerAddress: Address 

    prepare(signer: AuthAccount) {
        self.buyerAddress = signer.address;
        self.marketCollection = getAccount(marketCollectionAddress)
            .getCapability<&StarlyCardMarket.Collection{StarlyCardMarket.CollectionPublic}>(
                StarlyCardMarket.CollectionPublicPath
            )!
            .borrow()
            ?? panic("Could not borrow market collection from market address")

        let saleItem = self.marketCollection.borrowSaleItem(itemID: itemID)
                    ?? panic("No item with that ID")
        let price = saleItem.price

        let mainStarlingVault = signer.borrow<&Starling.Vault>(from: Starling.VaultStoragePath)
            ?? panic("Cannot borrow Starling vault from acct storage")
        self.paymentVault <- mainStarlingVault.withdraw(amount: price)

        self.starlyCardCollection = signer.borrow<&StarlyCard.Collection{NonFungibleToken.Receiver}>(
            from: StarlyCard.CollectionStoragePath
        ) ?? panic("Cannot borrow StarlyCard collection receiver from acct")
    }

    execute {
        self.marketCollection.purchase(
            itemID: itemID,
            buyerCollection: self.starlyCardCollection,
            buyerPayment: <- self.paymentVault,
            buyerAddress: self.buyerAddress
        )
    }
}
