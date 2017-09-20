const data = {
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
};

let n = (s) => ( (s || {})['org_name'] || '').trim();

let walk = (collector, node, referenceNode, type) => {
    collector([n(node), n(referenceNode), type]);

    let daughters = node.daughters || [];

    for (let i = 0; i < daughters.length; i++) {
        for (let j = i + 1; j < daughters.length; j++) {
            collector([n(daughters[i]), n(daughters[j]), "sister"]);
        }
    }

    for (let i = 0; i < daughters.length; i++) {
        walk(collector, daughters[i], node, "daughter");
    }
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
    let nodes = new Set();
    for (let n in data) {
        nodes.add(data[n][0]);
    }
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

            db.conn.tx(t => {
                removeData(t)
                insertData(t);
            }).then(() => {
                res.status(201).end();
            }).catch((err) => {
                return next(err);
            });
        }
    }
};

module.exports = saveNodes;


