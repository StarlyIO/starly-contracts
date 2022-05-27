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
import {expectEvent, expectNoEvent} from "./util";

// Increase timeout if your tests failing due to timeout
jest.setTimeout(10000);

describe("StarlyTokenVesting contract tests", () => {
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
    var vestingAccount;
    var aliceAccount;
    var addressMap;

    beforeEach(async () => {
        nftAccount = await getAccountAddress("NonFungibleToken");
        tokenAccount = await getAccountAddress("Token");
        vestingAccount = await getAccountAddress("Staking");
        aliceAccount = await getAccountAddress("Alice");
        addressMap = {
            "NonFungibleToken": nftAccount,
            "MetadataViews": nftAccount,
            "StarlyToken": tokenAccount,
            "CompoundInterest": vestingAccount,
            "StarlyTokenVesting": vestingAccount,
            "TestingUtilities": vestingAccount,
        };
        await shallPass(deployContractByName({to: nftAccount, name: "NonFungibleToken", addressMap}));
        await shallPass(deployContractByName({to: nftAccount, name: "MetadataViews", addressMap}));
        await shallPass(deployContractByName({to: tokenAccount, name: "StarlyToken", addressMap}));
        await shallPass(deployContractByName({to: vestingAccount, name: "CompoundInterest", addressMap}));
        await shallPass(deployContractByName({to: vestingAccount, name: "TestingUtilities", addressMap}));
        await shallPass(deployContractWithTestingUtils({to: vestingAccount, name: "StarlyTokenVesting", addressMap}));

        await shallPass(setupStarlyTokenVault({signer: vestingAccount, addressMap}));
        await shallPass(setupStarlyTokenVault({signer: aliceAccount, addressMap}));
        await shallPass(transferStarlyTokens({to: vestingAccount, from: tokenAccount, amount: 1000, addressMap}));
        await shallPass(transferStarlyTokens({to: aliceAccount, from: tokenAccount, amount: 1000, addressMap}));
        await shallPass(setupVestingCollection({signer: aliceAccount, addressMap}));
        expect(await getStarlyTokenBalance(vestingAccount, addressMap)).toBe("1000.00000000")
        expect(await getStarlyTokenBalance(aliceAccount, addressMap)).toBe("1000.00000000")
    })

    // Stop emulator, so it could be restarted
    afterEach(async () => {
        return emulator.stop();
    });

    test("Linear vesting release", async () => {
        let [vestingResult] = await shallPass(adminVestLinear({
            signer: vestingAccount,
            beneficiary: aliceAccount,
            amount: 100,
            durationSeconds: 600,
            addressMap}))
        expectEvent("StarlyTokenVesting.TokensVested", vestingResult, {
            id: 0,
            beneficiary: aliceAccount,
            amount: "100.00000000",
        })
        await shallPass(addSeconds({signer: vestingAccount, seconds: 600, addressMap}))
        expect(await getReleasableAmount(aliceAccount, 0, addressMap)).toBe("100.00000000")
        let [releaseResult] = await shallPass(release({signer: aliceAccount, id: 0, addressMap}))
        expectEvent("StarlyTokenVesting.TokensReleased", releaseResult, {
            id: 0,
            beneficiary: aliceAccount,
            amount: "100.00000000",
            remainingAmount: "0.00000000"
        })
        expect(await getStarlyTokenBalance(aliceAccount, addressMap)).toBe("1100.00000000")
    });

    test("Linear vesting partial releases", async () => {
        await adminVestLinear({
            signer: vestingAccount,
            beneficiary: aliceAccount,
            amount: 100,
            durationSeconds: 600,
            addressMap})
        expect(await getReleasableAmount(aliceAccount, 0, addressMap)).toBe("0.00000000")
        let [releaseResult1] = await shallPass(release({signer: aliceAccount, id: 0, addressMap}))
        expectEvent("StarlyTokenVesting.TokensReleased", releaseResult1, {
            id: 0,
            beneficiary: aliceAccount,
            amount: "0.00000000",
            remainingAmount: "100.00000000"
        })
        await shallPass(addSeconds({signer: vestingAccount, seconds: 300, addressMap}))
        expect(await getReleasableAmount(aliceAccount, 0, addressMap)).toBe("50.00000000")
        let [releaseResult2] = await shallPass(release({signer: aliceAccount, id: 0, addressMap}))
        expectEvent("StarlyTokenVesting.TokensReleased", releaseResult2, {
            id: 0,
            beneficiary: aliceAccount,
            amount: "50.00000000",
            remainingAmount: "50.00000000"
        })
        expect(await getStarlyTokenBalance(aliceAccount, addressMap)).toBe("1050.00000000")
    });

    test("Period vesting release", async () => {
        let [vestingResult] = await shallPass(adminVestPeriod({
            signer: vestingAccount,
            beneficiary: aliceAccount,
            amount: 100,
            tenPercentDuration: 60,
            addressMap}))
        expectEvent("StarlyTokenVesting.TokensVested", vestingResult, {
            id: 0,
            beneficiary: aliceAccount,
            amount: "100.00000000",
        })
        await shallPass(addSeconds({signer: vestingAccount, seconds: 600, addressMap}))
        expect(await getReleasableAmount(aliceAccount, 0, addressMap)).toBe("100.00000000")
        let [releaseResult] = await shallPass(release({signer: aliceAccount, id: 0, addressMap}))
        expectEvent("StarlyTokenVesting.TokensReleased", releaseResult, {
            id: 0,
            beneficiary: aliceAccount,
            amount: "100.00000000",
            remainingAmount: "0.00000000"
        })
        expect(await getStarlyTokenBalance(aliceAccount, addressMap)).toBe("1100.00000000")
    });

    test("Period vesting partial releases", async () => {
        await adminVestPeriod({
            signer: vestingAccount,
            beneficiary: aliceAccount,
            amount: 100,
            tenPercentDuration: 60,
            addressMap})
        expect(await getReleasableAmount(aliceAccount, 0, addressMap)).toBe("0.00000000")
        let [releaseResult1] = await shallPass(release({signer: aliceAccount, id: 0, addressMap}))
        expectEvent("StarlyTokenVesting.TokensReleased", releaseResult1, {
            id: 0,
            beneficiary: aliceAccount,
            amount: "0.00000000",
            remainingAmount: "100.00000000"
        })
        await shallPass(addSeconds({signer: vestingAccount, seconds: 60, addressMap}))
        expect(await getReleasableAmount(aliceAccount, 0, addressMap)).toBe("10.00000000")
        let [releaseResult2] = await shallPass(release({signer: aliceAccount, id: 0, addressMap}))
        expectEvent("StarlyTokenVesting.TokensReleased", releaseResult2, {
            id: 0,
            beneficiary: aliceAccount,
            amount: "10.00000000",
            remainingAmount: "90.00000000"
        })
        expect(await getStarlyTokenBalance(aliceAccount, addressMap)).toBe("1010.00000000")
    });

    test("Metadata (Display) for Linear vesting", async () => {
        await shallPass(adminVestLinear({
            signer: vestingAccount,
            beneficiary: aliceAccount,
            amount: 100,
            durationSeconds: 600,
            addressMap}))
        let display = await getMetadataDisplay(aliceAccount, 0, addressMap)
        expect(display.name).toBe("StarlyTokenVesting #0")
        expect(display.description).toBe(`id: 0, beneficiary: ${aliceAccount}, vestedAmount: 100.00000000, vestingSchedule: LinearVestingSchedule(startTimestamp: 0.00000000, endTimestamp: 600.00000000, releasePercent: 0.00000000)`)
        expect(display.thumbnail.url).toBe("")
    });

    test("Metadata (Display) for Period vesting", async () => {
        await shallPass(adminVestPeriod({
            signer: vestingAccount,
            beneficiary: aliceAccount,
            amount: 100,
            tenPercentDuration: 60,
            addressMap}))
        let display = await getMetadataDisplay(aliceAccount, 0, addressMap)
        expect(display.name).toBe("StarlyTokenVesting #0")
        expect(display.description).toBe(`id: 0, beneficiary: ${aliceAccount}, vestedAmount: 100.00000000, vestingSchedule: PeriodVestingSchedule(releasePercent: 0.00000000)`)
        expect(display.thumbnail.url).toBe("")
    });

    test("Metadata (VestingMetadataView) for Linear vesting", async () => {
        await shallPass(adminVestLinear({
            signer: vestingAccount,
            beneficiary: aliceAccount,
            amount: 100,
            durationSeconds: 600,
            addressMap}))
        await shallPass(addSeconds({signer: vestingAccount, seconds: 30, addressMap}))
        let metadata = await getMetadata(aliceAccount, 0, addressMap)
        expect(metadata.id).toBe(0)
        expect(metadata.beneficiary).toBe(aliceAccount)
        expect(metadata.initialVestedAmount).toBe('100.00000000')
        expect(metadata.remainingVestedAmount).toBe('100.00000000')
        expect(metadata.vestingType).toStrictEqual({ rawValue: 0 })
        expect(metadata.startTimestamp).toBe('0.00000000')
        expect(metadata.endTimestamp).toBe("600.00000000")
        expect(metadata.nextUnlock).toStrictEqual({ '30.00000000': '0.05000000' })
        expect(metadata.releasePercent).toBe("0.05000000")
        expect(metadata.releasableAmount).toBe("5.00000000")
    })

    test("Metadata (VestingMetadataView) for Period vesting", async () => {
        await shallPass(adminVestPeriod({
            signer: vestingAccount,
            beneficiary: aliceAccount,
            amount: 100,
            tenPercentDuration: 60,
            addressMap}))
        await shallPass(addSeconds({signer: vestingAccount, seconds: 130, addressMap}))
        let metadata = await getMetadata(aliceAccount, 0, addressMap)
        expect(metadata.id).toBe(0)
        expect(metadata.beneficiary).toBe(aliceAccount)
        expect(metadata.initialVestedAmount).toBe('100.00000000')
        expect(metadata.remainingVestedAmount).toBe('100.00000000')
        expect(metadata.vestingType).toStrictEqual({ rawValue: 1 })
        expect(metadata.startTimestamp).toBe('0.00000000')
        expect(metadata.endTimestamp).toBe("600.00000000")
        expect(metadata.nextUnlock).toStrictEqual({ '180.00000000': '0.30000000' })
        expect(metadata.releasePercent).toBe("0.20000000")
        expect(metadata.releasableAmount).toBe("20.00000000")
    });

    test("Tricky case: admin burns not-transferred vestings", async () => {
        await shallPass(setupVestingCollection({signer: vestingAccount, addressMap}));
        await shallPass(adminVestLinear({
            signer: vestingAccount,
            beneficiary: aliceAccount,
            amount: 100,
            durationSeconds: 600,
            addressMap}));
        await shallPass(transferVestings({
            to: vestingAccount,
            from: aliceAccount,
            vestingIds: [0],
            addressMap
        }))
        expect(await getStarlyTokenBalance(vestingAccount, addressMap)).toBe("900.00000000")
        let [burnResult] = await shallPass(adminBurnVesting({signer: vestingAccount, id: 0, addressMap}))
        expectEvent("StarlyTokenVesting.VestingBurned", burnResult, {
            id: 0,
            beneficiary: aliceAccount,
            amount: "100.00000000"
        })
        expectNoEvent("StarlyToken.TokensBurned", burnResult)
        expect(await getStarlyTokenBalance(vestingAccount, addressMap)).toBe("1000.00000000")
    });

    test("Tricky case: user burns vesting", async () => {
        await shallPass(adminVestLinear({
            signer: vestingAccount,
            beneficiary: aliceAccount,
            amount: 100,
            durationSeconds: 600,
            addressMap}));
        let [burnResult] = await shallPass(burnVesting({signer: aliceAccount, id: 0, addressMap}))
        expectNoEvent("StarlyTokenVesting.VestingBurned", burnResult)
        expectEvent("StarlyTokenVesting.TokensBurned", burnResult, {
            id: 0,
            amount: "100.00000000"
        })
        expectEvent("StarlyToken.TokensBurned", burnResult, {
            amount: "100.00000000"
        })
        expect(await getStarlyTokenBalance(vestingAccount, addressMap)).toBe("900.00000000")
        expect(await getStarlyTokenBalance(aliceAccount, addressMap)).toBe("1000.00000000")
    });

    test("Tricky case: user burns vesting collection", async () => {
        await shallPass(adminVestLinear({
            signer: vestingAccount,
            beneficiary: aliceAccount,
            amount: 100,
            durationSeconds: 600,
            addressMap}));
        await shallPass(adminVestPeriod({
            signer: vestingAccount,
            beneficiary: aliceAccount,
            amount: 200,
            tenPercentDuration: 60,
            addressMap}));
        let [burnResult] = await shallPass(burnVestingCollection({signer: aliceAccount, id: 0, addressMap}))
        expectEvent("StarlyTokenVesting.TokensBurned", burnResult, {
            id: 0,
            amount: "100.00000000"
        })
        expectEvent("StarlyTokenVesting.TokensBurned", burnResult, {
            id: 1,
            amount: "200.00000000"
        })
        expectEvent("StarlyToken.TokensBurned", burnResult, {
            amount: "100.00000000"
        })
        expectEvent("StarlyToken.TokensBurned", burnResult, {
            amount: "200.00000000"
        })
        expect(await getStarlyTokenBalance(vestingAccount, addressMap)).toBe("700.00000000")
        expect(await getStarlyTokenBalance(aliceAccount, addressMap)).toBe("1000.00000000")
    });

    test("Tricky case: tampering vested vault", async () => {
        await shallThrow(tamperVestedVault({signer: aliceAccount, addressMap}))
    });

    test("Tricky case: tampering vesting schedule", async () => {
        await shallThrow(tamperVestingSchedule({signer: aliceAccount, addressMap}))
    });

    test("Tricky case: non-admin tries to create vesting", async () => {
        await shallThrow(adminVestLinear({
            signer: aliceAccount,
            beneficiary: aliceAccount,
            amount: 100,
            durationSeconds: 600,
            addressMap
        }));
    })
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

function transferVestings({to, from, vestingIds, addressMap}) {
    return tx("../transactions/starlyTokenVesting/transfer_vesting_nfts.cdc", [vestingIds, to], from, addressMap);
}

function setupVestingCollection({signer, addressMap}) {
    return tx("../transactions/starlyTokenVesting/setup_account.cdc", [], signer, addressMap);
}

function adminBurnVesting({signer, id, addressMap}) {
    return tx("../transactions/starlyTokenVesting/admin/burn.cdc", [id], signer, addressMap);
}

function adminVestLinear({signer, beneficiary, amount, durationSeconds, addressMap}) {
    return tx("../transactions/starlyTokenVesting/admin/vest_linear.cdc", [beneficiary, amount, durationSeconds], signer, addressMap);
}

function adminVestPeriod({signer, beneficiary, amount, tenPercentDuration, addressMap}) {
    return tx("../transactions/starlyTokenVesting/admin/vest_period.cdc", [beneficiary, amount, tenPercentDuration], signer, addressMap);
}

function release({signer, id, addressMap}) {
    return tx("../transactions/starlyTokenVesting/release.cdc", [id], signer, addressMap);
}

function tamperVestedVault({signer, addressMap}) {
    return tx("../transactions/starlyTokenVesting/tamper_vested_vault.cdc", [], signer, addressMap);
}

function tamperVestingSchedule({signer, addressMap}) {
    return tx("../transactions/starlyTokenVesting/tamper_vesting_schedule.cdc", [], signer, addressMap);
}

function addSeconds({signer, seconds, addressMap}) {
    return tx("../transactions/testing_add_seconds.cdc", [seconds], signer, addressMap);
}

function burnVesting({signer, k, addressMap}) {
    return tx("../transactions/starlyTokenVesting/burn_vesting.cdc", [], signer, addressMap);
}

function burnVestingCollection({signer, k, addressMap}) {
    return tx("../transactions/starlyTokenVesting/burn_vesting_collection.cdc", [], signer, addressMap);
}

async function script(filename, args, addressMap) {
    const code = getTemplate(filename, addressMap);
    const [result] = await executeScript({code, args});
    return result;
}

async function getStarlyTokenBalance(account, addressMap) {
    return await script("../scripts/starlyToken/read_balance.cdc", [account], addressMap)
}

async function getReleasableAmount(account, id, addressMap) {
    return await script("../scripts/starlyTokenVesting/read_releasable_amount.cdc", [account, id], addressMap)
}

async function getMetadata(account, id, addressMap) {
    return await script("../scripts/starlyTokenVesting/read_metadata.cdc", [account, id], addressMap)
}

async function getMetadataDisplay(account, id, addressMap) {
    return await script("../scripts/starlyTokenVesting/read_metadata_display.cdc", [account, id], addressMap)
}
