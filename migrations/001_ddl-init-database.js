exports.up = (pgm) => {
    pgm.createTable('types', {
        id: {type: 'varchar(10)', primaryKey: true},
        name: {type: 'varchar'},
        reverse_name: {type: 'varchar'}
    });

    pgm.createTable('nodes', {
        id: {type: 'serial', primaryKey: true},
        name: {type: 'varchar', unique: true}
    });

    pgm.createTable('relations', {
        node_left: {type: 'serial', references: 'nodes'},
        node_right: {type: 'serial', references: 'nodes'},
        type_id: {type: 'varchar(10)', references: 'types'}
    });
};

exports.down = (pgm) => {
    pgm.dropTable('relations');
    pgm.dropTable('nodes');
    pgm.dropTable('types');
};