const fs = require('fs');
const shelljs = require('shelljs');
const util = require('./util.js');

exports.command = 'test <name>';

exports.describe = 'test contract';

exports.builder = (yargs) => {
    yargs.positional('name', {
        describe: 'the name of contract',
        type: 'string'
    })
}

exports.handler = function (argv) {
    var path = "./test/";
    fs.readdirSync(path).forEach(file => {
        if (file.startsWith(argv.name + "_") && file.endsWith(".js")) {
            console.log(("test " + path + file).green);
            shelljs.exec("node " + path + file);
        }
    });

    return;
};