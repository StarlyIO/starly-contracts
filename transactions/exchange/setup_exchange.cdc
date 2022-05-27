import FlowSwapPair from "../../contracts/FlowSwapPair.cdc"
import FlowToken from "../../contracts/FlowToken.cdc"
import FUSD from "../../contracts/FUSD.cdc"
import TeleportedTetherToken from "../../contracts/TeleportedTetherToken.cdc"
import FusdUsdtSwapPair from "../../contracts/FusdUsdtSwapPair.cdc"

transaction {
    prepare(signer: AuthAccount) {
        let flowAmount = 1000.0
        let usdtAmount = 12000.0

        let flowSwapPairAdmin = signer.borrow<&FlowSwapPair.Admin>(from: /storage/flowSwapPairAdmin)
            ?? panic("Signer is not the FlowSwapPair admin")

        let fusdUsdtPairAdmin = signer.borrow<&FusdUsdtSwapPair.Admin>(from: /storage/fusdUsdtPairAdmin)
            ?? panic("Signer is not the FusdUsdtSwapPair admin")
        
        let flowAdmin = signer.borrow<&FlowToken.Administrator>(from: /storage/flowTokenAdmin)
            ?? panic("Signer is not the Flow token admin")

        let fusdAdmin = signer.borrow<&FUSD.Administrator>(from: /storage/fusdAdmin)
            ?? panic("Signer is not the FUSD admin")

        let tetherAdmin = signer.borrow<&TeleportedTetherToken.Administrator>(from: /storage/teleportedTetherTokenAdmin)
            ?? panic("Signer is not the Teleported Tether token admin")

        // Mint Flow
        let flowMinter <- flowAdmin.createNewMinter(allowedAmount: flowAmount)
        let mintedFlowVault <- flowMinter.mintTokens(amount: flowAmount)
        destroy flowMinter

        // Mint FUSD
        let fusdMinter <- fusdAdmin.createNewMinter()
        let mintedFUSDVault <- fusdMinter.mintTokens(amount: usdtAmount)
        destroy fusdMinter

        // Teleport USDT
        let teleportAdmin <- tetherAdmin.createNewTeleportAdmin(allowedAmount: usdtAmount * 10.0)
        let tetherVault1 <- teleportAdmin.teleportIn(
            amount: usdtAmount,
            from: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
            hash: "0123456789012345678901234567890123456789012345678901234567890124")

        let tetherVault2 <- teleportAdmin.teleportIn(
            amount: usdtAmount,
            from: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
            hash: "0123456789012345678901234567890123456789012345678901234567890125")

        let tokenBundle1 <- FlowSwapPair.createTokenBundle(fromToken1: <-mintedFlowVault, fromToken2: <-tetherVault1)
        let flowSwapPairVault <- flowSwapPairAdmin.addInitialLiquidity(from: <-tokenBundle1)

        let tokenBundle2 <- FusdUsdtSwapPair.createTokenBundle(fromToken1: <-mintedFUSDVault, fromToken2: <-tetherVault2)
        let fusdUsdtPairVault <- FusdUsdtSwapPair.addInitialLiquidity(from: <-tokenBundle2)
        
        destroy teleportAdmin
        destroy flowSwapPairVault
        destroy fusdUsdtPairVault

        flowSwapPairAdmin.unfreeze()
        fusdUsdtPairAdmin.unfreeze()
    }
}