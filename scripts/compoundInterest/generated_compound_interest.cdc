import CompoundInterest from "../../contracts/CompoundInterest.cdc"

pub fun main(seconds: UFix64, k: UFix64): UFix64 {
    return CompoundInterest.generatedCompoundInterest(seconds: seconds, k: k)
}
