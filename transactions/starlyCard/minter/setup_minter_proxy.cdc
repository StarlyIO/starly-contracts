import StarlyCard from "../../contracts/StarlyCard.cdc"

transaction {
    prepare(signer: AuthAccount) {
        let minterProxy <- StarlyCard.createMinterProxy()
        signer.save(<- minterProxy, to: StarlyCard.MinterProxyStoragePath,)
        signer.link<&StarlyCard.MinterProxy{StarlyCard.MinterProxyPublic}>(
            StarlyCard.MinterProxyPublicPath,
            target: StarlyCard.MinterProxyStoragePath
        )
    }
}
