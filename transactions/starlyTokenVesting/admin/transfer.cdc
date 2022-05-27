import NonFungibleToken from "../../../contracts/NonFungibleToken.cdc"
import StarlyTokenVesting from "../../../contracts/StarlyTokenVesting.cdc"

transaction(recipient: Address, withdrawID: UInt64) {
    prepare(signer: AuthAccount) {
        let recipient = getAccount(recipient)
        let collectionRef = signer.borrow<&StarlyTokenVesting.Collection>(from: StarlyTokenVesting.CollectionStoragePath)
            ?? panic("Could not borrow a reference to the owner's StarlyTokenVesting collection!")
        let depositRef = recipient.getCapability(StarlyTokenVesting.CollectionPublicPath)!.borrow<&{NonFungibleToken.CollectionPublic}>()!
        let nft <- collectionRef.withdraw(withdrawID: withdrawID)
        depositRef.deposit(token: <-nft)
    }
}
