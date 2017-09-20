let queryNodes = (db, fnGetName) => {
    const sqlFindByName = db.sql('sqls/findByName.sql');

    return (req, res, next) => {
        let name = fnGetName(req);

        let pageNo = parseInt(req.query.page) || 0;
        let pageSize = Math.max(0, Math.min(parseInt(req.query.pageSize) || 100, 100));
        let offset = pageNo * pageSize;

        db.conn.any(sqlFindByName, {name: name, pageSize: pageSize, offset: offset})
            .then((data) => {
                res.status(200).json(data);
            })
            .catch((err) => {
                return next(err);
            });
    }
};

module.exports = queryNodes;


