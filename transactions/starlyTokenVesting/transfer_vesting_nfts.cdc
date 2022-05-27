import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import StarlyTokenVesting from "../../contracts/StarlyTokenVesting.cdc"

transaction(vestingIds: [UInt64], to: Address) {

    let vestingCollectionRef: &StarlyTokenVesting.Collection

    prepare(acct: AuthAccount) {
        self.vestingCollectionRef = acct.borrow<&StarlyTokenVesting.Collection>(from: StarlyTokenVesting.CollectionStoragePath)
            ?? panic("Could not borrow reference to the owner's StarlyTokenVesting collection!")
    }

    execute {
        let recipient = getAccount(to)

        let recipientCollectionRef = recipient.getCapability(StarlyTokenVesting.CollectionPublicPath)
            .borrow<&StarlyTokenVesting.Collection{NonFungibleToken.CollectionPublic}>()
            ?? panic("Could not borrow receiver reference to the recipient's Vault")

        for vestingId in vestingIds {
            recipientCollectionRef.deposit(token: <-self.vestingCollectionRef.withdraw(withdrawID: vestingId))
        }
    }
}
