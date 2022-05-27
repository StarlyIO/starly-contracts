import StarlyCard from "../../contracts/StarlyCard.cdc"

// This scripts returns the number of StarlyCard currently in existence.

pub fun main(): UInt64 {    
    return StarlyCard.totalSupply
}
