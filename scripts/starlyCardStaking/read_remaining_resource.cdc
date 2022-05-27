import StarlyCardStaking from "../../contracts/StarlyCardStaking.cdc"

pub fun main(collectionID: String, starlyID: String): UFix64? {
    return StarlyCardStaking.getRemainingResource(collectionID: collectionID, starlyID: starlyID)
}
