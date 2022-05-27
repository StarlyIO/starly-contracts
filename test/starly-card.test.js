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

describe("StarlyCard contract tests", () => {
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

    test("Mint Starly Cards", async () => {
        const userAccount = await getAccountAddress("Alice");
        const starlyAccount = await getAccountAddress("Starly");

        const addressMap = {
            "FUSD": starlyAccount,
            "NonFungibleToken": starlyAccount,
            "StarlyIDParser": starlyAccount,
            "StarlyMetadata": starlyAccount,
            "StarlyMetadataViews": starlyAccount,
            "MetadataViews": starlyAccount,
            "StarlyCard": starlyAccount,
            "StarlyCardMarket": starlyAccount,
            "StarlyCollectorScore": starlyAccount,
        };

        await shallPass(deployContractByName({to: starlyAccount, name: "FUSD", addressMap}));
        await shallPass(deployContractByName({to: starlyAccount, name: "NonFungibleToken", addressMap}));
        await shallPass(deployContractByName({to: starlyAccount, name: "StarlyIDParser", addressMap}));
        await shallPass(deployContractByName({to: starlyAccount, name: "MetadataViews", addressMap}));
        await shallPass(deployContractByName({to: starlyAccount, name: "StarlyMetadataViews", addressMap}));
        await shallPass(deployContractByName({to: starlyAccount, name: "StarlyCollectorScore", addressMap}));
        await shallPass(deployContractByName({to: starlyAccount, name: "StarlyMetadata", addressMap}));
        await shallPass(deployContractByName({to: starlyAccount, name: "StarlyCard", addressMap}));
        await shallPass(deployContractByName({to: starlyAccount, name: "StarlyCardMarket", addressMap}));

        await shallPass(sendTransaction({
            code: getTemplate("../transactions/setup_account.cdc", addressMap),
            args: [],
            signers: [userAccount],
        }));

        await shallPass(sendTransaction({
            code: getTemplate("../transactions/setup_account.cdc", addressMap),
            args: [],
            signers: [starlyAccount],
        }));

        const [txResult] = await shallPass(sendTransaction({
            code: getTemplate("../transactions/starlyCard/mint_starly_cards.cdc", addressMap),
            args: [
                userAccount,
                ["asygwrgawegew/12/345", "asygwrgawegew/11/111"],
            ],
            signers: [starlyAccount],
        }));

        expectEvent("StarlyCard.Minted", txResult, {
            id: 0,
            starlyID: "asygwrgawegew/12/345",
        });

        expectEvent("StarlyCard.Minted", txResult, {
            id: 1,
            starlyID: "asygwrgawegew/11/111",
        });

        expectEvent("StarlyCard.Deposit", txResult, {
            id: 0,
            to: userAccount,
        });

        expectEvent("StarlyCard.Deposit", txResult, {
            id: 1,
            to: userAccount,
        });

        const nftIds = await script("../scripts/starlyCard/read_collection_ids.cdc", [userAccount], addressMap);
        expect(nftIds.length).toBe(2);
    });

    async function script(filename, args, addressMap) {
        const code = getTemplate(filename, addressMap);
        const [result] = await executeScript({code, args});
        return result;
    }
})
