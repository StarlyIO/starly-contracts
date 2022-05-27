import path from "path";
import {
    deployContractByName,
    emulator, executeScript,
    getAccountAddress,
    getTemplate,
    init, mintFlow,
    sendTransaction,
    shallPass,
} from "flow-js-testing";

import {expectEvent} from "./util";

// Increase timeout if your tests failing due to timeout
jest.setTimeout(10000);

describe("StarlyCardMarket contract tests", () => {
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

    let starlyAccount;
    let addressMap;

    beforeEach(async () => {
        starlyAccount = await getAccountAddress("Starly");
        await mintFlow(starlyAccount, 10000.0);

        addressMap = {
            "FUSD": starlyAccount,
            "NonFungibleToken": starlyAccount,
            "StarlyIDParser": starlyAccount,
            "StarlyMetadata": starlyAccount,
            "StarlyMetadataViews": starlyAccount,
            "MetadataViews": starlyAccount,
            "StarlyCard": starlyAccount,
            "StarlyCardMarket": starlyAccount,
            "StarlyCollectorScore": starlyAccount,
            "TeleportedTetherToken": starlyAccount,
            "FlowSwapPair": starlyAccount,
            "FusdUsdtSwapPair": starlyAccount,
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
        await shallPass(deployContractByName({to: starlyAccount, name: "TeleportedTetherToken", addressMap}));
        await shallPass(deployContractByName({to: starlyAccount, name: "FlowSwapPair", addressMap}));
        await shallPass(deployContractByName({to: starlyAccount, name: "FusdUsdtSwapPair", addressMap}));
    });

    test("Accept offer with additional cuts", async () => {
        const sellerAccount = await getAccountAddress("Alice");
        const buyerAccount = await getAccountAddress("Bob");
        const creatorAccount = await getAccountAddress("Charlie");
        const minterAccount = await getAccountAddress("Minter");
        const somebodyAccount = await getAccountAddress("Somebody");

        for (const acc of [sellerAccount, buyerAccount, creatorAccount, starlyAccount, minterAccount, somebodyAccount]) {
            await shallPass(sendTransaction({
                code: getTemplate("../transactions/setup_account.cdc", addressMap),
                args: [],
                signers: [acc],
            }));
        }

        await shallPass(sendTransaction({
            code: getTemplate("../transactions/fusd/mint_tokens.cdc", addressMap),
            args: [buyerAccount, 1000.00],
            signers: [starlyAccount],
        }));

        await shallPass(sendTransaction({
            code: getTemplate("../transactions/starlyCard/mint_starly_cards.cdc", addressMap),
            args: [
                sellerAccount,
                ["asygwrgawegew/1/1", "asygwrgawegew/12/345"],
            ],
            signers: [starlyAccount],
        }));

        await shallPass(sendTransaction({
            code: getTemplate("../transactions/starlyCardMarket/create_sale_offer_additional_cuts.cdc", addressMap),
            args: [
                1,
                "10.0",
                starlyAccount,
                0.1,
                creatorAccount,
                0.05,
                minterAccount,
                0.01,
                somebodyAccount,
                0.04,
            ],
            signers: [sellerAccount],
        }));

        const sellerCollectionLengthBefore = await script("../scripts/starlyCard/read_collection_length.cdc",
            [sellerAccount], addressMap);

        const [txResult3] = await shallPass(sendTransaction({
            code: getTemplate("../transactions/starlyCardMarket/accept_sale_offer.cdc", addressMap),
            args: [
                1,
                sellerAccount,
            ],
            signers: [buyerAccount],
        }));

        const sellerCollectionLengthAfter = await script("../scripts/starlyCard/read_collection_length.cdc",
            [sellerAccount], addressMap);

        const buyerCollectionIds = await script("../scripts/starlyCard/read_collection_ids.cdc",
            [buyerAccount], addressMap);

        expectEvent("StarlyCard.Withdraw", txResult3, {
            id: 1,
            from: sellerAccount,
        });

        expectEvent("StarlyCard.Deposit", txResult3, {
            id: 1,
            to: buyerAccount,
        });

        // all sale cuts
        // 1. seller
        expectEvent("FUSD.TokensDeposited", txResult3, {
            amount: "8.00000000",
            to: sellerAccount,
        });

        // 2. beneficiary
        expectEvent("FUSD.TokensDeposited", txResult3, {
            amount: "1.00000000",
            to: starlyAccount,
        });

        // 3. minter
        expectEvent("FUSD.TokensDeposited", txResult3, {
            amount: "0.10000000",
            to: minterAccount,
        });

        // 3. somebody
        expectEvent("FUSD.TokensDeposited", txResult3, {
            amount: "0.40000000",
            to: somebodyAccount,
        });

        // offer accepted
        expectEvent("StarlyCardMarket.SaleOfferAccepted", txResult3, {
            itemID: 1,
            starlyID: "asygwrgawegew/12/345",
            price: "10.00000000",
            buyerAddress: buyerAccount,
        });

        expect(sellerCollectionLengthBefore).toBe(2);
        expect(sellerCollectionLengthAfter).toBe(1);
        expect(buyerCollectionIds[0]).toBe(1);
    });

    test("Accept sale offer with conversion FLOW -> FUSD", async () => {
        const sellerAccount = await getAccountAddress("Alice");
        const buyerAccount = await getAccountAddress("Bob");
        const creatorAccount = await getAccountAddress("Charlie");

        for (const acc of [sellerAccount, buyerAccount, creatorAccount, starlyAccount]) {
            await shallPass(sendTransaction({
                code: getTemplate("../transactions/setup_account.cdc", addressMap),
                args: [],
                signers: [acc],
            }));
        }

        await shallPass(sendTransaction({
            code: getTemplate("../transactions/exchange/setup_exchange_for_test.cdc", addressMap),
            args: [],
            signers: [starlyAccount],
        }));

        await mintFlow(buyerAccount, 100.0);

        await shallPass(sendTransaction({
            code: getTemplate("../transactions/starlyCard/mint_starly_cards.cdc", addressMap),
            args: [
                sellerAccount,
                ["asygwrgawegew/1/1", "asygwrgawegew/12/345"],
            ],
            signers: [starlyAccount],
        }));

        await shallPass(sendTransaction({
            code: getTemplate("../transactions/starlyCardMarket/create_sale_offer.cdc", addressMap),
            args: [
                1,
                "10.0",
                starlyAccount,
                0.1,
                creatorAccount,
                0.05,
            ],
            signers: [sellerAccount],
        }));

        const [txResult3] = await sendTransaction({
            code: getTemplate("../transactions/starlyCardMarket/accept_sale_offer_convert.cdc", addressMap),
            args: [
                1,
                sellerAccount,
            ],
            signers: [buyerAccount],
        });

        const buyerCollectionIds = await script("../scripts/starlyCard/read_collection_ids.cdc",
            [buyerAccount], addressMap);

        expectEvent("FlowSwapPair.Trade", txResult3, {
            side: 1,
        });

        expectEvent("FusdUsdtSwapPair.Trade", txResult3, {
            side: 2,
        });

        expectEvent("StarlyCard.Withdraw", txResult3, {
            id: 1,
            from: sellerAccount,
        });

        expectEvent("StarlyCard.Deposit", txResult3, {
            id: 1,
            to: buyerAccount,
        });

        expectEvent("StarlyCardMarket.SaleOfferAccepted", txResult3, {
            itemID: 1,
            starlyID: "asygwrgawegew/12/345",
            price: "10.00000000",
            buyerAddress: buyerAccount,
        });

        expect(buyerCollectionIds[0]).toBe(1);
    });

    test("Cancel offer", async () => {
        const sellerAccount = await getAccountAddress("Alice");
        const buyerAccount = await getAccountAddress("Bob");
        const creatorAccount = await getAccountAddress("Charlie");

        for (const acc of [sellerAccount, buyerAccount, creatorAccount, starlyAccount]) {
            await shallPass(sendTransaction({
                code: getTemplate("../transactions/setup_account.cdc", addressMap),
                args: [],
                signers: [acc],
            }));
        }

        await shallPass(sendTransaction({
            code: getTemplate("../transactions/fusd/mint_tokens.cdc", addressMap),
            args: [buyerAccount, 1000.00],
            signers: [starlyAccount],
        }));

        await shallPass(sendTransaction({
            code: getTemplate("../transactions/starlyCard/mint_starly_cards.cdc", addressMap),
            args: [
                sellerAccount,
                ["asygwrgawegew/1/1", "asygwrgawegew/12/345"],
            ],
            signers: [starlyAccount],
        }));

        await shallPass(sendTransaction({
            code: getTemplate("../transactions/starlyCardMarket/create_sale_offer.cdc", addressMap),
            args: [
                1,
                "10.0",
                starlyAccount,
                0.1,
                creatorAccount,
                0.05,
            ],
            signers: [sellerAccount],
        }));

        const [txResult] = await shallPass(sendTransaction({
            code: getTemplate("../transactions/starlyCardMarket/cancel_sale_offer.cdc", addressMap),
            args: [1],
            signers: [sellerAccount],
        }));

        expectEvent("StarlyCardMarket.CollectionRemovedSaleOffer", txResult, {
            itemID: 1,
            sellerAddress: sellerAccount,
        });
    });

    async function script(filename, args, addressMap) {
        const code = getTemplate(filename, addressMap);
        const [result] = await executeScript({code, args});
        return result;
    }
})
