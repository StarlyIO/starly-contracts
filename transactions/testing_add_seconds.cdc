import TestingUtilities from "../contracts/TestingUtilities.cdc"

transaction(seconds: UFix64) {
    prepare(signer: AuthAccount) {
        TestingUtilities.addSeconds(seconds)
    }
}
