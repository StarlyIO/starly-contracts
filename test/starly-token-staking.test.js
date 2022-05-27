import path from "path";
import {
    deployContract,
    deployContractByName,
    emulator,
    executeScript,
    getAccountAddress,
    getTemplate,
    init,
    sendTransaction,
    shallPass,
    shallThrow,
} from "flow-js-testing";
import {expectEvent} from "./util";

// Increase timeout if your tests failing due to timeout
jest.setTimeout(10000);

describe("StarlyTokenStaking contract tests", () => {
    beforeEach(async () => {
        const basePath = path.resolve(__dirname, "..");
        // You can specify different port to parallelize execution of describe blocks
        const port = 8080;
        // Setting logging flag to true will pipe emulator output to console
        const logging = false;

        await init(basePath, {port});
        return emulator.start(port, logging);
    });

    var nftAccount;
    var tokenAccount;
    var stakingAccount;
    var aliceAccount;
    var addressMap;

    beforeEach(async () => {
        nftAccount = await getAccountAddress("NonFungibleToken");
        tokenAccount = await getAccountAddress("Token");
        stakingAccount = await getAccountAddress("Staking");
        aliceAccount = await getAccountAddress("Alice");
        addressMap = {
            "NonFungibleToken": nftAccount,
            "MetadataViews": nftAccount,
            "StarlyToken": tokenAccount,
            "CompoundInterest": stakingAccount,
            "StarlyTokenStaking": stakingAccount,
            "TestingUtilities": stakingAccount,
        };
        await shallPass(deployContractByName({to: nftAccount, name: "NonFungibleToken", addressMap}));
        await shallPass(deployContractByName({to: nftAccount, name: "MetadataViews", addressMap}));
        await shallPass(deployContractByName({to: tokenAccount, name: "StarlyToken", addressMap}));
        await shallPass(deployContractByName({to: stakingAccount, name: "CompoundInterest", addressMap}));
        await shallPass(deployContractByName({to: stakingAccount, name: "TestingUtilities", addressMap}));
        await shallPass(deployContractWithTestingUtils({to: stakingAccount, name: "StarlyTokenStaking", addressMap}));

        await shallPass(setupStarlyTokenVault({signer: stakingAccount, addressMap}));
        await shallPass(setupStarlyTokenVault({signer: aliceAccount, addressMap}));
        await shallPass(transferStarlyTokens({to: stakingAccount, from: tokenAccount, amount: 1000, addressMap}));
        await shallPass(transferStarlyTokens({to: aliceAccount, from: tokenAccount, amount: 1000, addressMap}));
        await shallPass(setupStakingCollection({signer: aliceAccount, addressMap}));
        expect(await getStarlyTokenBalance(stakingAccount, addressMap)).toBe("1000.00000000")
        expect(await getStarlyTokenBalance(aliceAccount, addressMap)).toBe("1000.00000000")
    })

    // Stop emulator, so it could be restarted
    afterEach(async () => {
        return emulator.stop();
    });

    test("Stake and unstake", async () => {
        let [stakeResult] = await shallPass(stake({signer: aliceAccount, amount: 100, addressMap}))
        expectEvent("StarlyTokenStaking.TokensStaked", stakeResult, {
            id: 0,
            address: aliceAccount,
            k: "0.01923438",
            principal: "100.00000000",
            stakeTimestamp: "0.00000000",
            minStakingSeconds: "0.00000000",
        })
        await shallPass(addSeconds({signer: stakingAccount, seconds: 3600, addressMap}))
        expect(await getTotalPrincipalStaked(addressMap)).toBe("100.00000000")
        let [unstakeResult] = await shallPass(unstake({signer: aliceAccount, id: 0, addressMap}))
        expectEvent("StarlyTokenStaking.TokensUnstaked", unstakeResult, {
            id: 0,
            address: aliceAccount,
            amount: "100.00159400",
            interest: "0.00159400",
            k: "0.01923438",
            principal: "100.00000000",
            stakeTimestamp: "0.00000000",
            unstakeTimestamp: "3600.00000000",
            unstakingFees: "0.00000000",
        })
        expect(await getStarlyTokenBalance(stakingAccount, addressMap)).toBe("999.99840600")
        expect(await getStarlyTokenBalance(aliceAccount, addressMap)).toBe("1000.00159400")
        expect(await getTotalPrincipalStaked(addressMap)).toBe("0.00000000")
        expect(await getTotalInterestPaid(addressMap)).toBe("0.00159400")
    });

    test("Stake multiple times and unstake all", async () => {
        await shallPass(stake({signer: aliceAccount, amount: 100, addressMap}))
        await shallPass(addSeconds({signer: stakingAccount, seconds: 3600, addressMap}))
        let [stake2Result] = await shallPass(stake({signer: aliceAccount, amount: 100, addressMap}))
        expectEvent("StarlyTokenStaking.TokensStaked", stake2Result, {
            id: 1,
            address: aliceAccount,
            k: "0.01923438",
            principal: "100.00000000",
            stakeTimestamp: "3600.00000000",
        })
        await shallPass(addSeconds({signer: stakingAccount, seconds: 3600, addressMap}))
        expect(await getTotalPrincipalStaked(addressMap)).toBe("200.00000000")
        let [unstakeAllResult] = await shallPass(unstakeAll({signer: aliceAccount, addressMap}))
        expectEvent("StarlyTokenStaking.TokensUnstaked", unstakeAllResult, {
            id: 0,
            address: aliceAccount,
            amount: "100.00318700",
            interest: "0.00318700",
            k: "0.01923438",
            principal: "100.00000000",
            stakeTimestamp: "0.00000000",
            unstakeTimestamp: "7200.00000000",
            unstakingFees: "0.00000000",
        })
        expectEvent("StarlyTokenStaking.TokensUnstaked", unstakeAllResult, {
            id: 1,
            address: aliceAccount,
            amount: "100.00159400",
            interest: "0.00159400",
            k: "0.01923438",
            principal: "100.00000000",
            stakeTimestamp: "3600.00000000",
            unstakeTimestamp: "7200.00000000",
            unstakingFees: "0.00000000",
        })
        expect(await getStarlyTokenBalance(stakingAccount, addressMap)).toBe("999.99521900")
        expect(await getStarlyTokenBalance(aliceAccount, addressMap)).toBe("1000.00478100")
        expect(await getTotalPrincipalStaked(addressMap)).toBe("0.00000000")
        expect(await getTotalInterestPaid(addressMap)).toBe("0.00478100")
    });

    test("Unstaking fees (unstakingFee, unstakingFlatFee, unstakingFeesNotAppliedAfterSeconds)", async () => {
        await shallPass(setUnstakingFees({
            signer: stakingAccount,
            unstakingFee: 0.01,
            unstakingFlatFee: 0.01,
            unstakingFeesNotAppliedAfterSeconds: 3600,
            addressMap}))
        await shallPass(stake({signer: aliceAccount, amount: 100, addressMap}))
        await shallPass(addSeconds({signer: stakingAccount, seconds: 3599, addressMap}))
        let [unstake1Result] = await shallPass(unstake({signer: aliceAccount, id: 0, addressMap}))
        expectEvent("StarlyTokenStaking.TokensUnstaked", unstake1Result, {
            id: 0,
            address: aliceAccount,
            amount: "98.99157806",
            interest: "0.00159400",
            k: "0.01923438",
            principal: "100.00000000",
            stakeTimestamp: "0.00000000",
            unstakeTimestamp: "3599.00000000",
            unstakingFees: "1.01001594",
        })
        await shallPass(stake({signer: aliceAccount, amount: 100, addressMap}))
        await shallPass(addSeconds({signer: stakingAccount, seconds: 3600, addressMap}))
        let [unstake2Result] = await shallPass(unstake({signer: aliceAccount, id: 1, addressMap}))
        expectEvent("StarlyTokenStaking.TokensUnstaked", unstake2Result, {
            id: 1,
            address: aliceAccount,
            amount: "100.00159400",
            interest: "0.00159400",
            k: "0.01923438",
            principal: "100.00000000",
            stakeTimestamp: "3599.00000000",
            unstakeTimestamp: "7199.00000000",
            unstakingFees: "0.00000000",
        })
        expect(await getStarlyTokenBalance(stakingAccount, addressMap)).toBe("1001.00682794")
        expect(await getStarlyTokenBalance(aliceAccount, addressMap)).toBe("998.99317206")
        expect(await getTotalPrincipalStaked(addressMap)).toBe("0.00000000")
        expect(await getTotalInterestPaid(addressMap)).toBe("0.00159400")
    })

    test("Metadata (Display)", async () => {
        await shallPass(stake({signer: aliceAccount, amount: 100, addressMap}))
        let display = await getMetadataDisplay(aliceAccount, 0, addressMap)
        expect(display.name).toBe("StarlyToken stake #0")
        expect(display.description).toBe("id: 0, principal: 100.00000000, k: 0.01923438, stakeTimestamp: 0, minStakingSeconds: 0")
        expect(display.thumbnail.url).toBe("")
    });

    test("Metadata (StakeMetadataView)", async () => {
        await shallPass(setUnstakingFees({
            signer: stakingAccount,
            unstakingFee: 0.01,
            unstakingFlatFee: 0.01,
            unstakingFeesNotAppliedAfterSeconds: 3600,
            addressMap}))
        await shallPass(addSeconds({signer: stakingAccount, seconds: 1000, addressMap}))
        await shallPass(stake({signer: aliceAccount, amount: 100, addressMap}))
        let metadata = await getMetadata(aliceAccount, 0, addressMap)
        expect(metadata.id).toBe(0)
        expect(metadata.principal).toBe("100.00000000")
        expect(metadata.stakeTimestamp).toBe('1000.00000000')
        expect(metadata.minStakingSeconds).toBe('0.00000000')
        expect(metadata.k).toBe('0.01923438')
        expect(metadata.accumulatedAmount).toBe('100.00000000')
        expect(metadata.canUnstake).toBe(false)
        expect(metadata.unstakingFees).toBe("1.01000000")
    });

    test("Admin sets custom k", async () => {
        await shallPass(stake({signer: aliceAccount, amount: 100, addressMap}))
        await shallThrow(setStakingK({signer: stakingAccount, k: 1.923438, addressMap}))
        await shallThrow(setStakingK({signer: stakingAccount, k: 0.41899461, addressMap}))
        await shallPass(setStakingK({signer: stakingAccount, k: 0.15119371, addressMap}))
        await shallPass(setStakingK({signer: stakingAccount, k: 0.09539261, addressMap}))
        let [stake2Result] = await shallPass(stake({signer: aliceAccount, amount: 100, addressMap}))
        expectEvent("StarlyTokenStaking.TokensStaked", stake2Result, {
            id: 1,
            address: aliceAccount,
            k: "0.09539261",
            principal: "100.00000000",
            stakeTimestamp: "0.00000000",
        })
    });

    test("Admin sets min stake principal amount", async () => {
        await shallThrow(stake({signer: aliceAccount, amount: 0, addressMap}))
        await shallPass(stake({signer: aliceAccount, amount: 100, addressMap}))
        await shallPass(setMinStakePrincipalAmount({signer: stakingAccount, amount: 500, addressMap}))
        await shallThrow(stake({signer: aliceAccount, amount: 100, addressMap}))
        await shallPass(stake({signer: aliceAccount, amount: 500, addressMap}))
    });

    test("Admin sets unstaking disabled until timestamp", async () => {
        await shallPass(setUnstakingDisabledUntilTime({signer: stakingAccount, timestamp: 86400, addressMap}))
        await shallPass(stake({signer: aliceAccount, amount: 100, addressMap}))
        await shallPass(addSeconds({signer: stakingAccount, seconds: 3600, addressMap}))
        await shallPass(stake({signer: aliceAccount, amount: 100, addressMap}))
        await shallPass(addSeconds({signer: stakingAccount, seconds: 3600, addressMap}))
        await shallThrow(unstake({signer: aliceAccount, id: 0, addressMap}))
        await shallThrow(unstake({signer: aliceAccount, id: 1, addressMap}))
        await shallPass(addSeconds({signer: stakingAccount, seconds: 3600, addressMap}))
        await shallThrow(unstake({signer: aliceAccount, id: 0, addressMap}))
        await shallThrow(unstake({signer: aliceAccount, id: 1, addressMap}))
        await shallPass(addSeconds({signer: stakingAccount, seconds: 86400 - 3*3600, addressMap}))
        await shallPass(unstake({signer: aliceAccount, id: 0, addressMap}))
        await shallPass(unstake({signer: aliceAccount, id: 1, addressMap}))
    });

    test("Admin enables/disables staking/unstaking", async () => {
        await shallPass(disableStaking({signer: stakingAccount, addressMap}))
        await shallThrow(stake({signer: aliceAccount, amount: 100, addressMap}))
        await shallPass(enableStaking({signer: stakingAccount, addressMap}))
        await shallPass(stake({signer: aliceAccount, amount: 100, addressMap}))
        await shallPass(addSeconds({signer: stakingAccount, seconds: 1, addressMap}))
        await shallPass(disableUnstaking({signer: stakingAccount, addressMap}))
        await shallThrow(unstake({signer: aliceAccount, id: 0, addressMap}))
        await shallPass(enableUnstaking({signer: stakingAccount, addressMap}))
        await shallPass(unstake({signer: aliceAccount, id: 0, addressMap}))
    });

    test("Admin create custom stake", async () => {
        await shallThrow(createCustomStake({
            signer: stakingAccount,
            address: aliceAccount,
            amount: 100,
            k: 1.923438,
            minStakingSeconds: 3600.0,
            addressMap}))
        let [stakeResult] = await shallPass(createCustomStake({
            signer: stakingAccount,
            address: aliceAccount,
            amount: 100,
            k: 0.15119371,
            minStakingSeconds: 3600.0,
            addressMap}))
        expectEvent("StarlyTokenStaking.TokensStaked", stakeResult, {
            id: 0,
            address: aliceAccount,
            k: "0.15119371",
            principal: "100.00000000",
            stakeTimestamp: "0.00000000",
            minStakingSeconds: "3600.00000000",
        });
        await shallPass(addSeconds({signer: stakingAccount, seconds: 3599, addressMap}))
        await shallThrow(unstake({signer: aliceAccount, id: 0, addressMap}))
        await shallPass(addSeconds({signer: stakingAccount, seconds: 1, addressMap}))
        let [unstakeResult] = await shallPass(unstake({signer: aliceAccount, id: 0, addressMap}))
        expectEvent("StarlyTokenStaking.TokensUnstaked", unstakeResult, {
            id: 0,
            address: aliceAccount,
            amount: "100.01253200",
            interest: "0.01253200",
            k: "0.15119371",
            principal: "100.00000000",
            stakeTimestamp: "0.00000000",
            unstakeTimestamp: "3600.00000000",
            unstakingFees: "0.00000000",
        })
        expect(await getStarlyTokenBalance(stakingAccount, addressMap)).toBe("899.98746800")
        expect(await getStarlyTokenBalance(aliceAccount, addressMap)).toBe("1100.01253200")
        expect(await getTotalPrincipalStaked(addressMap)).toBe("0.00000000")
        expect(await getTotalInterestPaid(addressMap)).toBe("0.01253200")
    });

    test("Admin refund", async () => {
        await shallPass(stake({signer: aliceAccount, amount: 100, addressMap}))
        await shallPass(addSeconds({signer: stakingAccount, seconds: 3600, addressMap}))
        let [refundResult] = await shallPass(refund({signer: stakingAccount, address: aliceAccount, id: 0, addressMap}))
        expectEvent("StarlyTokenStaking.TokensUnstaked", refundResult, {
            id: 0,
            address: aliceAccount,
            amount: "100.00159400",
            interest: "0.00159400",
            k: "0.01923438",
            principal: "100.00000000",
            stakeTimestamp: "0.00000000",
            unstakeTimestamp: "3600.00000000",
            unstakingFees: "0.00000000",
        })
        expect(await getStarlyTokenBalance(stakingAccount, addressMap)).toBe("999.99840600")
        expect(await getStarlyTokenBalance(aliceAccount, addressMap)).toBe("1000.00159400")
        expect(await getTotalPrincipalStaked(addressMap)).toBe("0.00000000")
        expect(await getTotalInterestPaid(addressMap)).toBe("0.00159400")
    });

    test("Admin refund with custom k", async () => {
        await shallPass(stake({signer: aliceAccount, amount: 100, addressMap}))
        await shallPass(addSeconds({signer: stakingAccount, seconds: 3600, addressMap}))
        let [refundResult] = await shallPass(refundCustomK({signer: stakingAccount, address: aliceAccount, id: 0, k: 0, addressMap}))
        expectEvent("StarlyTokenStaking.TokensUnstaked", refundResult, {
            id: 0,
            address: aliceAccount,
            amount: "100.00000000",
            interest: "0.00000000",
            k: "0.00000000",
            principal: "100.00000000",
            stakeTimestamp: "0.00000000",
            unstakeTimestamp: "3600.00000000",
            unstakingFees: "0.00000000",
        })
        expect(await getStarlyTokenBalance(stakingAccount, addressMap)).toBe("1000.00000000")
        expect(await getStarlyTokenBalance(aliceAccount, addressMap)).toBe("1000.00000000")
        expect(await getTotalPrincipalStaked(addressMap)).toBe("0.00000000")
        expect(await getTotalInterestPaid(addressMap)).toBe("0.00000000")
    });

    test("Tricky case: stake and unstake at the same time", async () => {
        await shallPass(stake({signer: aliceAccount, amount: 100, addressMap}))
        await shallThrow(unstake({signer: aliceAccount, id: 0, addressMap}))
    });

    test("Tricky case: try to tamper principal", async () => {
        await shallPass(stake({signer: aliceAccount, amount: 100, addressMap}))
        await shallThrow(tamperPrincipal({signer: aliceAccount, addressMap}))
    });

    test("Tricky case: burn stake", async () => {
        await shallPass(stake({signer: aliceAccount, amount: 100, addressMap}))
        expect(await getTotalPrincipalStaked(addressMap)).toBe("100.00000000")
        let [burnResult] = await shallPass(burnStake({signer: aliceAccount, addressMap}))
        expectEvent("StarlyToken.TokensBurned", burnResult, {
            amount: "100.00000000",
        })
        expect(await getTotalPrincipalStaked(addressMap)).toBe("0.00000000")
    });

    test("Tricky case: burn stake colleсtion", async () => {
        await shallPass(stake({signer: aliceAccount, amount: 100, addressMap}))
        await shallPass(stake({signer: aliceAccount, amount: 200, addressMap}))
        expect(await getTotalPrincipalStaked(addressMap)).toBe("300.00000000")
        let [burnResult] = await shallPass(burnStakeCollection({signer: aliceAccount, addressMap}))
        expectEvent("StarlyToken.TokensBurned", burnResult, {
            amount: "100.00000000",
        })
        expectEvent("StarlyToken.TokensBurned", burnResult, {
            amount: "200.00000000",
        })
        expect(await getTotalPrincipalStaked(addressMap)).toBe("0.00000000")
    });

    test("Tricky case: try tampering principal (depositing/withdrawing from vault inside a stake)", async () => {
        await shallPass(stake({signer: aliceAccount, amount: 100, addressMap}))
        await shallThrow(tamperPrincipal({signer: aliceAccount, addressMap}))
    });

    test("Tricky case: non-admin tries admin operations", async () => {
        await shallPass(stake({signer: aliceAccount, amount: 100, addressMap}))
        await shallThrow(setStakingK({signer: aliceAccount, k: 1.0, addressMap}))
        await shallThrow(refund({signer: aliceAccount, address: aliceAccount, id: 0, addressMap}))
        await shallThrow(refundCustomK({signer: aliceAccount, address: aliceAccount, id: 0, k: 50, addressMap}))
        await shallThrow(createCustomStake({
            signer: aliceAccount,
            address: aliceAccount,
            amount: 100,
            k: 1.0,
            minStakingSeconds: 3600.0,
            addressMap}))
        await shallThrow(enableStaking({signer: aliceAccount, addressMap}))
        await shallThrow(disableStaking({signer: aliceAccount, addressMap}))
        await shallThrow(enableUnstaking({signer: aliceAccount, addressMap}))
        await shallThrow(disableUnstaking({signer: aliceAccount, addressMap}))
        await shallThrow(setUnstakingFees({
            signer: aliceAccount,
            unstakingFee: 0.01,
            unstakingFlatFee: 0.01,
            unstakingFeesNotAppliedAfterSeconds: 3600,
            addressMap}))
        await shallThrow(setMinStakingSeconds({signer: aliceAccount, seconds: 3600, addressMap}))
        await shallThrow(setUnstakingDisabledUntilTime({signer: aliceAccount, timestamp: 86400, addressMap}))
    });
});

