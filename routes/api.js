const express = require('express');
const router = express.Router();
const db = require('../db');

const listRelationalTypes = require('../restAPIs/listRelationalTypes');
const saveNodes = require('../restAPIs/saveNodes');
const queryNodes = require('../restAPIs/queryNodes');

router.get('/relationTypes', listRelationalTypes(db));
router.post('/nodes', saveNodes(db));
router.get('/nodes/:name/', queryNodes(db, ((req) => req.params.name)));

module.exports = router;
