import FlowSwapPair from "../../contracts/FlowUsdtSwapPair.cdc"
import FlowToken from "../../contracts/FlowToken.cdc"
import FungibleToken from "../../contracts/FungibleToken.cdc"
import FUSD from "../../contracts/FUSD.cdc"
import FusdUsdtSwapPair from "../../contracts/FusdUsdtSwapPair.cdc"

transaction(amountOut: UFix64) {
  prepare(signer: AuthAccount) {
    let amountUsdt = FusdUsdtSwapPair.quoteSwapToken2ForExactToken1(amount: amountOut)
    let amountIn = FlowSwapPair.quoteSwapToken1ForExactToken2(amount: amountUsdt) / (1.0 - FlowSwapPair.feePercentage)

    let flowVault = signer.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
      ?? panic("Could not borrow a reference to Vault")

    let token1Vault <- flowVault.withdraw(amount: amountIn) as! @FlowToken.Vault
    let token2Vault <- FlowSwapPair.swapToken1ForToken2(from: <-token1Vault)
    let token3Vault <- FusdUsdtSwapPair.swapToken2ForToken1(from: <-token2Vault)

    if signer.borrow<&FUSD.Vault>(from: /storage/fusdVault) == nil {
      // Create a new FUSD Vault and put it in storage
      signer.save(<-FUSD.createEmptyVault(), to: /storage/fusdVault)

      // Create a public capability to the Vault that only exposes
      // the deposit function through the Receiver interface
      signer.link<&FUSD.Vault{FungibleToken.Receiver}>(
        /public/fusdReceiver,
        target: /storage/fusdVault
      )

      // Create a public capability to the Vault that only exposes
      // the balance field through the Balance interface
      signer.link<&FUSD.Vault{FungibleToken.Balance}>(
        /public/fusdBalance,
        target: /storage/fusdVault
      )
    }

    let fusdVault = signer.borrow<&FUSD.Vault>(from: /storage/fusdVault)
        ?? panic("Could not borrow a reference to Vault")

    fusdVault.deposit(from: <- token3Vault)
  }
}
