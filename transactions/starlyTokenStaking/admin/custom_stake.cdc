import NonFungibleToken from "../../../contracts/NonFungibleToken.cdc"
import StarlyToken from "../../../contracts/StarlyToken.cdc"
import StarlyTokenStaking from "../../../contracts/StarlyTokenStaking.cdc"

transaction(address: Address, amount: UFix64, k: UFix64, minStakingSeconds: UFix64) {

    let vaultRef: &StarlyToken.Vault
    let minterRef: &StarlyTokenStaking.NFTMinter
    let stakeCollectionRef: &{NonFungibleToken.CollectionPublic}

    prepare(acct: AuthAccount) {
        self.vaultRef = acct.borrow<&StarlyToken.Vault>(from: StarlyToken.TokenStoragePath)
            ?? panic("Could not borrow reference to the owner's StarlyToken vault!")
        self.minterRef = acct.borrow<&StarlyTokenStaking.NFTMinter>(from: StarlyTokenStaking.MinterStoragePath)
            ?? panic("Could not borrow reference to StarlyTokenStaking minter!")
        self.stakeCollectionRef = getAccount(address).getCapability(StarlyTokenStaking.CollectionPublicPath)!
            .borrow<&{NonFungibleToken.CollectionPublic}>()
            ?? panic("Could not borrow capability from public StarlyTokenStaking collection!")
    }

    execute {
        let vault <- self.vaultRef.withdraw(amount: amount) as! @StarlyToken.Vault
        let stake <- self.minterRef.mintStake(
            address: address,
            principalVault: <-vault,
            stakeTimestamp: getCurrentBlock().timestamp,
            minStakingSeconds: minStakingSeconds,
            k: k)
        self.stakeCollectionRef.deposit(token: <-stake)
    }
}
