import FungibleToken from "../../contracts/FungibleToken.cdc"
import StarlyToken from "../../contracts/StarlyToken.cdc"

pub fun main(address: Address): UFix64 {
    let balanceRef = getAccount(address).getCapability(StarlyToken.TokenPublicBalancePath)
        .borrow<&{FungibleToken.Balance}>()
        ?? panic("Could not borrow balance public reference")

    return balanceRef.balance
}
