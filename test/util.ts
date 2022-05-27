import * as _ from "lodash";
import {
    deployContract,
    getTemplate,
    sendTransaction,
} from "flow-js-testing";

export function expectEvent(name, txResult, data) {
    const found = txResult.events.some((e) => e.type.endsWith(name) && _.isMatch(e.data, data));
    if (!found) {
        throw new Error(`Event ${name} not found: ${JSON.stringify(data)}`);
    }
}

export function expectNoEvent(name, txResult) {
    const found = txResult.events.some((e) => e.type.endsWith(name));
    if (found) {
        throw new Error(`Event ${name} was found!`);
    }
}

export async function deployContractWithTestingUtils({to, name, addressMap}) {
    const code = getTemplate(`../contracts/${name}.cdc`, addressMap)
    return await deployContract({ to, name, code: insertTestingUtilitiesCode(code, addressMap)})
}

export function addSeconds({signer, seconds, addressMap}) {
    return sendTransaction({
        code: getTemplate("../transactions/testing_add_seconds.cdc", addressMap),
        args: [seconds],
        signers: [signer],
    });
}

export function insertTestingUtilitiesCode(code, addressMap) {
    let modifiedCode = code.replaceAll("getCurrentBlock().timestamp", "TestingUtilities.timestamp");
    if (code.includes("import TestingUtilities")) {
        return modifiedCode;
    }
    return "import TestingUtilities from " + addressMap["TestingUtilities"] + "\n" + modifiedCode;
}
