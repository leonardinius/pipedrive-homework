var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', (req, res, next) => {
    res.render('index', {title: 'Pipedrive Homework by Leonids M.'});
});

module.exports = router;
