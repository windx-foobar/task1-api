const bcrypt = require('bcrypt');

async function hashPassword(password) {
  const salt = await bcrypt.genSalt();
  return bcrypt.hash(password, salt);
}

async function comparePasswords(password, hashPassword) {
  return bcrypt.compare(password, hashPassword);
}

module.exports = { hashPassword, comparePasswords };
