const postgres = require('postgres')
const sql = postgres(process.env.PG_URL)

module.exports = sql
