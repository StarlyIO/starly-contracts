import StarlyTokenStaking from "../../contracts/StarlyTokenStaking.cdc"

pub fun main(): UFix64 {
    return StarlyTokenStaking.totalPrincipalStaked
}
