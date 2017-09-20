let n = (s) => ( (s || {})['org_name'] || '').trim();

let walk = (collector, node, referenceNode, type) => {
    collector([n(node), n(referenceNode), type]);

    let daughters = node.daughters || [];

    for (let i = 0; i < daughters.length; i++) {
        for (let j = i + 1; j < daughters.length; j++) {
            collector([n(daughters[i]), n(daughters[j]), "sister"]);
        }
    }

    daughters.forEach(el => walk(collector, el, node, "daughter"));
};

let pipe = (fn1, fn2) => (data) => fn2(fn1(data));
let collector = (arr) => (data) => {
    arr.push(data);
    return data;
};
let logger = (data) => {
    console.debug(data);
    return data;
};

let prepareSqlData = (root) => {
    let arr = [];
    walk(pipe(logger, collector(arr)), root, null, null);
    return arr;
};

let allNodes = (data) => {
    let nodes = {};

    data.forEach((el, index) => {
        let name = data[index][0];
        nodes[name] = index + 1;
    });

    return nodes;
};

let saveNodes = (db) => {
    return (req, res, next) => {
        let accept = req.body && req.body.org_name;
        if (!accept) {
            return res.status(400).end();
        }
        let sqlData = prepareSqlData(req.body);
        if (sqlData && sqlData.length > 0) {
            let nodes = allNodes(sqlData);

            db.conn.tx(tx => {
                let q = [];
                q.push(tx.none('DELETE FROM relations;'));
                q.push(tx.none('DELETE FROM nodes;'));
                Object.entries(nodes).forEach(el => q.push(tx.none('INSERT INTO nodes(id, name) VALUES($1, $2);', logger([el[1], el[0]]))));
                sqlData.slice(1) // skip root
                    .forEach(row => q.push(tx.none('INSERT INTO relations (left_id, right_id, type_id)' +
                        ' VALUES ($1, $2, $3)' +
                        ' ON CONFLICT (left_id, right_id, type_id) DO NOTHING;',
                        logger([nodes[row[0]], nodes[row[1]], row[2]])
                    )));
                return tx.batch(q);
            }).then(() => {
                res.status(201).end();
            }).catch((err) => {
                return next(err);
            });
        }
    }
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