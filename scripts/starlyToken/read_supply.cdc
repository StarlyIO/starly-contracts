import StarlyToken from "../../contracts/StarlyToken.cdc"

pub fun main(): UFix64 {
    return StarlyToken.totalSupply
}
