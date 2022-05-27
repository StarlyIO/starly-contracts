import path from "path";
import {
    deployContractByName,
    emulator,
    getAccountAddress,
    getTemplate,
    init,
    mintFlow,
    sendTransaction,
    shallPass,
} from "flow-js-testing";

import {expectEvent} from "./util";

// Increase timeout if your tests failing due to timeout
jest.setTimeout(10000);

describe("StarlyPack contract tests", () => {
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

    test("Buy pack FUSD", async () => {
        const buyerAccount = await getAccountAddress("Alice");
        const creatorAccount = await getAccountAddress("Bob");
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
            "StarlyPack": starlyAccount,
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
        await shallPass(deployContractByName({to: starlyAccount, name: "StarlyPack", addressMap}));

        await shallPass(sendTransaction({
            code: getTemplate("../transactions/setup_account.cdc", addressMap),
            args: [],
            signers: [buyerAccount],
        }));

        await shallPass(sendTransaction({
            code: getTemplate("../transactions/setup_account.cdc", addressMap),
            args: [],
            signers: [creatorAccount],
        }));

        await shallPass(sendTransaction({
            code: getTemplate("../transactions/setup_account.cdc", addressMap),
            args: [],
            signers: [starlyAccount],
        }));

        await shallPass(sendTransaction({
            code: getTemplate("../transactions/fusd/mint_tokens.cdc", addressMap),
            args: [buyerAccount, 1000.00],
            signers: [starlyAccount],
        }));

        const [txResult, _error2] = await shallPass(sendTransaction({
            code: getTemplate("../transactions/starlyPack/buy_pack.cdc", addressMap),
            args: [
                "collectionId",
                ["aaaaa", "bbbbb"],
                10,
                starlyAccount,
                0.2,
                creatorAccount,
                0.8
            ],
            signers: [buyerAccount],
        }));

        expectEvent("FUSD.TokensWithdrawn", txResult, {
            amount: "10.00000000",
            from: buyerAccount,
        });

        expectEvent("FUSD.TokensDeposited", txResult, {
            amount: "2.00000000",
            to: starlyAccount,
        });

        expectEvent("FUSD.TokensDeposited", txResult, {
            amount: "8.00000000",
            to: creatorAccount,
        });

        expectEvent("StarlyPack.Purchased", txResult, {
            collectionID: "collectionId",
            packIDs: ["aaaaa", "bbbbb"],
            price: "10.00000000",
            beneficiarySaleCut: {
                amount: "2.00000000",
                percent: "0.20000000"
            },
            creatorSaleCut: {
                amount: "8.00000000",
                percent: "0.80000000"
            },
        });
    });

    test("Buy pack FLow", async () => {
        const buyerAccount = await getAccountAddress("Alice");
        const creatorAccount = await getAccountAddress("Bob");
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
            "StarlyPack": starlyAccount,
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
        await shallPass(deployContractByName({to: starlyAccount, name: "StarlyPack", addressMap}));

        await shallPass(sendTransaction({
            code: getTemplate("../transactions/setup_account.cdc", addressMap),
            args: [],
            signers: [buyerAccount],
        }));

        await shallPass(sendTransaction({
            code: getTemplate("../transactions/setup_account.cdc", addressMap),
            args: [],
            signers: [creatorAccount],
        }));

        await shallPass(sendTransaction({
            code: getTemplate("../transactions/setup_account.cdc", addressMap),
            args: [],
            signers: [starlyAccount],
        }));

        await mintFlow(buyerAccount, "100.0")

        const [txResult, _error2] = await shallPass(sendTransaction({
            code: getTemplate("../transactions/starlyPack/buy_pack_flow.cdc", addressMap),
            args: [
                "collectionId",
                ["aaaaa", "bbbbb"],
                10,
                starlyAccount,
                0.2,
                creatorAccount,
                0.8,
                {}
            ],
            signers: [buyerAccount],
        }));

        expectEvent("FlowToken.TokensWithdrawn", txResult, {
            amount: "10.00000000",
            from: buyerAccount,
        });

        expectEvent("FlowToken.TokensDeposited", txResult, {
            amount: "2.00000000",
            to: starlyAccount,
        });

        expectEvent("FlowToken.TokensDeposited", txResult, {
            amount: "8.00000000",
            to: creatorAccount,
        });

        expectEvent("StarlyPack.Purchased", txResult, {
            collectionID: "collectionId",
            packIDs: ["aaaaa", "bbbbb"],
            price: "10.00000000",
            beneficiarySaleCut: {
                amount: "2.00000000",
                percent: "0.20000000"
            },
            creatorSaleCut: {
                amount: "8.00000000",
                percent: "0.80000000"
            },
        });
    });
})
