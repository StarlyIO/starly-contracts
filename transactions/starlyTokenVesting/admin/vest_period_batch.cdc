import NonFungibleToken from "../../../contracts/NonFungibleToken.cdc"
import StarlyToken from "../../../contracts/StarlyToken.cdc"
import StarlyTokenVesting from "../../../contracts/StarlyTokenVesting.cdc"

transaction() {

    let vaultRef: &StarlyToken.Vault
    let minterRef: &StarlyTokenVesting.NFTMinter
    let vestingCollectionRef: &{NonFungibleToken.CollectionPublic}

    prepare(acct: AuthAccount) {
        self.vaultRef = acct.borrow<&StarlyToken.Vault>(from: StarlyToken.TokenStoragePath)
            ?? panic("Could not borrow reference to the owner's StarlyToken vault!")
        self.minterRef = acct.borrow<&StarlyTokenVesting.NFTMinter>(from: StarlyTokenVesting.MinterStoragePath)
            ?? panic("Could not borrow reference to StarlyTokenVesting minter!")
        self.vestingCollectionRef = getAccount(acct.address).getCapability(StarlyTokenVesting.CollectionPublicPath)!
            .borrow<&{NonFungibleToken.CollectionPublic}>()
            ?? panic("Could not borrow capability from public StarlyTokenVesting collection!")
    }

    execute {
        let walletsAndAmounts: {Address: UFix64} = {
            0xd88dea66b28c8637: 1.0
        }
        for wallet in walletsAndAmounts.keys {
            let amount = walletsAndAmounts![wallet]!
            let vault <- self.vaultRef.withdraw(amount: amount) as! @StarlyToken.Vault
            let vesting <- self.minterRef.mintPeriod(
                beneficiary: wallet,
                vestedVault: <-vault,
                schedule: {
                    1652745600.0: 0.00000000,  // Tuesday, May 17, 2022 0:00:00
                    1655424000.0: 0.11111111,  // Friday, June 17, 2022 0:00:00
                    1658016000.0: 0.22222222,  // Sunday, July 17, 2022 0:00:00
                    1660694400.0: 0.33333333,  // Wednesday, August 17, 2022 0:00:00
                    1663372800.0: 0.44444444,  // Saturday, September 17, 2022 0:00:00
                    1665964800.0: 0.55555555,  // Monday, October 17, 2022 0:00:00
                    1668643200.0: 0.66666666,  // Thursday, November 17, 2022 0:00:00
                    1671235200.0: 0.77777777,  // Saturday, December 17, 2022 0:00:00
                    1673913600.0: 0.88888888,  // Tuesday, January 17, 2023 0:00:00
                    1676592000.0: 1.00000000}) // Friday, February 17, 2023 0:00:00
            self.vestingCollectionRef.deposit(token: <-vesting)
        }
    }
}
