const Pageable = require('../lib/Pageable');

let queryNodes = (db, fnGetName) => {
    const sqlFindByName = db.sql('sqls/findByName.sql');

    return (req, res, next) => {
        let name = fnGetName(req).trim();

        let pageable = new Pageable(req.query.page, req.query.pageSize);

        db.conn.any(sqlFindByName, {name: name, limit: pageable.limit(), offset: pageable.offset()})
            .then((data) => {
                res.status(200).json(data);
            })
            .catch((err) => {
                return next(err);
            });
    }
};

module.exports = queryNodes;
