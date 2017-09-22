const assert = require('assert');
const Pageable = require('../lib/Pageable');

describe('Pageable Tests', function () {
    describe('Pageable parsing parameters', function (done) {
        it('accepts string page', function () {
            assert.equal(new Pageable('10', '11').page(), 10);
        });
        it('accepts string pageSize', function () {
            assert.equal(new Pageable('10', '11').pageSize(), 11);
        });

        it('accepts int page', function () {
            assert.equal(new Pageable(10, '11').page(), 10);
        });

        it('accepts int pageSize', function () {
            assert.equal(new Pageable('10', 11).pageSize(), 11);
        });
    });

    describe('Pageable value ranges', function (done) {
        it('negative pages results to zeros', function () {
            assert.equal(new Pageable(-10, 2).page(), 0);
        });
        it('negative page sizes results to 1', function () {
            assert.equal(new Pageable(10, -20).pageSize(), 1);
        });

        it('Page +20000 results ok', function () {
            assert.equal(new Pageable(20000, 100).page(), 20000);
        });

        it('PageSize +20000 has cap (limit) to 100', function () {
            assert.equal(new Pageable(10, 20000).pageSize(), 100);
        });
    });

    describe('Limit, offset tests', function (done) {
        it('default values', function () {
            let pageable = new Pageable('a', 'b');
            assert.equal(pageable.limit(), 100);
            assert.equal(pageable.offset(), 0);
        });

        it('page 0, pagesize 10 => limit 10, offset 0', function () {
            let pageable = new Pageable(0, 10);
            assert.equal(pageable.limit(), 10);
            assert.equal(pageable.offset(), 0);
        });

        it('page 3, pagesize 10 => limit 10, offset 30', function () {
            let pageable = new Pageable(3, 10);
            assert.equal(pageable.limit(), 10);
            assert.equal(pageable.offset(), 30);
        });
    });
});