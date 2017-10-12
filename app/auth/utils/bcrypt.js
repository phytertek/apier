const bcrypt = require('bcrypt')

const { BcryptCost } = require('../../../appConfig').Config

const hashPassword = async password => bcrypt.hash(password, BcryptCost)

const comparePassword = async (password, hash) => bcrypt.compare(password, hash)

module.exports = { hashPassword, comparePassword }
