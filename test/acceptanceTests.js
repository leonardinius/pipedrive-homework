process.env.APP_DISABLE_LOG = true;

const request = require('supertest');
const app = require('../app');

describe('GET /api/relationTypes', function (done) {
    it('returns a list of all relation types', function () {
        return request(app)
            .get('/api/relationTypes')
            .set('Accept', 'application/json')
            .expect(200, [
                    {"id": "parent", "name": "parent", "reverse_name": "daughter"},
                    {"id": "daughter", "name": "daughter", "reverse_name": "parent"},
                    {"id": "sister", "name": "sister", "reverse_name": "sister"}
                ],
                done
            );
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
                "org_name": "Paradise Island",
                "daughters": [
                    {
                        "org_name": "Banana tree",
                        "daughters": [
                            {"org_name": "Yellow Banana"},
                            {"org_name": "Brown Banana"},
                            {"org_name": "Black Banana"}
                        ]
                    },
                    {
                        "org_name": "Big banana tree",
                        "daughters": [
                            {"org_name": "Yellow Banana"},
                            {"org_name": "Brown Banana"},
                            {"org_name": "Green Banana"},
                            {"org_name": "Black Banana", "daughters": [{"org_name": "Phoneutria Spider"}]}
                        ]
                    }
                ]
            })
            .expect(201)
            .then(done);
    });

    it('Wipes previous data on POST', function () {
        return request(app)
            .post('/api/nodes')
            .set('Accept', 'application/json')
            .send('aaaa')
            .expect(201)
            .expect(function (res) {
                throw new Error("Here come dragons");
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
            .expect(function (res) {
                throw new Error("here come dragons");
            })
            .then(done);
    });

    it('Ignores extra spaces on start end', function () {
        return request(app)
            .get('/api/nodes/%20%20Black%20Banana%20%20%20/?page=0&pageSize=10')
            .set('Accept', 'application/json')
            .expect(200)
            .expect(function (res) {
                throw new Error("here come dragons");
            })
            .then(done);
    });

    it('Accepts pagesize parameters = 2', function () {
        return request(app)
            .get('/api/nodes/Black%20Banana/?page=0&pageSize=2')
            .set('Accept', 'application/json')
            .expect(200)
            .expect(function (res) {
                throw new Error("here come dragons");
            })
            .then(done);
    });

    it('Accepts pagesize parameters = 4', function () {
        return request(app)
            .get('/api/nodes/Black%20Banana/?page=0&pageSize=4')
            .set('Accept', 'application/json')
            .expect(200)
            .expect(function (res) {
                throw new Error("here come dragons");
            })
            .then(done);
    });

    it('Accepts page parameter page=2', function () {
        return request(app)
            .get('/api/nodes/Black%20Banana/?page=2&pageSize=')
            .set('Accept', 'application/json')
            .expect(200)
            .expect(function (res) {
                throw new Error("here come dragons");
            })
            .then(done);
    });

    it('Page size maximizes at 100', function () {
        return request(app)
            .get('/api/nodes/Black%20Banana/?page=0&pageSize=200')
            .set('Accept', 'application/json')
            .expect(200)
            .expect(function (res) {
                throw new Error("here come dragons");
            })
            .then(done);
    });
});
