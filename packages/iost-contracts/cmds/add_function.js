const fs = require('fs');
const esprima = require('esprima/dist/esprima.js');
const util = require('./util.js');

exports.command = 'func <con_name> <func_name> [param...]';

exports.describe = 'add a function to a contract class';

exports.builder = (yargs) => {
    yargs.positional('con_name', {
        describe: 'the name of contract class',
        type: 'string'
    }).positional('func_name', {
        describe: 'the name of the function to add',
        type: 'string'
    }).positional('param', {
        describe: 'name and type of parameters',
        type: 'string'
    })
}

exports.handler = function (argv) {
    path = "./contract/" + argv.con_name + ".js";
    if (!fs.existsSync(path)) {
        console.error(("contract file not exists! path = " + path).yellow);
        return;
    }
    source = fs.readFileSync(path, 'utf-8');

    // parse param array
    var param = argv.param;
    if (param.length % 2 != 0) {
        console.error(("param should include both param name and type. got parameter length = " + param.length).yellow);
        return;
    }
    var paramName = [];
    var paramType = [];
    for (let i in param) {
        if (i % 2 === 0) {
            if (!['number', 'string', 'bool', 'json'].includes(param[i])) {
                console.error(("parameter type should be in ['number', 'string', 'bool', 'json']").yellow);
                return;
            }
            paramType.push(param[i]);
        } else {
            paramName.push(param[i]);
        }
    }

    // find position in contract class to insert function
    var ast = esprima.parseModule(source, {
        range: true,
    });
    if (!ast || ast === null || !ast.body || ast.body === null || ast.body.length === 0) {
        console.error(("invalid source! ast = " + ast).yellow);
        return;
    }
    var found = false;
    var pos = -1;
    for (let i in ast.body) {
        var stat = ast.body[i];
        if (stat.type === "ClassDeclaration" && stat.id.type === "Identifier" && stat.id.name === argv.con_name) {
            found = true;
            for (let j in stat.body.body) {
                var def = stat.body.body[j];
                if (def.type === "MethodDefinition" && def.key.type === "Identifier" &&
                    def.value.type === "FunctionExpression" && def.key.name === argv.func_name) {
                    console.error(("error: function " + argv.func_name + "exists!").yellow);
                    return;
                }
                pos = def.range[1];
            }
        }
    }
    if (!found) {
        console.error(("contract class not found! con_name = " + argv.con_name).yellow);
        return;
    }
    if (pos < 0) {
        console.error(("insert function position not found!").yellow);
        return;
    }

    // insert function
    var content = "\n    " + argv.func_name + '(';
    for (let i in paramName) {
        content += paramName[i];
        if (i < paramName.length - 1) {
            content += ", ";
        }
    }
    content += ')';
    content += ' {' + '\n' +
        '    ' + '}';
    newSource = source.slice(0, pos) + content + source.slice(pos);
    console.log("add function " + argv.func_name + "() to " + path);
    util.writeFile(path, newSource);

    // modify abi
    var abiPath = "./abi/" + argv.con_name + ".json";
    var abiStr = fs.readFileSync(abiPath, 'utf-8');
    var abi = JSON.parse(abiStr);

    found = false;
    var mabi;
    for (let i in abi["abi"]) {
        var info = abi["abi"][i];
        if (info["name"] === argv.func_name) {
            info = {
                "name": argv.func_name,
                "args": paramType
            }
            mabi = info;
            found = true;
            console.log(("function exists in abi file, will modify it.").green);
        }
    }
    if (!found) {
        mabi = {
            "name": argv.func_name,
            "args": paramType
        };
        abi["abi"].push(mabi);
    }
    abiStr = JSON.stringify(abi, null, 4);
    console.log("add abi " + argv.func_name + " to " + abiPath);
    console.log(JSON.stringify(mabi, null, 4));
    util.writeFile(abiPath, abiStr);

    return;
};