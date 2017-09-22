process.env.APP_DISABLE_LOG = true;

const assert = require('assert');
const request = require('supertest');
const app = require('../app');

describe('Smoke Acceptance Tests', function () {
    describe('GET /api/relationTypes', function (done) {
        it('returns a list of all relation types', function () {
            return request(app)
                .get('/api/relationTypes')
                .set('Accept', 'application/json')
                .expect(200,
                    [
                        {id: "parent", name: "parent", reverse_name: "daughter"},
                        {id: "daughter", name: "daughter", reverse_name: "parent"},
                        {id: "sister", name: "sister", reverse_name: "sister"}
                    ])
                .then(done);
        })
    });

    describe('POST /api/nodes', function (done) {
        it('Accepts empty array', function () {
            return request(app)
                .post('/api/nodes')
                .set('Accept', 'application/json')
                .send('{}')
                .expect(400)
                .then(done);
        });

        it('Fails on null input', function () {
            return request(app)
                .post('/api/nodes')
                .set('Accept', 'application/json')
                .send('')
                .expect(400)
                .then(done);
        });

        it('Accepts sample task data', function () {
            return request(app)
                .post('/api/nodes')
                .set('Accept', 'application/json')
                .send({
                    org_name: "Paradise Island",
                    "daughters": [
                        {
                            org_name: "Banana tree",
                            "daughters": [
                                {org_name: "Yellow Banana"},
                                {org_name: "Brown Banana"},
                                {org_name: "Black Banana"}
                            ]
                        },
                        {
                            org_name: "Big banana tree",
                            "daughters": [
                                {org_name: "Yellow Banana"},
                                {org_name: "Brown Banana"},
                                {org_name: "Green Banana"},
                                {org_name: "Black Banana", "daughters": [{org_name: "Phoneutria Spider"}]}
                            ]
                        }
                    ]
                })
                .expect(201)
                .then(done);
        });
    });

    describe('GET /api/nodes/:name/?page=&pageSize=', function (done) {
        it('Empty name results in 404', function () {
            return request(app)
                .get('/api/nodes/')
                .set('Accept', 'application/json')
                .expect(404)
                .then(done);
        });
    });
});

const db = require('../db');
const Ingestible = require('../lib/Ingestible');

describe('Acceptance Tests relying on database', function () {
    beforeEach(function (done) {
        let logger = console.debug;
        logger('** before **');

        let ingestible = new Ingestible({
            org_name: "Paradise Island",
            "daughters": [
                {
                    org_name: "Banana tree",
                    "daughters": [
                        {org_name: "Yellow Banana"},
                        {org_name: "Brown Banana"},
                        {org_name: "Black Banana"}
                    ]
                },
                {
                    org_name: "Big banana tree",
                    "daughters": [
                        {org_name: "Yellow Banana"},
                        {org_name: "Brown Banana"},
                        {org_name: "Green Banana"},
                        {org_name: "Black Banana", "daughters": [{org_name: "Phoneutria Spider"}]}
                    ]
                }
            ]
        });

        db.conn
            .tx(function (tx) {
                let updates = ingestible.asSqlStatements(tx);
                return tx.batch(updates);
            })
            .then(function (data) {
                logger(`Result set of ${data.length} items`);
            })
            .then(done)
            .catch(function (error) {
                console.error(error);
                done(error);
            })
    });


    describe('POST /api/nodes', function (done) {
        it('Wipes previous data on POST', function () {
            return request(app)
                .post('/api/nodes')
                .set('Accept', 'application/json')
                .send({org_name: "test"})
                .expect(201)
                .then(function () {
                    return db.conn.any('select name from nodes')
                        .then((data) => assert.equal(data[0].name, 'test'))
                })
                .then(done);
        });
    });

    describe('GET /api/nodes/:name/?page=&pageSize=', function (done) {
        it('Empty name results in 404', function () {
            return request(app)
                .get('/api/nodes/')
                .set('Accept', 'application/json')
                .expect(404)
                .then(done);
        });

        it('Ignores case sensitivity', function () {
            return request(app)
                .get('/api/nodes/black%20baNanA/?page=0&pageSize=10')
                .set('Accept', 'application/json')
                .expect(200)
                .expect([
                    {org_name: "Banana tree", relationship_type: "parent"},
                    {org_name: "Big banana tree", relationship_type: "parent"},
                    {org_name: "Brown Banana", relationship_type: "sister"},
                    {org_name: "Green Banana", relationship_type: "sister"},
                    {org_name: "Phoneutria Spider", relationship_type: "daughter"},
                    {org_name: "Yellow Banana", relationship_type: "sister"}
                ])
                .then(done);
        });

        it('Ignores extra spaces on start end', function () {
            return request(app)
                .get('/api/nodes/%20%20Black%20Banana%20%20%20/?page=0&pageSize=10')
                .set('Accept', 'application/json')
                .expect(200)
                .expect([
                    {org_name: "Banana tree", relationship_type: "parent"},
                    {org_name: "Big banana tree", relationship_type: "parent"},
                    {org_name: "Brown Banana", relationship_type: "sister"},
                    {org_name: "Green Banana", relationship_type: "sister"},
                    {org_name: "Phoneutria Spider", relationship_type: "daughter"},
                    {org_name: "Yellow Banana", relationship_type: "sister"}
                ])
                .then(done);
        });

        it('Accepts pagesize parameters = 2', function () {
            return request(app)
                .get('/api/nodes/Black%20Banana/?page=0&pageSize=2')
                .set('Accept', 'application/json')
                .expect(200)
                .expect([
                    {org_name: 'Banana tree', relationship_type: 'parent'},
                    {org_name: 'Big banana tree', relationship_type: 'parent'}
                ])
                .then(done);
        });
    });
});