function insertTestingUtilitiesCode(code, addressMap) {
    let modifiedCode = code.replaceAll("getCurrentBlock().timestamp", "TestingUtilities.timestamp");
    if (code.includes("import TestingUtilities")) {
        return modifiedCode;
    }
    return "import TestingUtilities from " + addressMap["TestingUtilities"] + "\n" + modifiedCode;
}

async function deployContractWithTestingUtils({to, name, addressMap}) {
    const code = getTemplate(`../contracts/${name}.cdc`, addressMap)
    return await deployContract({ to, name, code: insertTestingUtilitiesCode(code, addressMap)})
}

function tx(filename, args, signer, addressMap) {
    return sendTransaction({
        code: insertTestingUtilitiesCode(getTemplate(filename, addressMap), addressMap),
        args: args,
        signers: [signer],
    });
}

function setupStarlyTokenVault({signer, addressMap}) {
    return tx("../transactions/starlyToken/setup_account.cdc", [], signer, addressMap);
}

function transferStarlyTokens({to, from, amount, addressMap}) {
    return tx("../transactions/starlyToken/transfer.cdc", [amount, to], from, addressMap);
}

function setupStakingCollection({signer, addressMap}) {
    return tx("../transactions/starlyTokenStaking/setup_account.cdc", [], signer, addressMap);
}

