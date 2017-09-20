exports.up = (pgm) => {
    pgm.createIndex('relations', ['left_id', 'right_id', 'type_id'], {unique: true});
};

exports.down = (pgm) => {
    pgm.dropIndex('relations', ['left_id', 'right_id', 'type_id'], {unique: true});
};