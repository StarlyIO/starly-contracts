import StarlyCollectorScore from "../../contracts/StarlyCollectorScore.cdc"

transaction() {

    let editor: &StarlyCollectorScore.Editor

    prepare(signer: AuthAccount) {
        self.editor = signer.borrow<&StarlyCollectorScore.Editor>(from: StarlyCollectorScore.EditorStoragePath)
            ?? panic("Could not borrow a reference to the StarlyCollectorScore editor")
    }

    execute {
        self.editor.addCollectionConfig(
            collectionID: "OxPnSvAC9Ixo2BkhC21F",
            config: {
                "common": StarlyCollectorScore.Config(
                    editions: [
                        [1, 100],
                        [2, 60],
                        [3, 32],
                        [4, 31],
                        [5, 30],
                        [6, 29],
                        [7, 28],
                        [8, 27],
                        [9, 26],
                        [10, 25],
                        [20, 24],
                        [30, 23],
                        [49, 22],
                        [50, 22],
                        [60, 21],
                        [70, 20],
                        [80, 19],
                        [90, 18],
                        [100, 17],
                        [110, 16],
                        [120, 15],
                        [130, 14],
                        [140, 13],
                        [150, 12],
                        [160, 11],
                        [170, 10],
                        [180, 9],
                        [190, 8],
                        [199, 7],
                        [200, 7],
                        [300, 6],
                        [400, 5],
                        [500, 4],
                        [600, 3]
                    ],
                    rest: 2,
                    last: 60
                ),
                "rare": StarlyCollectorScore.Config(
                    editions: [
                        [1, 500],
                        [2, 300],
                        [3, 160],
                        [4, 155],
                        [5, 150],
                        [6, 145],
                        [7, 140],
                        [8, 135],
                        [9, 130],
                        [10, 125],
                        [20, 120],
                        [30, 115],
                        [49, 110],
                        [50, 110],
                        [60, 105],
                        [70, 100],
                        [80, 95],
                        [90, 90],
                        [100, 85],
                        [110, 80],
                        [120, 75],
                        [130, 70],
                        [140, 65],
                        [150, 60],
                        [160, 55],
                        [170, 50],
                        [180, 45],
                        [190, 40]
                    ],
                    rest: 35,
                    last: 300
                ),
                "legendary": StarlyCollectorScore.Config(
                    editions: [
                        [1, 2500],
                        [2, 1500],
                        [3, 800],
                        [4, 775],
                        [5, 750],
                        [6, 725],
                        [7, 700],
                        [8, 675],
                        [9, 650],
                        [10, 625],
                        [20, 600],
                        [30, 575]
                    ],
                    rest: 550,
                    last: 1500
                ),
                "common_plus": StarlyCollectorScore.Config(
                    editions: [
                        [1, 500],
                        [2, 300],
                        [3, 160],
                        [4, 155],
                        [5, 150],
                        [6, 145],
                        [7, 140],
                        [8, 135],
                        [9, 130],
                        [10, 125],
                        [20, 120],
                        [30, 115],
                        [49, 110],
                        [50, 110],
                        [60, 105],
                        [70, 100],
                        [80, 95],
                        [90, 90],
                        [100, 85],
                        [110, 80],
                        [120, 75],
                        [130, 70],
                        [140, 65],
                        [150, 60],
                        [160, 55],
                        [170, 50],
                        [180, 45],
                        [190, 40],
                        [199, 35],
                        [200, 35],
                        [300, 30],
                        [400, 25],
                        [500, 20],
                        [600, 15]
                    ],
                    rest: 10,
                    last: 300
                ),
                "rare_plus": StarlyCollectorScore.Config(
                    editions: [
                        [1, 2500],
                        [2, 1500],
                        [3, 800],
                        [4, 775],
                        [5, 750],
                        [6, 725],
                        [7, 700],
                        [8, 675],
                        [9, 650],
                        [10, 625],
                        [20, 600],
                        [30, 575],
                        [49, 550],
                        [50, 550],
                        [60, 525],
                        [70, 500],
                        [80, 475],
                        [90, 450],
                        [100, 425],
                        [110, 400],
                        [120, 375],
                        [130, 350],
                        [140, 325],
                        [150, 300],
                        [160, 275],
                        [170, 250],
                        [180, 225],
                        [190, 200]
                    ],
                    rest: 175,
                    last: 1500
                ),
                "legendary_plus": StarlyCollectorScore.Config(
                    editions: [
                        [1, 12500],
                        [2, 7500],
                        [3, 4000],
                        [4, 3875],
                        [5, 3750],
                        [6, 3625],
                        [7, 3750],
                        [8, 3375],
                        [9, 3250],
                        [10, 3125],
                        [20, 3000],
                        [30, 2875]
                    ],
                    rest: 2750,
                    last: 7500
                )
            }
        )
    }
}
