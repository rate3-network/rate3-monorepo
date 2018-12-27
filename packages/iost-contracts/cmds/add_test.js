const fs = require('fs');
const util = require('./util.js');

exports.command = 'test <con_name> <test_name>';

exports.describe = 'add a test for a contract class';

exports.builder = (yargs) => {
    yargs.positional('con_name', {
        describe: 'the name of contract class',
        type: 'string'
    }).positional('test_name', {
        describe: 'the name of the test to add',
        type: 'string'
    })
}

exports.handler = function (argv) {
    path = "./contract/" + argv.con_name + ".js";
    if (!fs.existsSync(path)) {
        console.error(("contract file not exists! path = " + path).yellow);
        return;
    }

    testPath = "./test/" + argv.con_name + "_" + argv.test_name + ".js";
    if (fs.existsSync(testPath)) {
        console.error(("test file exists! path = " + testPath).yellow);
        return;
    }

    var content = "var ContractName = require('../contract/ContractName.js');\n";
    content = content.replace(/ContractName/g, argv.con_name);
    console.log("create file: " + testPath);
    util.writeFile(testPath, content);
    return;
};