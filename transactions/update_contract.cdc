transaction(name: String, code: String) {
    prepare(signer: AuthAccount, admin: AuthAccount) {
        signer.contracts.update__experimental(name: name, code: code.decodeHex())
    }
}
