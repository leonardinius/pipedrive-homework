exports.up = (pgm) => {
    pgm.sql("insert into types(id, name, reverse_name) values('parent', 'parent', 'daughter');");
    pgm.sql("insert into types(id, name, reverse_name) values('daughter', 'daughter', 'parent');");
    pgm.sql("insert into types(id, name, reverse_name) values('sister', 'sister', 'sister');");
};

exports.down = (pgm) => {
    pgm.sql('delete from types;');
};