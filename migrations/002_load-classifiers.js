exports.up = function up(pgm) {
    pgm.sql("insert into relations_types(id, name, reverse_name) values('parent', 'parent', 'daughter');");
    pgm.sql("insert into relations_types(id, name, reverse_name) values('daughter', 'daughter', 'parent');");
    pgm.sql("insert into relations_types(id, name, reverse_name) values('sister', 'sister', 'sister');");
};

exports.down = function down(pgm) {
    pgm.sql('delete from relations_types;');
};