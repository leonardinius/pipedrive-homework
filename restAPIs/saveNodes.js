const Ingestible = require('../lib/Ingestible');

let saveNodes = (db) => {
    return (req, res, next) => {
        let ingestible = new Ingestible(req.body);

        if (!ingestible.isValid()) {
            return res.status(400).end();
        }

        db.conn.tx(tx => {
            let q = [];
            q.push(tx.none('DELETE FROM relations;'));
            q.push(tx.none('DELETE FROM nodes;'));

            ingestible.forEachNode((index, name) => q.push(tx.none('INSERT INTO nodes(id, name) VALUES($1, $2);', [index, name])));

            ingestible.forEachRelation((leftNodeId, rightNodeId, relationType) =>
                q.push(tx.none('INSERT INTO relations (left_id, right_id, type_id)' +
                    ' VALUES ($1, $2, $3)' +
                    ' ON CONFLICT (left_id, right_id, type_id) DO NOTHING;',
                    [leftNodeId, rightNodeId, relationType])));
            return tx.batch(q);
        }).then(() => {
            res.status(201).end();
        }).catch((err) => {
            console.error(err);
            return next(err);
        });

    };
};

module.exports = saveNodes;


// const data = {
//     "org_name": "Paradise Island",
//     "daughters": [
//         {
//             "org_name": "Banana tree",
//             "daughters": [
//                 {"org_name": "Yellow Banana"},
//                 {"org_name": "Brown Banana"},
//                 {"org_name": "Black Banana"}
//             ]
//         },
//         {
//             "org_name": "Big banana tree",
//             "daughters": [
//                 {"org_name": "Yellow Banana"},
//                 {"org_name": "Brown Banana"},
//                 {"org_name": "Green Banana"},
//                 {"org_name": "Black Banana", "daughters": [{"org_name": "Phoneutria Spider"}]}
//             ]
//         }
//     ]
// };
//
// prepareSqlData(data);