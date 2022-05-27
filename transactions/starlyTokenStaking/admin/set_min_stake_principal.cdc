import StarlyTokenStaking from "../../../contracts/StarlyTokenStaking.cdc"

transaction(amount: UFix64) {

    let adminRef: &StarlyTokenStaking.Admin

    prepare(acct: AuthAccount) {
        self.adminRef = acct.borrow<&StarlyTokenStaking.Admin>(from: StarlyTokenStaking.AdminStoragePath)
            ?? panic("Could not borrow reference to StarlyTokenStaking admin!")
    }

    execute {
        self.adminRef.setMinStakePrincipal(amount)
    }
}
