const assert = require('assert');
const Ingestible = require('../lib/Ingestible');

let inverseTypeName = (type) => {
    let mapping = {};
    mapping['parent'] = 'daughter';
    mapping['daughter'] = 'parent';
    return mapping[type] || type;
};

let filterAsInDatabase = (name, rs) => {
    let cmp = (a, b) => {
        if (a == b) return 0;
        if (a < b) return -1;
        return 1;
    };

    let nameTypeMarkers = {};

    return rs
        .filter(el => el[0] == name || el[1] == name)

        // filter out results
        .map(el => {
            let [org1, org2, type] = el;
            if (org1 == name) {
                return [org2, inverseTypeName(type)];
            }

            return [org1, type];
        })

        // filter out duplicates
        .filter(el => {
            let [orgName, type] = el;
            let key = orgName + " / " + type;
            if (nameTypeMarkers[key]) {
                return null;
            }
            nameTypeMarkers[key] = key;
            return key;
        })

        // map to result set
        .map(el => {
            let [orgName, type] = el;
            return {org_name: orgName, relationship_type: type};
        })

        // sort by org name
        .sort((a, b) => {
            let i = cmp(a.org_name, b.org_name);
            if (i == 0) {
                i = cmp(a.relationship_type, b.relationship_type);
            }
            return i;
        });
};

describe('Test Task sample data', function (done) {
    it('Task sample data test', function () {
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

        assert.deepEqual(ingestible.allNodes().sort(), [
            "Paradise Island",
            "Banana tree",
            "Yellow Banana",
            "Brown Banana",
            "Black Banana",
            "Big banana tree",
            "Green Banana",
            "Phoneutria Spider"
        ].sort());

        assert.deepEqual(ingestible.allRelations().sort(), [
                ['Banana tree', 'Big banana tree', 'sister'],
                ['Banana tree', 'Paradise Island', 'daughter'],
                ['Yellow Banana', 'Brown Banana', 'sister'],
                ['Yellow Banana', 'Black Banana', 'sister'],
                ['Brown Banana', 'Black Banana', 'sister'],
                ['Yellow Banana', 'Banana tree', 'daughter'],
                ['Brown Banana', 'Banana tree', 'daughter'],
                ['Black Banana', 'Banana tree', 'daughter'],
                ['Big banana tree', 'Paradise Island', 'daughter'],
                ['Yellow Banana', 'Brown Banana', 'sister'],
                ['Yellow Banana', 'Green Banana', 'sister'],
                ['Yellow Banana', 'Black Banana', 'sister'],
                ['Brown Banana', 'Green Banana', 'sister'],
                ['Brown Banana', 'Black Banana', 'sister'],
                ['Green Banana', 'Black Banana', 'sister'],
                ['Yellow Banana', 'Big banana tree', 'daughter'],
                ['Brown Banana', 'Big banana tree', 'daughter'],
                ['Green Banana', 'Big banana tree', 'daughter'],
                ['Black Banana', 'Big banana tree', 'daughter'],
                ['Phoneutria Spider', 'Black Banana', 'daughter']
            ].sort()
        );

        let results = filterAsInDatabase('Black Banana', ingestible.allRelations());
        assert.deepEqual(results, [
            {org_name: "Banana tree", relationship_type: "parent"},
            {org_name: "Big banana tree", relationship_type: "parent"},
            {org_name: "Brown Banana", relationship_type: "sister"},
            {org_name: "Green Banana", relationship_type: "sister"},
            {org_name: "Phoneutria Spider", relationship_type: "daughter"},
            {org_name: "Yellow Banana", relationship_type: "sister"}
        ]);
    });


});