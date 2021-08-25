import NonFungibleToken from 0xNONFUNGIBLETOKENADDRESS
import StarlyCard from 0xSTARLYCARDADDRESS

// This transaction uses the MinterProxy resource to mint a new NFT.
//
// It must be run with the account that has the minter resource
// stored at path /storage/starlyCardMinterProxy.

transaction(recipient: Address, starlyID: String) {

    // local variable for storing the minter reference
    let minterProxy: &StarlyCard.MinterProxy

    prepare(signer: AuthAccount) {

        // borrow a reference to the NFTMinter resource in storage
        self.minterProxy = signer.borrow<&StarlyCard.MinterProxy>(from: StarlyCard.MinterProxyStoragePath)
            ?? panic("Could not borrow a reference to the NFT minter proxy")
    }

    execute {
        // get the public account object for the recipient
        let recipient = getAccount(recipient)

        // borrow the recipient's public NFT collection reference
        let receiver = recipient
            .getCapability(StarlyCard.CollectionPublicPath)!
            .borrow<&{NonFungibleToken.CollectionPublic}>()
            ?? panic("Could not get receiver reference to the NFT Collection")

        // mint the NFT and deposit it to the recipient's collection
        self.minterProxy.mintNFT(recipient: receiver, starlyID: starlyID)
    }
}
