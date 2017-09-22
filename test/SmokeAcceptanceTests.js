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
