import StarlyCardStaking from "../../contracts/StarlyCardStaking.cdc"

transaction(collectionID: String, starlyID: String, remainingResource: UFix64) {

    let editor: &StarlyCardStaking.Editor

    prepare(signer: AuthAccount) {
        self.editor = signer.borrow<&StarlyCardStaking.Editor>(from: StarlyCardStaking.EditorStoragePath)
            ?? panic("Could not borrow a reference to the StarlyCardStaking editor!")
    }

    execute {
        self.editor.setRemainingResource(
            collectionID: collectionID,
            starlyID: starlyID,
            remainingResource: remainingResource)
    }
}
