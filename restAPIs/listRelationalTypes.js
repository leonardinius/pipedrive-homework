let listRelationalTypes = (db) => {
    const sqlListRelationTypes = db.sql('sqls/listRelationTypes.sql');

    return (req, res, next) => {
        db.conn.any(sqlListRelationTypes)
            .then((data) => {
                res.status(200).json(data);
            })
            .catch((err) => {
                return next(err);
            });
    }
};

module.exports = listRelationalTypes;