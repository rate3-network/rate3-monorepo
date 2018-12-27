#!/usr/bin/env node
var yargs = require('yargs');
var argv = yargs
    .usage('Usage: $0 <cmd> [args]')
    .command(require('./cmds/new.js'))
    .command(
        'add <item>',
        'add a new [contract|function|test]',
        function() {
            return yargs
                .usage('Usage: $0 add <item> [args]')
                .command(require('./cmds/add_contract.js'))
                .command(require('./cmds/add_function.js'))
                .command(require('./cmds/add_test.js'))
                .demandCommand()
                .alias('h', 'help')
        }
    )
    .command(require('./cmds/compile.js'))
    .command(require('./cmds/test.js'))
    .demandCommand()
    .help()
    .alias('h', 'help')
    .argv;
