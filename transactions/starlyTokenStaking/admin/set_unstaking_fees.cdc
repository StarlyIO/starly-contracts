import StarlyTokenStaking from "../../../contracts/StarlyTokenStaking.cdc"

transaction(unstakingFee: UFix64, unstakingFlatFee: UFix64, unstakingFeesNotAppliedAfterSeconds: UFix64) {

    let adminRef: &StarlyTokenStaking.Admin

    prepare(acct: AuthAccount) {
        self.adminRef = acct.borrow<&StarlyTokenStaking.Admin>(from: StarlyTokenStaking.AdminStoragePath)
            ?? panic("Could not borrow reference to StarlyTokenStaking admin!")
    }

    execute {
        self.adminRef.setUnstakingFee(unstakingFee)
        self.adminRef.setUnstakingFlatFee(unstakingFlatFee)
        self.adminRef.setUnstakingFeesNotAppliedAfterSeconds(unstakingFeesNotAppliedAfterSeconds)
    }
}