function enableStaking({signer, addressMap}) {
    return tx("../transactions/starlyTokenStaking/admin/enable_staking.cdc", [], signer, addressMap);
}

function disableStaking({signer, addressMap}) {
    return tx("../transactions/starlyTokenStaking/admin/disable_staking.cdc", [], signer, addressMap);
}

function enableUnstaking({signer, addressMap}) {
    return tx("../transactions/starlyTokenStaking/admin/enable_unstaking.cdc", [], signer, addressMap);
}

function disableUnstaking({signer, addressMap}) {
    return tx("../transactions/starlyTokenStaking/admin/disable_unstaking.cdc", [], signer, addressMap);
}

function setUnstakingFees({signer, unstakingFee, unstakingFlatFee, unstakingFeesNotAppliedAfterSeconds, addressMap}) {
    return tx("../transactions/starlyTokenStaking/admin/set_unstaking_fees.cdc", [
        unstakingFee,
        unstakingFlatFee,
        unstakingFeesNotAppliedAfterSeconds,
    ], signer, addressMap);
}

function createCustomStake({signer, address, amount, k, minStakingSeconds, addressMap}) {
    return tx("../transactions/starlyTokenStaking/admin/custom_stake.cdc", [
        address,
        amount,
        k,
        minStakingSeconds,
    ], signer, addressMap);
}

