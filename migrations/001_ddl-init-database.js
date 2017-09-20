exports.up = (pgm) => {
    pgm.createTable('relations_types', {
        id: {type: 'char(10)', primaryKey: true},
        name: {type: 'varchar'},
        reverse_name: {type: 'varchar'}
    });

    pgm.createTable('nodes', {
        id: {type: 'serial', primaryKey: true},
        name: {type: 'varchar', unique: true}
    });

    pgm.createTable('nodes_relations', {
        node_id: {type: 'serial', references: 'nodes'},
        type_id: {type: 'char(10)', references: 'relations_types'}
    });
};

exports.down = (pgm) => {
    pgm.dropTable('nodes_relations');
    pgm.dropTable('nodes');
    pgm.dropTable('relations');
};