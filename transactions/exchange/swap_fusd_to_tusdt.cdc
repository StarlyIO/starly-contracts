import FungibleToken from "../../contracts/FungibleToken.cdc"
import FUSD from "../../contracts/FUSD.cdc"
import TeleportedTetherToken from "../../contracts/TeleportedTetherToken.cdc"
import FusdUsdtSwapPair from "../../contracts/FusdUsdtSwapPair.cdc"

transaction(amountIn: UFix64) {
    prepare(signer: AuthAccount) {
        let fusdVault = signer.borrow<&FUSD.Vault>(from: /storage/fusdVault)
            ?? panic("Could not borrow a reference to Vault")

        let token0Vault <- fusdVault.withdraw(amount: amountIn) as! @FUSD.Vault
        let token1Vault <- FusdUsdtSwapPair.swapToken1ForToken2(from: <- token0Vault)

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
