import StarlyCardStakingClaims from "../../../contracts/StarlyCardStakingClaims.cdc"

transaction() {

    let adminRef: &StarlyCardStakingClaims.Admin

    prepare(acct: AuthAccount) {
        self.adminRef = acct.borrow<&StarlyCardStakingClaims.Admin>(from: StarlyCardStakingClaims.AdminStoragePath)
            ?? panic("Could not borrow reference to StarlyCardStakingClaims admin!")
    }

    execute {
        self.adminRef.setClaimingEnabled(false)
    }
}
