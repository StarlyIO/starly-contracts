import StarlyTokenStaking from "../../../contracts/StarlyTokenStaking.cdc"

transaction() {

    let adminRef: &StarlyTokenStaking.Admin

    prepare(acct: AuthAccount) {
        self.adminRef = acct.borrow<&StarlyTokenStaking.Admin>(from: StarlyTokenStaking.AdminStoragePath)
            ?? panic("Could not borrow reference to StarlyTokenStaking admin!")
    }

    execute {
        self.adminRef.setUnstackingFee(0.0)
        self.adminRef.setUnstackingFlatFee(0.0)
        self.adminRef.setUnstakingFeesNotAppliedAfterSeconds(0.0)
        self.adminRef.setMinStakingSeconds(0.0)
    }
}
