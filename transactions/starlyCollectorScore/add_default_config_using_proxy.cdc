import StarlyCollectorScore from "../../contracts/StarlyCollectorScore.cdc"

transaction() {

    let editor: &StarlyCollectorScore.EditorProxy

    prepare(signer: AuthAccount) {
        self.editor = signer.borrow<&StarlyCollectorScore.EditorProxy>(from: StarlyCollectorScore.EditorProxyStoragePath)
            ?? panic("Could not borrow a reference to the StarlyCollectorScore.EditorProxy")
    }

    execute {
        self.editor.addCollectionConfig(
            collectionID: "default",
            config: {
                "legendary_plus": StarlyCollectorScore.Config(
                    editions: [
                        [1, 12500],
                        [2, 6250],
                        [3, 3125],
                        [4, 2500],
                        [5, 2375],
                        [6, 2250],
                        [7, 2125],
                        [8, 2000],
                        [9, 1875],
                        [10, 1725],
                        [20, 1625],
                        [30, 1500],
                        [40, 1375]
                    ],
                    rest: 1250,
                    last: 6250
                ),
                "legendary": StarlyCollectorScore.Config(
                    editions: [
                        [1, 2500],
                        [2, 1250],
                        [3, 625],
                        [4, 500],
                        [5, 475],
                        [6, 450],
                        [7, 425],
                        [8, 400],
                        [9, 375],
                        [10, 350],
                        [20, 325],
                        [30, 300],
                        [40, 275]
                    ],
                    rest: 250,
                    last: 1250
                ),
                "common_plus": StarlyCollectorScore.Config(
                    editions: [
                        [1, 500],
                        [2, 250],
                        [3, 125],
                        [4, 100],
                        [5, 95],
                        [6, 90],
                        [7, 85],
                        [8, 80],
                        [9, 75],
                        [10, 70],
                        [20, 65],
                        [30, 60],
                        [40, 55],
                        [49, 50],
                        [50, 50],
                        [60, 45],
                        [70, 40],
                        [80, 35],
                        [90, 30],
                        [99, 25],
                        [100, 55],
                        [199, 20],
                        [200, 50],
                        [299, 15],
                        [300, 45],
                        [399, 10],
                        [400, 40],
                        [499, 5],
                        [500, 35]
                    ],
                    rest: 5,
                    last: 250
                ),
                "rare_plus": StarlyCollectorScore.Config(
                    editions: [
                        [1, 3000],
                        [2, 1500],
                        [3, 750],
                        [4, 600],
                        [5, 570],
                        [6, 540],
                        [7, 510],
                        [8, 480],
                        [9, 450],
                        [10, 420],
                        [20, 390],
                        [30, 360],
                        [40, 330],
                        [49, 300],
                        [50, 300],
                        [60, 270],
                        [70, 240],
                        [80, 210],
                        [90, 180]
                    ],
                    rest: 150,
                    last: 1500
                ),
                "common": StarlyCollectorScore.Config(
                    editions: [
                        [1, 100],
                        [2, 50],
                        [3, 25],
                        [4, 20],
                        [5, 19],
                        [6, 18],
                        [7, 17],
                        [8, 16],
                        [9, 15],
                        [10, 14],
                        [20, 13],
                        [30, 12],
                        [40, 11],
                        [49, 10],
                        [50, 10],
                        [60, 9],
                        [70, 8],
                        [80, 7],
                        [90, 6],
                        [99, 5],
                        [100, 11],
                        [199, 4],
                        [200, 10],
                        [299, 3],
                        [300, 9],
                        [399, 2],
                        [400, 8],
                        [499, 1],
                        [500, 7]
                    ],
                    rest: 1,
                    last: 50
                ),
                "rare": StarlyCollectorScore.Config(
                    editions: [
                        [1, 600],
                        [2, 300],
                        [3, 150],
                        [4, 120],
                        [5, 114],
                        [6, 108],
                        [7, 102],
                        [8, 96],
                        [9, 90],
                        [10, 84],
                        [20, 78],
                        [30, 72],
                        [40, 66],
                        [49, 60],
                        [50, 60],
                        [60, 54],
                        [70, 48],
                        [80, 42],
                        [90, 36]
                    ],
                    rest: 30,
                    last: 300
                )
            }
        )
    }
}