function refund({signer, address, id, addressMap}) {
    return tx("../transactions/starlyTokenStaking/admin/refund.cdc", [address, id], signer, addressMap);
}

function refundCustomK({signer, address, id, k, addressMap}) {
    return tx("../transactions/starlyTokenStaking/admin/refund_custom_k.cdc", [address, id, k], signer, addressMap);
}

function setMinStakingSeconds({signer, seconds, addressMap}) {
    return tx("../transactions/starlyTokenStaking/admin/set_min_staking_seconds.cdc", [seconds], signer, addressMap);
}

function setMinStakePrincipalAmount({signer, amount, addressMap}) {
    return tx("../transactions/starlyTokenStaking/admin/set_min_stake_principal.cdc", [amount], signer, addressMap);
}

function setUnstakingDisabledUntilTime({signer, timestamp, addressMap}) {
    return tx("../transactions/starlyTokenStaking/admin/set_unstaking_disabled_until_timestamp.cdc", [timestamp], signer, addressMap);
}

function stake({signer, amount, addressMap}) {
    return tx("../transactions/starlyTokenStaking/stake.cdc", [amount], signer, addressMap);
}

function unstake({signer, id, addressMap}) {
    return tx("../transactions/starlyTokenStaking/unstake.cdc", [id], signer, addressMap);
}

