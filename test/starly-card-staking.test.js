import path from "path";
import {
    deployContractByName,
    emulator, executeScript,
    getAccountAddress,
    getTemplate,
    init,
    sendTransaction,
    shallPass,
    shallRevert, shallThrow,
} from "flow-js-testing";

import {
    addSeconds,
    deployContractWithTestingUtils,
    expectEvent,
    expectNoEvent,
    insertTestingUtilitiesCode} from "./util";

// Increase timeout if your tests failing due to timeout
jest.setTimeout(20000);

describe("Starly Card Staking tests", () => {
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

    var addressMap;
    var aliceAccount;
    var fusdAccount;
    var nftAccount;
    var starlyAccount;
    var starlyCardStakingAccount;
    var starlyTokenAccount;
    var starlyTokenStakingAccount;

    beforeEach(async () => {
        nftAccount = await getAccountAddress("NonFungibleToken");
        fusdAccount = await getAccountAddress("FUSD");
        starlyAccount = await getAccountAddress("Starly");
        starlyTokenAccount = await getAccountAddress("StarlyToken");
        starlyTokenStakingAccount = await getAccountAddress("StarlyTokenStaking");
        starlyCardStakingAccount = await getAccountAddress("StarlyCardStaking");
        aliceAccount = await getAccountAddress("Alice");
        addressMap = {
            "CompoundInterest": starlyTokenAccount,
            "FUSD": fusdAccount,
            "MetadataViews": nftAccount,
            "NonFungibleToken": nftAccount,
            "StakedStarlyCard": starlyCardStakingAccount,
            "StarlyCard": starlyAccount,
            "StarlyCardMarket": starlyAccount,
            "StarlyCardStaking": starlyCardStakingAccount,
            "StarlyCardStakingClaims": starlyCardStakingAccount,
            "StarlyCollectorScore": starlyAccount,
            "StarlyIDParser": starlyAccount,
            "StarlyMetadata": starlyAccount,
            "StarlyMetadataViews": starlyAccount,
            "StarlyToken": starlyTokenAccount,
            "StarlyTokenStaking": starlyTokenStakingAccount,
            "TestingUtilities": starlyAccount,
        };
        await shallPass(deployContractByName({to: starlyTokenAccount, name: "CompoundInterest", addressMap}));
        await shallPass(deployContractByName({to: fusdAccount, name: "FUSD", addressMap}));
        await shallPass(deployContractByName({to: nftAccount, name: "MetadataViews", addressMap}));
        await shallPass(deployContractByName({to: nftAccount, name: "NonFungibleToken", addressMap}));
        await shallPass(deployContractByName({to: starlyAccount, name: "StarlyIDParser", addressMap}));
        await shallPass(deployContractByName({to: starlyAccount, name: "StarlyCollectorScore", addressMap}));
        await shallPass(deployContractByName({to: starlyAccount, name: "StarlyMetadataViews", addressMap}));
        await shallPass(deployContractByName({to: starlyAccount, name: "StarlyMetadata", addressMap}));
        await shallPass(deployContractByName({to: starlyAccount, name: "StarlyCard", addressMap}));
        await shallPass(deployContractByName({to: starlyAccount, name: "StarlyCardMarket", addressMap}));
        await shallPass(deployContractByName({to: starlyCardStakingAccount, name: "StarlyCardStaking", addressMap}));
        await shallPass(deployContractByName({to: starlyTokenAccount, name: "StarlyToken", addressMap}));
        await shallPass(deployContractByName({to: starlyAccount, name: "TestingUtilities", addressMap}));
        await shallPass(deployContractWithTestingUtils({to: starlyTokenStakingAccount, name: "StarlyTokenStaking", addressMap}));
        await shallPass(deployContractWithTestingUtils({to: starlyCardStakingAccount, name: "StakedStarlyCard", addressMap}));
        await shallPass(deployContractWithTestingUtils({to: starlyCardStakingAccount, name: "StarlyCardStakingClaims", addressMap}));

        await shallPass(setupStarlyTokenVault({signer: aliceAccount, addressMap}));
        await shallPass(setupStarlyCardCollection({signer: aliceAccount, addressMap}));
        await shallPass(setupStarlyCardMarketCollection({signer: aliceAccount, addressMap}));
        await shallPass(setupStarlyTokenStakingCollection({signer: aliceAccount, addressMap}));
        await shallPass(setupStakedStarlyCardCollection({signer: aliceAccount, addressMap}));

        await shallPass(setupCardStakingEditorProxy({signer: starlyCardStakingAccount, addressMap}));
        await shallPass(depositCardStakingEditorCapability({signer: starlyCardStakingAccount, to: starlyCardStakingAccount, addressMap}));

        await shallPass(addCollectorScoreDefaultConfig({signer: starlyAccount, addressMap}));
        await shallPass(addMetadata({signer: starlyAccount, collectionID: "collectionA", addressMap}));
        await shallPass(mintStarlyCard({signer: starlyAccount, to: aliceAccount, starlyID: "collectionA/1/1", addressMap})); // 2500
        expect(await getCollectorScoreSum(aliceAccount, addressMap)).toBe("2500.00000000");
        await shallPass(mintStarlyCard({signer: starlyAccount, to: aliceAccount, starlyID: "collectionA/1/2", addressMap}));
        await shallPass(mintStarlyCard({signer: starlyAccount, to: aliceAccount, starlyID: "collectionA/1/3", addressMap}));
        await shallPass(mintStarlyCard({signer: starlyAccount, to: aliceAccount, starlyID: "collectionA/1/4", addressMap})); // 500
        await shallPass(mintStarlyCard({signer: starlyAccount, to: aliceAccount, starlyID: "collectionA/21/123", addressMap})); // 4
        expect(await getStarlyCardCount(aliceAccount, addressMap)).toBe(5);
        expect(await getStakedStarlyCardCount(aliceAccount, addressMap)).toBe(0);
        expect(await getCollectorScoreSum(aliceAccount, addressMap)).toBe("4879.00000000");

        await shallPass(transferStarlyTokens({to: aliceAccount, from: starlyTokenAccount, amount: 50000, addressMap}));
        await shallPass(transferStarlyTokens({to: starlyCardStakingAccount, from: starlyTokenAccount, amount: 1000, addressMap}));
        expect(await getStarlyTokenBalance(aliceAccount, addressMap)).toBe("50000.00000000");
        expect(await getStarlyTokenBalance(starlyCardStakingAccount, addressMap)).toBe("1000.00000000");
    })

    test("Stake 1 card (2500) for 1 day, no token staked = daily limit of 0.0", async () => {
        await shallPass(stakeStarlyCards({signer: aliceAccount, ids: [0], addressMap}));
        await shallPass(addSeconds({signer: starlyAccount, seconds: 24 * 3600, addressMap}));

        const [txResult] = await shallPass(claimStarlyCards({signer: aliceAccount, ids: [0], addressMap}));
        expectNoEvent("StarlyToken.TokensDeposited", txResult);
        expectNoEvent("StarlyCardStakingClaims.ClaimPaid", txResult);
    });

    test("Stake 1 card (2500) for 1 day, 200 tokens staked = daily limit of 2.0", async () => {
        await shallPass(stakeStarlyTokens({signer: aliceAccount, amount: 200, addressMap}));
        await shallPass(stakeStarlyCards({signer: aliceAccount, ids: [0], addressMap}));
        await shallPass(addSeconds({signer: starlyAccount, seconds: 24 * 3600, addressMap}));

        const [txResult] = await shallPass(claimStarlyCards({signer: aliceAccount, ids: [0], addressMap}));
        expectEvent("StarlyToken.TokensDeposited", txResult, {
            amount: "2.00076542",
            to: aliceAccount,
        });
        expectEvent("StarlyCardStakingClaims.ClaimPaid", txResult, {
            amount: "2.00076542",
            to: aliceAccount,
            paidStakeIDs: [0],
        });

        const [txResult2] = await shallPass(claimStarlyCards({signer: aliceAccount, ids: [0], addressMap}));
        expectNoEvent("StarlyToken.TokensDeposited", txResult2);
        expectNoEvent("StarlyCardStakingClaims.ClaimPaid", txResult2)

        await shallPass(addSeconds({signer: starlyAccount, seconds: 12 * 3600, addressMap}));
        const [txResult3] = await shallPass(claimStarlyCards({signer: aliceAccount, ids: [0], addressMap}));
        expectEvent("StarlyToken.TokensDeposited", txResult3, {
            amount: "0.00038282",
            to: aliceAccount,
        });
        expectEvent("StarlyCardStakingClaims.ClaimPaid", txResult3, {
            amount: "0.00038282",
            to: aliceAccount,
            paidStakeIDs: [0],
        });

        await shallPass(addSeconds({signer: starlyAccount, seconds: 12 * 3600, addressMap}));
        const [txResult4] = await shallPass(claimStarlyCards({signer: aliceAccount, ids: [0], addressMap}));
        expectEvent("StarlyToken.TokensDeposited", txResult4, {
            amount: "2.00114836",
            to: aliceAccount,
        });
        expectEvent("StarlyCardStakingClaims.ClaimPaid", txResult4, {
            amount: "2.00114836",
            to: aliceAccount,
            paidStakeIDs: [0],
        });
    });

    test("Stake 1 card (2500) for 1 day, 1000 tokens staked = daily limit of 10.0", async () => {
        await shallPass(stakeStarlyTokens({signer: aliceAccount, amount: 1000, addressMap}));
        await shallPass(stakeStarlyCards({signer: aliceAccount, ids: [0], addressMap}));
        await shallPass(addSeconds({signer: starlyAccount, seconds: 24 * 3600, addressMap}));
        const [txResult] = await shallPass(claimStarlyCards({signer: aliceAccount, ids: [0], addressMap}));

        expectEvent("StarlyToken.TokensDeposited", txResult, {
            amount: "6.84476751",
            to: aliceAccount,
        });

        expectEvent("StarlyCardStakingClaims.ClaimPaid", txResult, {
            amount: "6.84476751",
            to: aliceAccount,
            paidStakeIDs: [0],
        });
    });

    test("Stake 4 cards (4875) for 1 day, 1000 tokens staked = daily limit of 10.0", async () => {
        await shallPass(stakeStarlyTokens({signer: aliceAccount, amount: 1000, addressMap}));
        await shallPass(stakeStarlyCards({signer: aliceAccount, ids: [0, 1, 2, 3], addressMap}));
        await shallPass(addSeconds({signer: starlyAccount, seconds: 24 * 3600, addressMap}));
        const [txResult] = await shallPass(claimStarlyCards({signer: aliceAccount, ids: [0, 1, 2, 3], addressMap}));
        expectEvent("StarlyToken.TokensDeposited", txResult, {
            amount: "10.00382710",
            to: aliceAccount,
        });
        expectEvent("StarlyCardStakingClaims.ClaimPaid", txResult, {
            amount: "10.00382710",
            to: aliceAccount,
            paidStakeIDs: [0, 1],
        });
    });

    test("Stake 4 cards (4875) for 1 day, 10000 tokens staked = daily limit of 100.0", async () => {
        await shallPass(stakeStarlyTokens({signer: aliceAccount, amount: 10000, addressMap}));
        await shallPass(stakeStarlyCards({signer: aliceAccount, ids: [0, 1, 2, 3], addressMap}));
        await shallPass(addSeconds({signer: starlyAccount, seconds: 24 * 3600, addressMap}));
        const [txResult] = await shallPass(claimStarlyCards({signer: aliceAccount, ids: [0, 1, 2, 3], addressMap}));

        expectEvent("StarlyToken.TokensDeposited", txResult, {
            amount: "13.34729663",
            to: aliceAccount,
        });

        expectEvent("StarlyCardStakingClaims.ClaimPaid", txResult, {
            amount: "13.34729663",
            to: aliceAccount,
            paidStakeIDs: [0, 1, 2, 3],
        });
    });

    test("Stake and unstake 4 cards", async () => {
        expect(await getStarlyCardCount(aliceAccount, addressMap)).toBe(5);
        expect(await getStakedStarlyCardCount(aliceAccount, addressMap)).toBe(0);
        expect(await getCollectorScoreSum(aliceAccount, addressMap)).toBe("4879.00000000");

        await shallPass(stakeStarlyCards({signer: aliceAccount, ids: [0, 1, 2, 3], addressMap}));
        expect(await getStarlyCardCount(aliceAccount, addressMap)).toBe(1);
        expect(await getStakedStarlyCardCount(aliceAccount, addressMap)).toBe(4);
        expect(await getCollectorScoreSum(aliceAccount, addressMap)).toBe("4879.00000000");

        await shallPass(addSeconds({signer: starlyAccount, seconds: 24 * 3600, addressMap}));
        await shallPass(unstakeStarlyCards({signer: aliceAccount, ids: [0, 1], addressMap}));
        expect(await getStarlyCardCount(aliceAccount, addressMap)).toBe(3);
        expect(await getStakedStarlyCardCount(aliceAccount, addressMap)).toBe(2);
        expect(await getCollectorScoreSum(aliceAccount, addressMap)).toBe("4879.00000000");

        await shallPass(unstakeStarlyCards({signer: aliceAccount, ids: [2, 3], addressMap}));
        expect(await getStarlyCardCount(aliceAccount, addressMap)).toBe(5);
        expect(await getStakedStarlyCardCount(aliceAccount, addressMap)).toBe(0);
        expect(await getCollectorScoreSum(aliceAccount, addressMap)).toBe("4879.00000000");
    });

    test("Reaching daily claim limit, increase with staking", async () => {
        await shallPass(stakeStarlyCards({signer: aliceAccount, ids: [0], addressMap}));
        await shallPass(addSeconds({signer: starlyAccount, seconds: 24 * 3600, addressMap}));

        const [txResult] = await shallPass(claimStarlyCards({signer: aliceAccount, ids: [0], addressMap}));
        expectNoEvent("StarlyToken.TokensDeposited", txResult);
        expectNoEvent("StarlyCardStakingClaims.ClaimPaid", txResult)

        await shallPass(stakeStarlyTokens({signer: aliceAccount, amount: 200, addressMap}));
        const [txResult2] = await shallPass(claimStarlyCards({signer: aliceAccount, ids: [0], addressMap}));
        expectEvent("StarlyToken.TokensDeposited", txResult2, {
            amount: "2.00000000",
            to: aliceAccount,
        });
        expectEvent("StarlyCardStakingClaims.ClaimPaid", txResult2, {
            amount: "2.00000000",
            to: aliceAccount,
            paidStakeIDs: [0],
        });

        const [txResult3] = await shallPass(claimStarlyCards({signer: aliceAccount, ids: [0], addressMap}));
        expectNoEvent("StarlyToken.TokensDeposited", txResult3);
        expectNoEvent("StarlyCardStakingClaims.ClaimPaid", txResult3)

        await shallPass(stakeStarlyTokens({signer: aliceAccount, amount: 1000, addressMap}));
        const [txResult4] = await shallPass(claimStarlyCards({signer: aliceAccount, ids: [0], addressMap}));
        expectEvent("StarlyToken.TokensDeposited", txResult4, {
            amount: "4.84476751",
            to: aliceAccount,
        });
        expectEvent("StarlyCardStakingClaims.ClaimPaid", txResult4, {
            amount: "4.84476751",
            to: aliceAccount,
            paidStakeIDs: [0],
        });
    });

    test("No double claim if there are few expired claims", async () => {
        await shallPass(stakeStarlyTokens({signer: aliceAccount, amount: 1000, addressMap}));
        await shallPass(stakeStarlyCards({signer: aliceAccount, ids: [0, 1], addressMap}));
        await shallPass(addSeconds({signer: starlyAccount, seconds: 24 * 3600, addressMap}));

        const [txResult1] = await shallPass(claimStarlyCards({signer: aliceAccount, ids: [0, 1], addressMap}));
        expectEvent("StarlyCardStakingClaims.ClaimPaid", txResult1, {
            amount: "10.00382710",
            to: aliceAccount,
            paidStakeIDs: [0, 1],
        });

        await shallPass(addSeconds({signer: starlyAccount, seconds: 4 * 24 * 3600, addressMap}));
        const [txResult2] = await shallPass(claimStarlyCards({signer: aliceAccount, ids: [0, 1], addressMap}));
        expectEvent("StarlyCardStakingClaims.ClaimPaid", txResult2, {
            amount: "10.01915090",
            to: aliceAccount,
            paidStakeIDs: [0],
        });
    });

    test("Stake 1 card (4) for a year, stake 1000 and claim all resource", async () => {
        await shallPass(stakeStarlyTokens({signer: aliceAccount, amount: 1000, addressMap}));
        await shallPass(stakeStarlyCards({signer: aliceAccount, ids: [4], addressMap}));
        await shallPass(addSeconds({signer: starlyAccount, seconds: 365.5 * 24 * 3600, addressMap}));

        const [txResult] = await shallPass(claimStarlyCards({signer: aliceAccount, ids: [0], addressMap}));
        expectEvent("StarlyToken.TokensDeposited", txResult, {
            amount: "4.00000000",
            to: aliceAccount,
        });
        expectEvent("StarlyCardStakingClaims.ClaimPaid", txResult, {
            amount: "4.00000000",
            to: aliceAccount,
            paidStakeIDs: [0],
        });

        await shallPass(addSeconds({signer: starlyAccount, seconds: 365.5 * 24 * 3600, addressMap}));
        const [txResult2] = await shallPass(claimStarlyCards({signer: aliceAccount, ids: [0], addressMap}));
        expectNoEvent("StarlyToken.TokensDeposited", txResult2);
        expectNoEvent("StarlyCardStakingClaims.ClaimPaid", txResult2)
    });

    test("Stake and claim used card", async () => {
        await shallPass(stakeStarlyTokens({signer: aliceAccount, amount: 1000, addressMap}));
        await shallPass(stakeStarlyCards({signer: aliceAccount, ids: [4], addressMap}));
        await shallPass(addSeconds({signer: starlyAccount, seconds: 365.5 * 24 * 3600 / 2, addressMap}));

        const [txResult] = await shallPass(claimStarlyCards({signer: aliceAccount, ids: [0], addressMap}));
        expectEvent("StarlyToken.TokensDeposited", txResult, {
            amount: "2.00141002",
            to: aliceAccount,
        });
        expectEvent("StarlyCardStakingClaims.ClaimPaid", txResult, {
            amount: "2.00141002",
            to: aliceAccount,
            paidStakeIDs: [0],
        });

        await shallPass(unstakeStarlyCards({signer: aliceAccount, ids: [0], addressMap}));
        await shallPass(stakeStarlyCards({signer: aliceAccount, ids: [4], addressMap}));
        await shallPass(addSeconds({signer: starlyAccount, seconds: 365.5 * 24 * 3600 / 2, addressMap}));
        const [txResult2] = await shallPass(claimStarlyCards({signer: aliceAccount, ids: [1], addressMap}));
        expectEvent("StarlyToken.TokensDeposited", txResult2, {
            amount: "1.99858998",
            to: aliceAccount,
        });
        expectEvent("StarlyCardStakingClaims.ClaimPaid", txResult2, {
            amount: "1.99858998",
            to: aliceAccount,
            paidStakeIDs: [1],
        });
    });

    test("Admin: enable/disable staking", async () => {
        await shallPass(disableStaking({signer: starlyCardStakingAccount, ids: [0], addressMap}));
        await shallThrow(stakeStarlyCards({signer: aliceAccount, ids: [0], addressMap}));
        await shallPass(enableStaking({signer: starlyCardStakingAccount, ids: [0], addressMap}));
        await shallPass(stakeStarlyCards({signer: aliceAccount, ids: [0], addressMap}));
    });

    test("Admin: enable/disable unstaking", async () => {
        await shallPass(stakeStarlyCards({signer: aliceAccount, ids: [0], addressMap}));
        await shallPass(addSeconds({signer: starlyAccount, seconds: 24 * 3600, addressMap}));
        await shallPass(disableUnstaking({signer: starlyCardStakingAccount, ids: [0], addressMap}));
        await shallThrow(unstakeStarlyCards({signer: aliceAccount, ids: [0], addressMap}));
        await shallPass(enableUnstaking({signer: starlyCardStakingAccount, ids: [0], addressMap}));
        await shallPass(unstakeStarlyCards({signer: aliceAccount, ids: [0], addressMap}));
    });

    test("Admin: enable/disable claiming", async () => {
        await shallPass(stakeStarlyCards({signer: aliceAccount, ids: [0], addressMap}));
        await shallPass(addSeconds({signer: starlyAccount, seconds: 24 * 3600, addressMap}));
        await shallPass(disableClaiming({signer: starlyCardStakingAccount, ids: [0], addressMap}));
        await shallThrow(claimStarlyCards({signer: aliceAccount, ids: [0], addressMap}));
        await shallPass(enableClaiming({signer: starlyCardStakingAccount, ids: [0], addressMap}));
        await shallPass(claimStarlyCards({signer: aliceAccount, ids: [0], addressMap}));
    });

    test("Tricky case: stake and claim in the same transaction", async () => {
        await shallPass(addSeconds({signer: starlyAccount, seconds: 24 * 3600, addressMap}));
        await shallPass(stakeStarlyCards({signer: aliceAccount, ids: [0], addressMap}));
        const [txResult] = await shallPass(claimStarlyCards({signer: aliceAccount, ids: [0], addressMap}));
        expectNoEvent("StarlyToken.TokensDeposited", txResult);
        expectNoEvent("StarlyCardStakingClaims.ClaimPaid", txResult)
    });

    test("Tricky case: stake and unstake in the same transaction", async () => {
        await shallPass(addSeconds({signer: starlyAccount, seconds: 24 * 3600, addressMap}));
        await shallPass(stakeStarlyCards({signer: aliceAccount, ids: [0], addressMap}));
        await shallThrow(unstakeStarlyCards({signer: aliceAccount, ids: [0], addressMap}));
    });

    test("Tricky case: tamper nft", async () => {
        // TODO
    });

    test("Tricky case: burn stake", async () => {
        await shallPass(stakeStarlyCards({signer: aliceAccount, ids: [0], addressMap}));
        expect(await getStarlyCardCount(aliceAccount, addressMap)).toBe(4);
        let [burnResult] = await shallPass(burnStarlyCardStake({signer: aliceAccount, addressMap}))
        expectEvent("StakedStarlyCard.StakeBurned", burnResult, {
            id: 0,
            starlyID: "collectionA/1/1",
        })
        expect(await getStarlyCardCount(aliceAccount, addressMap)).toBe(5);
    });

    test("Tricky case: burn stake collection", async () => {
        await shallPass(stakeStarlyCards({signer: aliceAccount, ids: [0, 1], addressMap}));
        expect(await getStarlyCardCount(aliceAccount, addressMap)).toBe(3);
        let [burnResult] = await shallPass(burnStarlyCardStakeCollection({signer: aliceAccount, addressMap}))
        expectEvent("StakedStarlyCard.StakeBurned", burnResult, {
            id: 0,
            starlyID: "collectionA/1/1",
        })
        expectEvent("StakedStarlyCard.StakeBurned", burnResult, {
            id: 1,
            starlyID: "collectionA/1/2",
        })
        expect(await getStarlyCardCount(aliceAccount, addressMap)).toBe(5);
    });
})

