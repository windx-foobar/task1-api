const { resolve } = require('node:path');
const fg = require('fast-glob');

function scanDirForModels(dir) {
  return [
    ...fg.sync(resolve(dir, '**/*.model.js').replace(/\\/g, '/')),
    ...fg.sync(resolve(dir, '**/model.js').replace(/\\/g, '/'))
  ];
}

module.exports = { scanDirForModels };
