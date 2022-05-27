import path from "path";
import {
    deployContractByName,
    emulator, executeScript,
    getAccountAddress,
    init,
    shallPass, shallThrow,
} from "flow-js-testing";

import {expectEvent} from "./util";

// Increase timeout if your tests failing due to timeout
jest.setTimeout(10000);

describe("StarlyIDParser contract tests", () => {
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

    test("Parse StarlyID", async () => {
        const account = await getAccountAddress("Alice");
        await shallPass(deployContractByName({to: account, name: "StarlyIDParser"}));

        const code = `
            import StarlyIDParser from "../contracts/StarlyIDParser.cdc"

            pub fun main(str: String): UInt32 {
                return StarlyIDParser.parseInt(str)
            }
        `;

        const [singleDigit] = await executeScript({code, args: ["4"]});
        expect(singleDigit).toBe(4);

        const [doubleDigit] = await executeScript({code, args: ["99"]});
        expect(doubleDigit).toBe(99);

        const [tripleDigit] = await executeScript({code, args: ["123"]});
        expect(tripleDigit).toBe(123);

        const [fiveDigits] = await executeScript({code, args: ["45070"]});
        expect(fiveDigits).toBe(45070);

        const [eightDigits] = await executeScript({code, args: ["23456789"]});
        expect(eightDigits).toBe(23456789);

        await shallThrow(await executeScript({code, args: [""]}));
        await shallThrow(await executeScript({code, args: ["asff"]}));
        await shallThrow(await executeScript({code, args: ["123456789"]}));
    });
})
