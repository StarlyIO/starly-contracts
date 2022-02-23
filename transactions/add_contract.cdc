transaction(name: String, code: String) {
    prepare(signer: AuthAccount, admin: AuthAccount) {
        signer.contracts.add(name: name, code: code.decodeHex())
    }
}
