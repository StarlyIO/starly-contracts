import FungibleToken from "../../contracts/FungibleToken.cdc"
import StarlyToken from "../../contracts/StarlyToken.cdc"

pub fun main(addresses: [Address]): [Address] {
    var initializedAddresses: [Address] = []
    for address in addresses {
        let recipient = getAccount(address)
        let receiverRef = recipient.getCapability(StarlyToken.TokenPublicReceiverPath).borrow<&{FungibleToken.Receiver}>()

        if (receiverRef != nil) {
            initializedAddresses.append(address);
        }
    }

    return initializedAddresses;
}
