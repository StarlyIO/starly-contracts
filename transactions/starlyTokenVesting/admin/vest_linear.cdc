import NonFungibleToken from "../../../contracts/NonFungibleToken.cdc"
import StarlyToken from "../../../contracts/StarlyToken.cdc"
import StarlyTokenVesting from "../../../contracts/StarlyTokenVesting.cdc"

transaction(beneficiary: Address, amount: UFix64, duration: UFix64) {

    let vaultRef: &StarlyToken.Vault
    let minterRef: &StarlyTokenVesting.NFTMinter
    let vestingCollectionRef: &{NonFungibleToken.CollectionPublic}

    prepare(acct: AuthAccount) {
        self.vaultRef = acct.borrow<&StarlyToken.Vault>(from: StarlyToken.TokenStoragePath)
            ?? panic("Could not borrow reference to the owner's StarlyToken vault!")
        self.minterRef = acct.borrow<&StarlyTokenVesting.NFTMinter>(from: StarlyTokenVesting.MinterStoragePath)
            ?? panic("Could not borrow reference to StarlyTokenVesting minter!")
        self.vestingCollectionRef = getAccount(beneficiary).getCapability(StarlyTokenVesting.CollectionPublicPath)!
            .borrow<&{NonFungibleToken.CollectionPublic}>()
            ?? panic("Could not borrow capability from public StarlyTokenVesting collection!")
    }

    execute {
        let vault <- self.vaultRef.withdraw(amount: amount) as! @StarlyToken.Vault
        let vesting <- self.minterRef.mintLinear(
            beneficiary: beneficiary,
            vestedVault: <-vault,
            startTimestamp: getCurrentBlock().timestamp,
            endTimestamp: getCurrentBlock().timestamp + duration)
        self.vestingCollectionRef.deposit(token: <-vesting)
    }
}
