const path = require('node:path');
const fs = require('node:fs');
const dotenv = require('dotenv');
const dotenvParseVariables = require('dotenv-parse-variables');

let env;

if (!env) {
  const envPath = path.resolve(__dirname, '../../../.env');

  env = dotenv.parse(fs.readFileSync(envPath));
  env = {
    ...dotenvParseVariables(env, {
      assignToProcessEnv: false
    }),
    NODE_ENV: process.env.NODE_ENV
  };
}

module.exports = { env };
