import StarlyTokenVesting from "../../contracts/StarlyTokenVesting.cdc"

pub fun main(): {String: AnyStruct} {
    return {
        "totalVested": StarlyTokenVesting.totalVested,
        "totalReleased": StarlyTokenVesting.totalReleased
    }
}
