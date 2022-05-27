import StakedStarlyCard from "../../../contracts/StakedStarlyCard.cdc"

transaction() {

    let adminRef: &StakedStarlyCard.Admin

    prepare(acct: AuthAccount) {
        self.adminRef = acct.borrow<&StakedStarlyCard.Admin>(from: StakedStarlyCard.AdminStoragePath)
            ?? panic("Could not borrow reference to StakedStarlyCard admin!")
    }

    execute {
        self.adminRef.setStakingEnabled(false)
    }
}
