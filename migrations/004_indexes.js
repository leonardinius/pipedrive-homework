exports.up = (pgm) => {
    pgm.sql('CREATE INDEX lower_case_nodes_name ON nodes USING BTREE (lower(name));');
};

exports.down = (pgm) => {
    pgm.sql('DROP INDEX lower_case_nodes_name;');
};