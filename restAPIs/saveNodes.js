let saveNodes = (db) => {
    return (req, res, next) => {
        let accept = req.body && req.body.org_name;
        if (accept) {
        }
        let status = accept
            ? 201
            : 400;
        res.status(status).end();
    }
};

module.exports = saveNodes;


