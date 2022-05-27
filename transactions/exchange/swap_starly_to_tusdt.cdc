import FungibleToken from "../../contracts/FungibleToken.cdc"
import StarlyToken from "../../contracts/StarlyToken.cdc"
import TeleportedTetherToken from "../../contracts/TeleportedTetherToken.cdc"
import StarlyUsdtSwapPair from "../../contracts/StarlyUsdtSwapPair.cdc"

transaction(amountIn: UFix64) {
    prepare(signer: AuthAccount) {
        let starlyTokenVault = signer.borrow<&StarlyToken.Vault>(from: /storage/starlyTokenVault)
            ?? panic("Could not borrow a reference to Vault")

        let token0Vault <- starlyTokenVault.withdraw(amount: amountIn) as! @StarlyToken.Vault
        let token1Vault <- StarlyUsdtSwapPair.swapToken1ForToken2(from: <- token0Vault)

        if signer.borrow<&TeleportedTetherToken.Vault>(from: TeleportedTetherToken.TokenStoragePath) == nil {
            signer.save(<-TeleportedTetherToken.createEmptyVault(), to: TeleportedTetherToken.TokenStoragePath)
            signer.link<&TeleportedTetherToken.Vault{FungibleToken.Receiver}>(
                TeleportedTetherToken.TokenPublicReceiverPath,
                target: TeleportedTetherToken.TokenStoragePath)
            signer.link<&TeleportedTetherToken.Vault{FungibleToken.Balance}>(
                TeleportedTetherToken.TokenPublicBalancePath,
                target: TeleportedTetherToken.TokenStoragePath)
        }

        let teleportedTetherTokenVault = signer.borrow<&TeleportedTetherToken.Vault>(from: TeleportedTetherToken.TokenStoragePath)
            ?? panic("Could not borrow a reference to Vault")

        teleportedTetherTokenVault.deposit(from: <- token1Vault)
    }
}
