import FUSD from 0xFUSDADDRESS

// This script returns the total amount of FUSD currently in existence.

pub fun main(): UFix64 {
    return FUSD.totalSupply
}
