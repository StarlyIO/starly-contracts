import path from "path";
import {
    deployContractByName,
    emulator, executeScript,
    getAccountAddress, getTemplate,
    init, sendTransaction,
    shallPass, shallThrow,
} from "flow-js-testing";

import {expectEvent} from "./util";

// Increase timeout if your tests failing due to timeout
jest.setTimeout(10000);

describe("Collector score tests", () => {
    beforeEach(async () => {
        const basePath = path.resolve(__dirname, "..");
        // You can specify different port to parallelize execution of describe blocks
        const port = 8080;
        // Setting logging flag to true will pipe emulator output to console
        const logging = false;

        await init(basePath, {port});
        return emulator.start(port, logging);
    });

    // Stop emulator, so it could be restarted
    afterEach(async () => {
        return emulator.stop();
    });

    test("Edition score", async () => {
        const account = await getAccountAddress("Alice");

        const addressMap = {
            "StarlyMetadataViews": account,
            "StarlyCollectorScore": account,
        };

        await shallPass(deployContractByName({to: account, name: "StarlyMetadataViews", addressMap}));
        await shallPass(deployContractByName({to: account, name: "StarlyCollectorScore", addressMap}));
        await shallPass(addLaksheKobeConfig({signer: account, addressMap}))

        const code = `
            import StarlyCollectorScore from "../contracts/StarlyCollectorScore.cdc"

            pub fun main(e: UInt32): UFix64? {
                return StarlyCollectorScore.getCollectorScore(collectionID: "7Gijp751FMo2XfY7cR7m", rarity: "common",
                    edition: e, editions: 600, priceCoefficient: 1.5) 
            }
        `;

        const [result1] = await executeScript({code, args: [1]});
        expect(result1).toBe("150.00000000");

        const [result2] = await executeScript({code, args: [2]});
        expect(result2).toBe("75.00000000");

        const [result10] = await executeScript({code, args: [10]});
        expect(result10).toBe("21.00000000");

        const [result11] = await executeScript({code, args: [11]});
        expect(result11).toBe("19.50000000");

        const [result15] = await executeScript({code, args: [15]});
        expect(result15).toBe("19.50000000");

        const [result20] = await executeScript({code, args: [20]});
        expect(result20).toBe("19.50000000");

        const [result21] = await executeScript({code, args: [21]});
        expect(result21).toBe("18.00000000");

        const [result23] = await executeScript({code, args: [23]});
        expect(result23).toBe("18.00000000");

        const [result24] = await executeScript({code, args: [24]});
        expect(result24).toBe("150.00000000");

        const [result25] = await executeScript({code, args: [25]});
        expect(result25).toBe("18.00000000");

        // rest
        const [result550] = await executeScript({code, args: [550]});
        expect(result550).toBe("1.50000000");

        // last
        const [result600] = await executeScript({code, args: [600]});
        expect(result600).toBe("75.00000000");
    });
})

function tx(filename, args, signer, addressMap) {
    return sendTransaction({
        code: getTemplate(filename, addressMap),
        args: args,
        signers: [signer],
    });
}

function addDefaultConfig({signer, addressMap}) {
    return tx("../transactions/starlyCollectorScore/add_default_config.cdc", [], signer, addressMap);
}

function addLaksheKobeConfig({signer, addressMap}) {
    return tx("../transactions/starlyCollectorScore/add_lakshe_kobe_config.cdc", [], signer, addressMap);
}
