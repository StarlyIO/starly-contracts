import StarlyCollectorScore from "../../contracts/StarlyCollectorScore.cdc"

transaction() {

    let editor: &StarlyCollectorScore.Editor

    prepare(signer: AuthAccount) {
        self.editor = signer.borrow<&StarlyCollectorScore.Editor>(from: StarlyCollectorScore.EditorStoragePath)
            ?? panic("Could not borrow a reference to the StarlyCollectorScore editor")
    }

    execute {
        self.editor.addCollectionConfig(
            collectionID: "JxznUdOwMHiO1vZ1B4hX",
            config: {
                "rare": StarlyCollectorScore.Config(
                    editions: [
                        [1, 4000],
                        [2, 2000],
                        [3, 1600],
                        [4, 1200],
                        [5, 800],
                        [6, 720],
                        [7, 680],
                        [8, 640],
                        [9, 600],
                        [10, 560],
                        [20, 400],
                        [30, 360],
                        [40, 320],
                        [49, 280],
                        [50, 560],
                        [60, 240],
                        [70, 224],
                        [80, 208],
                        [90, 192],
                        [99, 176],
                        [100, 480],
                        [199, 160],
                        [200, 440],
                        [299, 144],
                        [300, 400],
                        [399, 128],
                        [400, 360],
                        [499, 112],
                        [500, 320],
                        [599, 96],
                        [600, 280]
                    ],
                    rest: 80,
                    last: 2000
                ),
                "legendary": StarlyCollectorScore.Config(
                    editions: [
                        [1, 20000],
                        [2, 10000],
                        [3, 8000],
                        [4, 6000],
                        [5, 4000],
                        [6, 3600],
                        [7, 3400],
                        [8, 3200],
                        [9, 3000],
                        [10, 2800],
                        [20, 2000],
                        [30, 1800],
                        [40, 1600],
                        [49, 1400],
                        [50, 1400],
                        [60, 1200],
                        [70, 1120],
                        [80, 1040],
                        [90, 960]
                    ],
                    rest: 880,
                    last: 10000
                ),
                "common": StarlyCollectorScore.Config(
                    editions: [
                        [1, 1000],
                        [2, 500],
                        [3, 400],
                        [4, 300],
                        [5, 200],
                        [6, 180],
                        [7, 170],
                        [8, 160],
                        [9, 150],
                        [10, 140],
                        [20, 100],
                        [30, 90],
                        [40, 80],
                        [49, 70],
                        [50, 140],
                        [60, 60],
                        [70, 56],
                        [80, 52],
                        [90, 48],
                        [99, 44],
                        [100, 120],
                        [199, 40],
                        [200, 110],
                        [299, 36],
                        [300, 100],
                        [399, 32],
                        [400, 90],
                        [499, 28],
                        [500, 80],
                        [599, 24],
                        [600, 70],
                        [999, 20],
                        [1000, 120],
                        [1946, 16],
                        [1947, 1000],
                        [1999, 12],
                        [2000, 60]
                    ],
                    rest: 8,
                    last: 500
                )
            }
        )
    }
}
