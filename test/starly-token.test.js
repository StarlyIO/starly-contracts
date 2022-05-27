import path from "path";
import {
    deployContractByName,
    emulator, executeScript,
    getAccountAddress,
    getTemplate,
    init,
    sendTransaction,
    shallPass,
} from "flow-js-testing";

import {expectEvent} from "./util";

// Increase timeout if your tests failing due to timeout
jest.setTimeout(10000);

describe("StarlyToken contract tests", () => {
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

    test("Transfer Starly Tokens", async () => {
        const userAccount1 = await getAccountAddress("Alice");
        const userAccount2 = await getAccountAddress("Bob");
        const starlyAccount = await getAccountAddress("Starly");

        const addressMap = {
            "NonFungibleToken": starlyAccount,
            "StarlyToken": starlyAccount,
        };

        await shallPass(deployContractByName({to: starlyAccount, name: "NonFungibleToken", addressMap}));
        await shallPass(deployContractByName({to: starlyAccount, name: "StarlyToken", addressMap}));

        await shallPass(sendTransaction({
            code: getTemplate("../transactions/starlyToken/setup_account.cdc", addressMap),
            args: [],
            signers: [userAccount1],
        }));

        await shallPass(sendTransaction({
            code: getTemplate("../transactions/starlyToken/setup_account.cdc", addressMap),
            args: [],
            signers: [userAccount2],
        }));

        const [txResult] = await shallPass(sendTransaction({
            code: getTemplate("../transactions/starlyToken/transfer_batch.cdc", addressMap),
            args: [
                "500.0",
                {
                    [userAccount1]: "100.0",
                    [userAccount2]: "400.0"
                },
            ],
            signers: [starlyAccount],
        }));

        expectEvent("StarlyToken.TokensDeposited", txResult, {
            amount: "100.00000000",
            to: userAccount1,
        });

        expectEvent("StarlyToken.TokensDeposited", txResult, {
            amount: "400.00000000",
            to: userAccount2,
        });

        const balance1 = await getStarlyTokenBalance(userAccount1, addressMap);
        const balance2 = await getStarlyTokenBalance(userAccount2, addressMap);
        expect(balance1).toBe("100.00000000");
        expect(balance2).toBe("400.00000000");
    });

    async function script(filename, args, addressMap) {
        const code = getTemplate(filename, addressMap);
        const [result] = await executeScript({code, args});
        return result;
    }

    async function getStarlyTokenBalance(account, addressMap) {
        return await script("../scripts/starlyToken/read_balance.cdc", [account], addressMap)
    }
})
