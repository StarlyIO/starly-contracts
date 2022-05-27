import StarlyTokenStaking from "../../contracts/StarlyTokenStaking.cdc"

pub fun main(): {String: AnyStruct} {
    return {
        "stakingEnabled": StarlyTokenStaking.stakingEnabled,
        "unstakingEnabled": StarlyTokenStaking.unstakingEnabled,
        "unstakingFee": StarlyTokenStaking.unstakingFee,
        "unstakingFlatFee": StarlyTokenStaking.unstakingFlatFee,
        "unstakingFeesNotAppliedAfterSeconds": StarlyTokenStaking.unstakingFeesNotAppliedAfterSeconds,
        "unstakingDisabledUntilTimestamp": StarlyTokenStaking.unstakingDisabledUntilTimestamp,
        "minStakingSeconds": StarlyTokenStaking.minStakingSeconds,
        "minStakePrincipal": StarlyTokenStaking.minStakePrincipal,
        "k": StarlyTokenStaking.k,
        "totalPrincipalStaked": StarlyTokenStaking.totalPrincipalStaked,
        "totalInterestPaid": StarlyTokenStaking.totalInterestPaid
    }
}