function tx(filename, args, signer, addressMap) {
    return sendTransaction({
        code: insertTestingUtilitiesCode(getTemplate(filename, addressMap), addressMap),
        args: args,
        signers: [signer],
        limit: 9999,
    });
}

function setupStarlyTokenVault({signer, addressMap}) {
    return tx("../transactions/starlyToken/setup_account.cdc", [], signer, addressMap);
}

function setupStarlyCardCollection({signer, addressMap}) {
    return tx("../transactions/starlyCard/setup_account.cdc", [], signer, addressMap);
}

function setupStarlyCardMarketCollection({signer, addressMap}) {
    return tx("../transactions/starlyCardMarket/setup_account.cdc", [], signer, addressMap);
}

function setupStarlyTokenStakingCollection({signer, addressMap}) {
    return tx("../transactions/starlyTokenStaking/setup_account.cdc", [], signer, addressMap);
}

function setupStakedStarlyCardCollection({signer, addressMap}) {
    return tx("../transactions/starlyCardStaking/setup_account.cdc", [], signer, addressMap);
}

function transferStarlyTokens({to, from, amount, addressMap}) {
    return tx("../transactions/starlyToken/transfer.cdc", [amount, to], from, addressMap);
}

function setupCardStakingEditorProxy({signer, addressMap}) {
    return tx("../transactions/starlyCardStaking/editor/setup_editor_proxy.cdc", [], signer, addressMap);
}

