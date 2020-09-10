const package = require('./package.json');
const [, version, id] = package.version.match(/(.*?)-SNAPSHOT-(\d+)/) || [];
if (id !== undefined) {
    package.version = `${version}-SNAPSHOT-${+id + 1}`;
    const fs = require('fs');
    fs.writeFileSync('./package.json', JSON.stringify(package, undefined, 2));
}