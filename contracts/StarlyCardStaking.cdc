import NonFungibleToken from "./NonFungibleToken.cdc"
import MetadataViews from "./MetadataViews.cdc"
import StarlyIDParser from "./StarlyIDParser.cdc"
import StarlyMetadata from "./StarlyMetadata.cdc"
import StarlyMetadataViews from "./StarlyMetadataViews.cdc"

pub contract StarlyCardStaking {

    pub struct CollectionData {
        pub let editions: {String: UFix64}

        init(editions: {String: UFix64}) {
            self.editions = editions
        }
    }

    access(contract) var collections: {String: CollectionData}

    pub let AdminStoragePath: StoragePath
    pub let EditorStoragePath: StoragePath
    pub let EditorProxyStoragePath: StoragePath
    pub let EditorProxyPublicPath: PublicPath

    pub fun getRemainingResource(collectionID: String, starlyID: String): UFix64? {
        if let collection = StarlyCardStaking.collections[collectionID] {
            return collection.editions[starlyID]
        } else {
            return nil
        }
    }

    pub fun getRemainingResourceWithDefault(starlyID: String): UFix64 {
        let metadata = StarlyMetadata.getCardEdition(starlyID: starlyID) ?? panic("Missing metadata")
        let collectionID = metadata.collection.id
        let initialResource = metadata.score ?? 0.0
        return StarlyCardStaking.getRemainingResource(collectionID: collectionID, starlyID: starlyID) ?? initialResource
    }

    pub resource interface IEditor {
        pub fun setRemainingResource(collectionID: String, starlyID: String, remainingResource: UFix64)
    }

    pub resource Editor: IEditor {
        pub fun setRemainingResource(collectionID: String, starlyID: String, remainingResource: UFix64) {
            if let collection = StarlyCardStaking.collections[collectionID] {
                StarlyCardStaking.collections[collectionID]!.editions.insert(key: starlyID, remainingResource)
            } else {
                StarlyCardStaking.collections.insert(key: collectionID, CollectionData(editions: {starlyID: remainingResource}))
            }
        }
    }

    pub resource interface EditorProxyPublic {
        pub fun setEditorCapability(cap: Capability<&Editor>)
    }

    pub resource EditorProxy: IEditor, EditorProxyPublic {
        access(self) var editorCapability: Capability<&Editor>?

        pub fun setEditorCapability(cap: Capability<&Editor>) {
            self.editorCapability = cap
        }

        pub fun setRemainingResource(collectionID: String, starlyID: String, remainingResource: UFix64) {
            self.editorCapability!.borrow()!
            .setRemainingResource(collectionID: collectionID, starlyID: starlyID, remainingResource: remainingResource)
        }

        init() {
            self.editorCapability = nil
        }
    }

    pub fun createEditorProxy(): @EditorProxy {
        return <- create EditorProxy()
    }

    pub resource Admin {
        pub fun createNewEditor(): @Editor {
            return <- create Editor()
        }
    }

    init() {
        self.collections = {}

        self.AdminStoragePath = /storage/starlyCardStakingAdmin
        self.EditorStoragePath = /storage/starlyCardStakingEditor
        self.EditorProxyPublicPath = /public/starlyCardStakingEditorProxy
        self.EditorProxyStoragePath = /storage/starlyCardStakingEditorProxy

        let admin <- create Admin()
        let editor <- admin.createNewEditor()
        self.account.save(<-admin, to: self.AdminStoragePath)
        self.account.save(<-editor, to: self.EditorStoragePath)
    }
}