function depositCardStakingEditorCapability({signer, to, addressMap}) {
    return tx("../transactions/starlyCardStaking/admin/deposit_editor_capability.cdc", [to], signer, addressMap);
}

function addCollectorScoreDefaultConfig({signer, to, addressMap}) {
    return tx("../transactions/starlyCollectorScore/add_default_config.cdc", [], signer, addressMap);
}

function addMetadata({signer, collectionID, addressMap}) {
    return tx("../transactions/starlyMetadata/add_collection_test_metadata.cdc", [collectionID], signer, addressMap);
}

function mintStarlyCard({signer, to, starlyID, addressMap}) {
    return tx("../transactions/starlyCard/mint_starly_card.cdc", [to, starlyID], signer, addressMap);
}

function stakeStarlyTokens({signer, amount, addressMap}) {
    return tx("../transactions/starlyTokenStaking/stake.cdc", [amount], signer, addressMap);
}

function stakeStarlyCards({signer, ids, addressMap}) {
    return tx("../transactions/starlyCardStaking/stake.cdc", [ids], signer, addressMap);
}

function claimStarlyCards({signer, ids, addressMap}) {
    return tx("../transactions/starlyCardStaking/claim.cdc", [ids], signer, addressMap);
}

function unstakeStarlyCards({signer, ids, addressMap}) {
    return tx("../transactions/starlyCardStaking/unstake.cdc", [ids], signer, addressMap);
}

