import FungibleToken from "../../contracts/FungibleToken.cdc"
import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import StarlyToken from "../../contracts/StarlyToken.cdc"
import StarlyTokenVesting from "../../contracts/StarlyTokenVesting.cdc"

transaction(vestingID: UInt64) {
    let vaultRef: &StarlyToken.Vault
    let vestingCollectionRef: &StarlyTokenVesting.Collection

    prepare(acct: AuthAccount) {
        self.vaultRef = acct.borrow<&StarlyToken.Vault>(from: StarlyToken.TokenStoragePath)
            ?? panic("Could not borrow reference to the owner's StarlyToken vault!")

        self.vestingCollectionRef = acct.borrow<&StarlyTokenVesting.Collection>(from: StarlyTokenVesting.CollectionStoragePath)
            ?? panic("Could not borrow reference to the owner's StarlyTokenVesting collection!")
    }

    execute {
        self.vestingCollectionRef.release(id: vestingID)
    }
}
