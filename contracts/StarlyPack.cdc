import FungibleToken from 0xFUNGIBLETOKENADDRESS
import FUSD from 0xFUSDADDRESS
import StarlyCardMarket from 0xSTARLYCARDMARKETADDRESS

pub contract StarlyPack {

    // Since we are open to world, we need mechanism for securely selling packs to users without showing what is inside. StarlyPack.Purchased is an event that
    // that server relies on when giving pack to user. It checks packIDs (user must previously reserve those), price, currect addresses and cuts. It is
    // easy to fabricate this events with malformed ids, prices and address. Server job is to check all that information before giving pack to user. If user uses
    // client app then there should be no problems -- packs reserved, royalties paid to correct addresses.
    //
    // Actual NFTs are minted and deposited to user account when user opens pack.
    pub event Purchased(
        collectionID: String,
        packIDs: [String],
        price: UFix64,
        buyerAddress: Address,
        beneficiarySaleCut: StarlyCardMarket.SaleCut,
        creatorSaleCut: StarlyCardMarket.SaleCut,
        additionalSaleCuts: [StarlyCardMarket.SaleCut])

    pub fun purchase(
        collectionID: String,
        packIDs: [String],
        price: UFix64,
        buyerAddress: Address,
        paymentVault: @FungibleToken.Vault,
        beneficiarySaleCutReceiver: StarlyCardMarket.SaleCutReceiver,
        creatorSaleCutReceiver: StarlyCardMarket.SaleCutReceiver,
        additionalSaleCutReceivers: [StarlyCardMarket.SaleCutReceiver]) {

        pre {
            paymentVault.balance == price: "payment does not equal offer price"
            beneficiarySaleCutReceiver.receiver.borrow() != nil: "Cannot borrow beneficiaryPaymentReceiver"
            creatorSaleCutReceiver.receiver.borrow() != nil: "Cannot borrow creatorPaymentReceiver"
        }

        // TODO why this cannot be in pre phase?
        for additionalSaleCutReceiver in additionalSaleCutReceivers {
            additionalSaleCutReceiver.receiver.borrow() ?? panic("Cannot borrow additionalPaymentReceiver")
        }

        let beneficiaryCutAmount = price * beneficiarySaleCutReceiver.percent
        let beneficiaryCut <- paymentVault.withdraw(amount: beneficiaryCutAmount)
        beneficiarySaleCutReceiver.receiver.borrow()!.deposit(from: <- beneficiaryCut)

        let creatorCutAmount = price * creatorSaleCutReceiver.percent
        let creatorCut <- paymentVault.withdraw(amount: creatorCutAmount)
        creatorSaleCutReceiver.receiver.borrow()!.deposit(from: <- creatorCut)

        var additionalSaleCuts: [StarlyCardMarket.SaleCut] = []
        for additionalSaleCutReceiver in additionalSaleCutReceivers {
             let additionalCutAmount = price * additionalSaleCutReceiver.percent
             let additionalCut <- paymentVault.withdraw(amount: additionalCutAmount)
             additionalSaleCutReceiver.receiver.borrow()!.deposit(from: <- additionalCut)
             additionalSaleCuts.append(StarlyCardMarket.SaleCut(
                address: additionalSaleCutReceiver.receiver.address,
                amount: additionalCutAmount,
                percent: additionalSaleCutReceiver.percent));
        }

        // At this point paymentVault should be empty, any residiual amount goes to beneficiary to avoid resource loss.
        beneficiarySaleCutReceiver.receiver.borrow()!.deposit(from: <- paymentVault)

        emit Purchased(
            collectionID: collectionID,
            packIDs: packIDs,
            price: price,
            buyerAddress: buyerAddress,
            beneficiarySaleCut: StarlyCardMarket.SaleCut(
                address: beneficiarySaleCutReceiver.receiver.address,
                amount: beneficiaryCutAmount,
                percent: beneficiarySaleCutReceiver.percent),
            creatorSaleCut: StarlyCardMarket.SaleCut(
                address: creatorSaleCutReceiver.receiver.address,
                amount: creatorCutAmount,
                percent: creatorSaleCutReceiver.percent),
            additionalSaleCuts: additionalSaleCuts)
    }
}
