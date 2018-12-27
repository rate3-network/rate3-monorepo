const fs = require('fs');
const colors = require('colors');

function makeDir(root) {
    if (fs.existsSync(root)) {
        return "error: dir exists! path = " + root;
    }
    fs.mkdirSync(root);
}

function createFile(file) {
    if (fs.existsSync(file)) {
        return "error: file exists! path = " + file;
    }
    fs.writeFileSync(file, "");
}

function writeFile(file, content) {
    fs.writeFileSync(file, content);
}

exports.makeDir = makeDir;
exports.createFile = createFile;
exports.writeFile = writeFile;
