import StakedStarlyCard from "../../contracts/StakedStarlyCard.cdc"
import StarlyCard from "../../contracts/StarlyCard.cdc"
import StarlyMetadata from "../../contracts/StarlyMetadata.cdc"
import StarlyMetadataViews from "../../contracts/StarlyMetadataViews.cdc"

pub fun getStarlyCardCollectionCollectorScores(account: PublicAccount): UFix64 {
    let capability = account.getCapability(StarlyCard.CollectionPublicPath)
    let collectionRef = capability!.borrow<&{StarlyCard.StarlyCardCollectionPublic}>()
        ?? panic("Could not borrow StarlyCard.StarlyCardCollectionPublic!")

    let nftIds = collectionRef.getIDs()
    var collectorScoreSum: UFix64 = 0.0
    for nftId in nftIds {
        let starlyCard = collectionRef.borrowStarlyCard(id: nftId)
            ?? panic("No such id in StarlyCard collection")
        if let metadata = starlyCard.resolveView(Type<StarlyMetadataViews.CardEdition>()) as! StarlyMetadataViews.CardEdition? {
            let score = metadata.score ?? panic("No score")
            collectorScoreSum = collectorScoreSum + score
        }
    }

    return collectorScoreSum
}

pub fun getStakedStarlyCardCollectionCollectorScores(account: PublicAccount): UFix64 {
    let capability = account.getCapability(StakedStarlyCard.CollectionPublicPath)
    let collectionRef = capability!.borrow<&{StakedStarlyCard.CollectionPublic}>()
        ?? panic("Could not borrow StakedStarlyCard.CollectionPublic!")

    let nftIds = collectionRef.getIDs()
    var collectorScoreSum: UFix64 = 0.0
    for nftId in nftIds {
        let stakedStarlyCard = collectionRef.borrowStakePublic(id: nftId)
        let starlyCard = stakedStarlyCard.borrowStarlyCard()
        if let metadata = starlyCard.resolveView(Type<StarlyMetadataViews.CardEdition>()) as! StarlyMetadataViews.CardEdition? {
            let score =  metadata.score ?? panic("No score")
            collectorScoreSum = collectorScoreSum + score
        }
    }

    return collectorScoreSum
}

pub fun main(address: Address): UFix64 {
    let account = getAccount(address)

    return getStarlyCardCollectionCollectorScores(account: account) + getStakedStarlyCardCollectionCollectorScores(account: account)
}