function unstakeAll({signer, addressMap}) {
    return tx("../transactions/starlyTokenStaking/unstake_all.cdc", [], signer, addressMap);
}

function addSeconds({signer, seconds, addressMap}) {
    return tx("../transactions/testing_add_seconds.cdc", [seconds], signer, addressMap);
}

function setStakingK({signer, k, addressMap}) {
    return tx("../transactions/starlyTokenStaking/admin/set_k.cdc", [k], signer, addressMap);
}

function tamperPrincipal({signer, k, addressMap}) {
    return tx("../transactions/starlyTokenStaking/tamper_principal.cdc", [], signer, addressMap);
}

function burnStake({signer, k, addressMap}) {
    return tx("../transactions/starlyTokenStaking/burn_stake.cdc", [], signer, addressMap);
}

function burnStakeCollection({signer, k, addressMap}) {
    return tx("../transactions/starlyTokenStaking/burn_stake_collection.cdc", [], signer, addressMap);
}

async function script(filename, args, addressMap) {
    const code = getTemplate(filename, addressMap);
    const [result] = await executeScript({code, args});
    return result;
}

async function getStarlyTokenBalance(account, addressMap) {
    return await script("../scripts/starlyToken/read_balance.cdc", [account], addressMap)
}

async function getTotalPrincipalStaked(addressMap) {
    return await script("../scripts/starlyTokenStaking/read_total_principal_staked.cdc", [], addressMap)
}

async function getTotalInterestPaid(addressMap) {
    return await script("../scripts/starlyTokenStaking/read_total_interest_paid.cdc", [], addressMap)
}

async function getMetadata(account, id, addressMap) {
    return await script("../scripts/starlyTokenStaking/read_metadata.cdc", [account, id], addressMap)
}

async function getMetadataDisplay(account, id, addressMap) {
    return await script("../scripts/starlyTokenStaking/read_metadata_display.cdc", [account, id], addressMap)
}
