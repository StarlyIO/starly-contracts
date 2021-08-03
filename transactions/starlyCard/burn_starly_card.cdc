import NonFungibleToken from 0xNONFUNGIBLETOKENADDRESS
import StarlyCard from 0xSTARLYCARDADDRESS

transaction(burnID: UInt64) {
  prepare(acct: AuthAccount) {

	let collection <- acct.load<@StarlyCard.Collection>(from: StarlyCard.CollectionStoragePath)!

	let nft <- collection.withdraw(withdrawID: burnID)

	destroy nft

	acct.save(<-collection, to: StarlyCard.CollectionStoragePath)
  }
}
