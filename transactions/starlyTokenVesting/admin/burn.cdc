import StarlyToken from "../../../contracts/StarlyToken.cdc"
import StarlyTokenVesting from "../../../contracts/StarlyTokenVesting.cdc"

transaction(id: UInt64) {

    let burnerRef: &StarlyTokenVesting.NFTBurner
    let vestingCollectionRef: &StarlyTokenVesting.Collection

    prepare(acct: AuthAccount) {
        self.burnerRef = acct.borrow<&StarlyTokenVesting.NFTBurner>(from: StarlyTokenVesting.BurnerStoragePath)
            ?? panic("Could not borrow reference to StarlyTokenVesting burner!")
        self.vestingCollectionRef = acct.borrow<&StarlyTokenVesting.Collection>(from: StarlyTokenVesting.CollectionStoragePath)
            ?? panic("Could not borrow reference to StarlyTokenVesting collection!")
    }

    execute {
        let vesting <- self.vestingCollectionRef.withdraw(withdrawID: id) as! @StarlyTokenVesting.NFT
        self.burnerRef.burn(vesting: <-vesting)
    }
}
