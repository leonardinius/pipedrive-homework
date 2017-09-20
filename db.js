var promise = require('bluebird');

var options = {
    // Initialization Options
    promiseLib: promise
};

var pgp = require('pg-promise')(options);
var connectionString = process.env.DATABASE_URL || 'postgres://pp-user:pp-password@localhost:5432/postgres';
var db = pgp(connectionString);

module.exports = {
    conn: db
};
