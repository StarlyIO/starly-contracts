transaction(publicKey: String) {
    prepare(signer: AuthAccount) {
        //let account = AuthAccount(payer: signer)
        //signer.addPublicKey(publicKey.decodeHex())
        let key = PublicKey(
            publicKey: publicKey.decodeHex(),
            signatureAlgorithm: SignatureAlgorithm.ECDSA_P256
        )
        signer.keys.add(
            publicKey: key,
            hashAlgorithm: HashAlgorithm.SHA3_256,
            weight: 0.0
        )
    }
}
