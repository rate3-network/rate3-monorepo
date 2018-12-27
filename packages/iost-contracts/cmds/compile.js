const fs = require('fs');
const fse = require('fs-extra');
const util = require('./util.js');
const genAbi = require('./libjs/contract.js');

exports.command = 'compile <name>';

exports.describe = 'compile contract';

exports.builder = (yargs) => {
    yargs.positional('name', {
        describe: 'the name of contract',
        type: 'string'
    })
}

function abiMatch(a, b) {
    if (a["lang"] !== b["lang"]) {
        console.error(("lang mismatch! expected = " + a["lang"] + ", got " + b["lang"]).yellow);
        return false;
    }
    if (a["version"] !== b["version"]) {
        console.error(("version mismatch! expected = " + a["version"] + ", got " + b["version"]).yellow);
        return false;
    }
    if (a["abi"].length !== b["abi"].length) {
        console.error(("abi length mismatch! expected = " + a["abi"].length + ", got " + b["abi"].length).yellow);
        return false;
    }
    cmp = function (a, b) {
        return a.name < b.name ? -1 : (a.name > b.name ? 1 : 0);
    }
    a.abi.sort(cmp);
    b.abi.sort(cmp);
    for (let i in a["abi"]) {
        infoa = a["abi"][i];
        infob = b["abi"][i];
        if (infoa["name"] != infob["name"]) {
            console.error(("abi name mismatch! expected = " + infoa.name + ", got " + infob.name).yellow);
            return false;
        }
        if (infoa["args"].length != infob["args"].length) {
            console.error(("abi args length mismatch! expected = " + infoa.args.length + ", got " + infob.args.length).yellow);
            return false;
        }
    }
    return true;
}

exports.handler = function (argv) {
    var path = "./contract/" + argv.name + ".js";
    var abiPath = "./abi/" + argv.name + ".json";
    if (!fs.existsSync("./build/")) {
        util.makeDir("./build/");
    }
    console.log("compile " + path + " and " + abiPath);

    if (!fs.existsSync(path)) {
        console.error(("contract file not exists! path = " + path).yellow);
    }
    source = fs.readFileSync(path, 'utf-8');

    var newSource, eabi;
    [newSource, eabi] = genAbi(source);

    var abiStr = fs.readFileSync(abiPath, 'utf-8');

    if (!abiMatch(JSON.parse(eabi), JSON.parse(abiStr))) {
        console.error(("expected abi mismatch! expected = " + eabi + ", got " + abiStr).yellow);
        return;
    }
    fse.copySync(abiPath, "./build/" + argv.name + ".json");
    console.log("compile " + abiPath + " successfully");

    var newContract = "./build/" + argv.name + ".js";
    util.writeFile(newContract, newSource);
    console.log("generate file " + newContract + " successfully");

    return;
};