import path from "path";
import {
    deployContractByName,
    emulator,
    executeScript,
    getAccountAddress,
    getTemplate,
    init,
    shallPass,
    shallThrow,
} from "flow-js-testing";

// Increase timeout if your tests failing due to timeout
jest.setTimeout(10000);

describe("CompoundInterest contract tests", () => {
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

    test("pow10", async () => {
        const stakingAccount = await getAccountAddress("Staking");
        const addressMap = {
            "CompoundInterest": stakingAccount,
        };
        await shallPass(deployContractByName({to: stakingAccount, name: "CompoundInterest", addressMap}));

        expect(await pow10(0)).toBe("1.00000000")
        expect(await pow10(1)).toBe("10.00000000")
        expect(await pow10(2)).toBe("100.00000000")
        expect(await pow10(3)).toBe("1000.00000000")
        expect(await pow10(4)).toBe("10000.00000000")
        expect(await pow10(5)).toBe("100000.00000000")
        expect(await pow10(6)).toBe("1000000.00000000")
        expect(await pow10(7)).toBe("10000000.00000000")
        expect(await pow10(8)).toBe("100000000.00000000")
        expect(await pow10(9)).toBe("1000000000.00000000")
        expect(await pow10(10)).toBe("10000000000.00000000")
        expect(await pow10(11)).toBe("100000000000.00000000")
        expect(await pow10(11.2659197)).toBe("184467430477.47592293") // actual 184467431182.38623
        expect(await pow10(12)).toBeNull()

        expect(await pow10(1.1)).toBe("12.58925410") // actual 12.589254117941675
        expect(await pow10(1.01)).toBe("10.23292990") // actual 10.232929922807541
        expect(await pow10(1.001)).toBe("10.02305240") // actual 10.023052380778994
        expect(await pow10(1.0001)).toBe("10.00230290") // actual 10.002302850208247
        expect(await pow10(1.00001)).toBe("10.00023030") // actual 10.00023026116027
        expect(await pow10(1.000001)).toBe("10.00002300") // actual 10.000023025877438
        expect(await pow10(1.0000001)).toBe("10.00000230") // actual 10.00000230258536
        expect(await pow10(1.00000001)).toBe("10.00000020") // actual 10.000000230258511
        expect(await pow10(1.9)).toBe("79.43282350") // actual 79.43282347242814
        expect(await pow10(1.09)).toBe("12.30268770") // actual 12.302687708123818
        expect(await pow10(1.009)).toBe("10.20939480") // actual 10.209394837076797
        expect(await pow10(1.0009)).toBe("10.02074480") // actual 10.020744753364786
        expect(await pow10(1.00009)).toBe("10.00207250") // actual 10.0020725413254
        expect(await pow10(1.000009)).toBe("10.00020720") // actual 10.000207234805652
        expect(await pow10(1.0000009)).toBe("10.00002070") // actual 10.000020723287312
        expect(await pow10(1.00000009)).toBe("10.00000210") // actual 10.000002072326795
        expect(await pow10(1.11111111)).toBe("12.91549659") // actual 12.91549661710547
        expect(await pow10(1.22222222)).toBe("16.68100529") // actual 16.681005286646286
        expect(await pow10(1.33333333)).toBe("21.54434672") // actual 21.54434673495987
        expect(await pow10(1.44444444)).toBe("27.82559391") // actual 27.825593737312147
        expect(await pow10(1.55555555)).toBe("35.93813618") // actual 35.938136178320626
        expect(await pow10(1.66666666)).toBe("46.41588797") // actual 46.41588762361757
        expect(await pow10(1.77777777)).toBe("59.94842329") // actual 59.94842395827805
        expect(await pow10(1.88888888)).toBe("77.42636592") // actual 77.4263666833945
        expect(await pow10(1.99999999)).toBe("99.99999701") // actual 99.99999769741494
        expect(await pow10(1.12345678)).toBe("13.28791317") // actual 13.287913122544017
    });

    test("generatedCompoundInterest", async () => {
        const stakingAccount = await getAccountAddress("Staking");
        const addressMap = {
            "CompoundInterest": stakingAccount,
        };
        await shallPass(deployContractByName({to: stakingAccount, name: "CompoundInterest", addressMap}));

        let k0 = 0
        let k3 = 0.00406795
        let k15 = 0.01923438
        let k30 = 0.03610721
        let minute = 60
        let hour = 60 * minute
        let day = 24 * hour
        let week = 7 * day
        let year = 31556952
        let two_years = 2 * year
        let five_years = 5 * year
        let ten_years = 10 * year

        // 0% APY
        expect(await generatedCompoundInterest(year, k0)).toBe("1.00000000")

        // 3% APY
        expect(await generatedCompoundInterest(minute, k3)).toBe("1.00000005") // actual 1.0000000562008722
        expect(await generatedCompoundInterest(hour, k3)).toBe("1.00000336") // actual 1.0000033720579213
        expect(await generatedCompoundInterest(day, k3)).toBe("1.00008091") // actual 1.000080932528521
        expect(await generatedCompoundInterest(week, k3)).toBe("1.00056664") // actual 1.0005666652697602
        expect(await generatedCompoundInterest(year, k3)).toBe("1.02999994") // actual 1.0300000007092494
        expect(await generatedCompoundInterest(two_years, k3)).toBe("1.06089990") // 1.0609000014610535
        expect(await generatedCompoundInterest(five_years, k3)).toBe("1.15927386") // 1.1592740782913313
        expect(await generatedCompoundInterest(ten_years, k3)).toBe("1.34391588") // 1.343916388598216

        // 15% APY
        expect(await generatedCompoundInterest(minute, k15)).toBe("1.00000025") // actual 1.000000265732817
        expect(await generatedCompoundInterest(hour, k15)).toBe("1.00001594") // actual 1.000015944094017
        expect(await generatedCompoundInterest(day, k15)).toBe("1.00038271") // actual 1.0003827284277163
        expect(await generatedCompoundInterest(week, k15)).toBe("1.00268216") // actual 1.0026821770589875
        expect(await generatedCompoundInterest(year, k15)).toBe("1.14999997") // actual 1.150000001904556
        expect(await generatedCompoundInterest(two_years, k15)).toBe("1.32249993") // 1.3225000043804787
        expect(await generatedCompoundInterest(five_years, k15)).toBe("2.01135713") // 2.011357204155401
        expect(await generatedCompoundInterest(ten_years, k15)).toBe("4.04555770") // 4.045557802707831

        // 30% APY
        expect(await generatedCompoundInterest(minute, k30)).toBe("1.00000048") // actual 1.0000004988396787
        expect(await generatedCompoundInterest(hour, k30)).toBe("1.00002992") // actual 1.0000299308211733
        expect(await generatedCompoundInterest(day, k30)).toBe("1.00071856") // actual 1.0007185870181603
        expect(await generatedCompoundInterest(week, k30)).toBe("1.00504094") // actual 1.0050409658367343
        expect(await generatedCompoundInterest(year, k30)).toBe("1.29999994") // actual 1.3000000000277465
        expect(await generatedCompoundInterest(two_years, k30)).toBe("1.68999991") // actual 1.690000000072141
        expect(await generatedCompoundInterest(five_years, k30)).toBe("3.71292978") // actual 3.7129300003962333
        expect(await generatedCompoundInterest(ten_years, k30)).toBe("13.78584817") // actual 13.785849187842373
    });
});

async function script(filename, args, addressMap) {
    const code = getTemplate(filename, addressMap);
    const [result] = await executeScript({code, args});
    return result;
}

async function generatedCompoundInterest(seconds, k, addressMap) {
    return await script("../scripts/compoundInterest/generated_compound_interest.cdc", [seconds, k], addressMap)
}

async function pow10(x, addressMap) {
    return await script("../scripts/compoundInterest/pow10.cdc", [x], addressMap)
}