function burnStarlyCardStake({signer, k, addressMap}) {
    return tx("../transactions/starlyCardStaking/burn_stake.cdc", [], signer, addressMap);
}

function burnStarlyCardStakeCollection({signer, k, addressMap}) {
    return tx("../transactions/starlyCardStaking/burn_stake_collection.cdc", [], signer, addressMap);
}

function enableClaiming({signer, addressMap}) {
    return tx("../transactions/starlyCardStaking/admin/enable_claiming.cdc", [], signer, addressMap);
}

function disableClaiming({signer, addressMap}) {
    return tx("../transactions/starlyCardStaking/admin/disable_claiming.cdc", [], signer, addressMap);
}

function enableStaking({signer, addressMap}) {
    return tx("../transactions/starlyCardStaking/admin/enable_staking.cdc", [], signer, addressMap);
}

function disableStaking({signer, addressMap}) {
    return tx("../transactions/starlyCardStaking/admin/disable_staking.cdc", [], signer, addressMap);
}

function enableUnstaking({signer, addressMap}) {
    return tx("../transactions/starlyCardStaking/admin/enable_unstaking.cdc", [], signer, addressMap);
}

function disableUnstaking({signer, addressMap}) {
    return tx("../transactions/starlyCardStaking/admin/disable_unstaking.cdc", [], signer, addressMap);
}

async function script(filename, args, addressMap) {
    const code = getTemplate(filename, addressMap);
    const [result] = await executeScript({code, args});
    return result;
}

async function getStarlyTokenBalance(account, addressMap) {
    return await script("../scripts/starlyToken/read_balance.cdc", [account], addressMap)
}

async function getStarlyCardCount(account, addressMap) {
    return await script("../scripts/starlyCard/read_collection_length.cdc", [account], addressMap)
}

async function getStakedStarlyCardCount(account, addressMap) {
    return await script("../scripts/starlyCardStaking/read_collection_length.cdc", [account], addressMap)
}

async function getCollectorScoreSum(account, addressMap) {
    return await script("../scripts/starlyCard/sum_starly_collector_scores.cdc", [account], addressMap)
}
