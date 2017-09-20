const promise = require('bluebird');

const options = {
    // Initialization Options
    promiseLib: promise
};
const pgp = require('pg-promise')(options);

const connectionString = process.env.DATABASE_URL || 'postgres://pp-user:pp-password@localhost:5432/postgres';
const conn = pgp(connectionString);

// Helper for linking to external query files:
const path = require('path');

function sql(file) {
    const fullPath = path.join(__dirname, file);
    return new pgp.QueryFile(fullPath, {minify: true});
}

module.exports = {
    conn: conn,
    sql: sql
};
