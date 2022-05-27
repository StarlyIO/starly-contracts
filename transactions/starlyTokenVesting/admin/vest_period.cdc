import NonFungibleToken from "../../../contracts/NonFungibleToken.cdc"
import StarlyToken from "../../../contracts/StarlyToken.cdc"
import StarlyTokenVesting from "../../../contracts/StarlyTokenVesting.cdc"

transaction(beneficiary: Address, amount: UFix64, ten_percent_duration: UFix64) {

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
        let timestamp = getCurrentBlock().timestamp
        let vesting <- self.minterRef.mintPeriod(
            beneficiary: beneficiary,
            vestedVault: <-vault,
            schedule: {
                timestamp + 0.0 * ten_percent_duration: 0.0,
                timestamp + 1.0 * ten_percent_duration: 0.1,
                timestamp + 2.0 * ten_percent_duration: 0.2,
                timestamp + 3.0 * ten_percent_duration: 0.3,
                timestamp + 4.0 * ten_percent_duration: 0.4,
                timestamp + 5.0 * ten_percent_duration: 0.5,
                timestamp + 6.0 * ten_percent_duration: 0.6,
                timestamp + 7.0 * ten_percent_duration: 0.7,
                timestamp + 8.0 * ten_percent_duration: 0.8,
                timestamp + 9.0 * ten_percent_duration: 0.9,
                timestamp + 10.0 * ten_percent_duration: 1.0})
        self.vestingCollectionRef.deposit(token: <-vesting)
    }
}
