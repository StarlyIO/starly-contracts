transaction(n: Int, publicKey: String) {
    prepare(signer: AuthAccount) {
        var i = 0
        while i < n {
            let key = PublicKey(
                publicKey: publicKey.decodeHex(),
                signatureAlgorithm: SignatureAlgorithm.ECDSA_P256
            )
            signer.keys.add(
                publicKey: key,
                hashAlgorithm: HashAlgorithm.SHA3_256,
                weight: 1000.0
            )
            i = i + 1
        }
    }
}
