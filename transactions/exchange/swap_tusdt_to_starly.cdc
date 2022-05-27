import FungibleToken from "../../contracts/FungibleToken.cdc"
import StarlyToken from "../../contracts/StarlyToken.cdc"
import TeleportedTetherToken from "../../contracts/TeleportedTetherToken.cdc"
import StarlyUsdtSwapPair from "../../contracts/StarlyUsdtSwapPair.cdc"

transaction(amountIn: UFix64) {
    prepare(signer: AuthAccount) {
        let teleportedTetherTokenVault = signer.borrow<&TeleportedTetherToken.Vault>(from: TeleportedTetherToken.TokenStoragePath)
            ?? panic("Could not borrow a reference to Vault")

        let token0Vault <- teleportedTetherTokenVault.withdraw(amount: amountIn) as! @TeleportedTetherToken.Vault
        let token1Vault <- StarlyUsdtSwapPair.swapToken2ForToken1(from: <- token0Vault)

        if signer.borrow<&StarlyToken.Vault>(from: StarlyToken.TokenStoragePath) == nil {
            signer.save(<-StarlyToken.createEmptyVault(), to: StarlyToken.TokenStoragePath)
            signer.link<&StarlyToken.Vault{FungibleToken.Receiver}>(
                StarlyToken.TokenPublicReceiverPath,
                target: StarlyToken.TokenStoragePath)
            signer.link<&StarlyToken.Vault{FungibleToken.Balance}>(
                StarlyToken.TokenPublicBalancePath,
                target: StarlyToken.TokenStoragePath)
        }

        let starlyTokenVault = signer.borrow<&StarlyToken.Vault>(from: StarlyToken.TokenStoragePath)
            ?? panic("Could not borrow a reference to Vault")

        starlyTokenVault.deposit(from: <- token1Vault)
    }
}
