exports.up = (pgm) => {
    pgm.createIndex('nodes', ['name'], {method: 'btree'});
};

exports.down = (pgm) => {
    pgm.dropIndex('nodes', ['name'], {method: 'btree'});
};