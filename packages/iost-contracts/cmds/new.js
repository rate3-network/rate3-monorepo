const util = require('./util.js');
const fse = require('fs-extra');

exports.command = 'new <name>';

exports.describe = 'create a new DApp in current directory';

exports.builder = (yargs) => {
    yargs.positional('name', {
        describe: 'the name of DApp',
        type: 'string'
    })
}

exports.handler = function (argv) {
    console.log("make directory: " + argv.name);
    var err = util.makeDir(argv.name);
    if (err !== undefined) {
        console.error(err.red);
        return;
    }

    console.log("make directory: " + argv.name + "/contract");
    util.makeDir(argv.name + "/contract");
    console.log("make directory: " + argv.name + "/abi");
    util.makeDir(argv.name + "/abi");
    console.log("make directory: " + argv.name + "/test");
    util.makeDir(argv.name + "/test");

    console.log("make directory: " + argv.name + "/libjs");
    libDir = __dirname + "/./libjs";
    fse.copySync(libDir, argv.name + "/libjs");

    return;
};