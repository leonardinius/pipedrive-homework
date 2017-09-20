var express = require('express');
var router = express.Router();

var db = require('../db').db;

router.get('/relationTypes', (req, res, next) => {
        db.any('select * from relations_types')
            .then((data) => {
                res.status(200)
                    .json({
                        status: 'success',
                        data: data,
                        message: 'ALL relation types'
                    });
            })
            .catch((err) => {
                return next(err);
            });
    }
);

module.exports = router;
