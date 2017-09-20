var express = require('express');
var router = express.Router();

var db = require('../db').conn;

router.get('/relationTypes', function getAllRelationTypes(req, res, next) {
        db.any('select * from relations_types')
            .then(function (data) {
                res.status(200)
                    .json({
                        status: 'success',
                        data: data,
                        message: 'ALL relation types'
                    });
            })
            .catch(function (err) {
                return next(err);
            });
    }
);

module.exports = router;
