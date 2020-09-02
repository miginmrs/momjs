const package = require('./package.json');
const id = +package.version.match(/0.0.1-SNAPSHOT-(\d+)/)?.[1];
if (id !== NaN) {
    package.version = `0.0.1-SNAPSHOT-${id + 1}`;
    const fs = require('fs');
    fs.writeFileSync('./package.json', JSON.stringify(package, undefined, 2));
}