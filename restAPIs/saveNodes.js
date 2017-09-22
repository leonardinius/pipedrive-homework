const Ingestible = require('../lib/Ingestible');

let saveNodes = (db) => {
    return (req, res, next) => {
        let ingestible = new Ingestible(req.body);

        if (!ingestible.isValid()) {
            return res.status(400).end();
        }

        db.conn.tx(tx => {
            let updates = ingestible.asSqlStatements(tx);
            return tx.batch(updates);
        }).then(() => {
            res.status(201).end();
        }).catch((err) => {
            return next(err);
        });

    };
};

module.exports = saveNodes;
