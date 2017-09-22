let n = (s) => ( (s || {})['org_name'] || '').trim();

let collector = (arr) => (data) => {
    arr.push(data);
    return data;
};

let walk = (collector, node, relationNode, type) => {
    collector([n(node), n(relationNode), type]);

    let daughters = node.daughters || [];

    for (let i = 0; i < daughters.length; i++) {
        for (let j = i + 1; j < daughters.length; j++) {
            collector([n(daughters[i]), n(daughters[j]), "sister"]);
        }
    }

    daughters.forEach(el => walk(collector, el, node, "daughter"));
};


let process = (root) => {
    let arr = [];
    walk(collector(arr), root, null, null);
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

let isRootValid = (root) => root && root.org_name;

class Ingestible {
    constructor(root) {
        let rootValid = isRootValid(root);

        if (rootValid) {
            this._relations = process(root);
            this._nodes = allNodes(this._relations);
            this._rootValid = true;
        }
    }

    isValid = () => this._rootValid;

    /**
     *
     * Iterates all nodes for Insert operation nad invokes for callback operation
     *
     * @param fn - function (index, name)
     */
    forEachNode = (fn) => {
        Object.entries(this._nodes)
            .forEach(el => fn(el[1], el[0]));
    };

    /**
     * Iterates over relations and invokes callback function
     * @param fn - function (leftNodeId, rightNodeId, relationType)
     */
    forEachRelation = (fn) => {
        const nodes = this._nodes;
        const relations = this._relations;

        relations.slice(1) // skip ROOT node
            .forEach(row => fn(nodes[row[0]], nodes[row[1]], row[2]));
    };

    /**
     *
     * Returns an array of SQL updates to perform to ingest the data
     *
     * @param tx
     */
    asSqlStatements = (tx) => {
        let q = [];
        q.push(tx.none('DELETE FROM relations;'));
        q.push(tx.none('DELETE FROM nodes;'));

        this.forEachNode((index, name) => q.push(tx.none('INSERT INTO nodes(id, name) VALUES($1, $2);', [index, name])));

        this.forEachRelation((leftNodeId, rightNodeId, relationType) =>
            q.push(tx.none('INSERT INTO relations (left_id, right_id, type_id)' +
                ' VALUES ($1, $2, $3)' +
                ' ON CONFLICT (left_id, right_id, type_id) DO NOTHING;',
                [leftNodeId, rightNodeId, relationType])));

        return q;
    }
}

module.exports = Ingestible;