import StarlyTokenStaking from "../../../contracts/StarlyTokenStaking.cdc"

transaction() {

    let adminRef: &StarlyTokenStaking.Admin

    prepare(acct: AuthAccount) {
        self.adminRef = acct.borrow<&StarlyTokenStaking.Admin>(from: StarlyTokenStaking.AdminStoragePath)
            ?? panic("Could not borrow reference to StarlyTokenStaking admin!")
    }

    execute {
        self.adminRef.setUnstakingFee(0.001)
        self.adminRef.setUnstakingFlatFee(0.001)
        self.adminRef.setUnstakingFeesNotAppliedAfterSeconds(60.0)
        self.adminRef.setMinStakingSeconds(20.0)
    }
}
