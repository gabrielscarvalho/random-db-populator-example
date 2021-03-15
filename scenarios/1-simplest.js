
const { Fixed } = require('random-db-populator/output/core/value-generator/fixed');
const { PostgresDatabase } = require('random-db-populator/output/shortcut/database');
const { AutoIncrement, Random, DateGen } = require('random-db-populator/output/shortcut/value-gen');


/**
 * Simplest scenario.
 * Observe how it allows you to have a lot variety of random values.
 * And for your database scenario, you only need to inform what you need to be specific.
 * 
 * In this case:
 * I wanted 3 users. John which has the email: 'john@doe.com', Paul and Sarah.
 * 
*/

const database = new PostgresDatabase();

const autoIncrement = new AutoIncrement();

autoIncrement
  .initialId('user.id', 10); // First will be id = 11


database.addTable('user')
  .addColumn('id', 'int', autoIncrement.valueGen('user.id'))
  .addColumn('name', 'string', Random.Name())
  .addColumn('surname', 'string', Random.LastName())
  .addColumn('email', 'string', Random.Email())
  .addColumn('gender','string', Random.PickOne(['M', 'F']))
  .addColumn('is_active','boolean', Random.Boolean())
  .addColumn('birth', 'date', DateGen.between({ year: { min: 2000, max: 2005 }}))
  .addColumn('updated_at', 'datetime', DateGen.between({ year: { min: 2019, max: 2020 }}))
  .addColumn('created_at', 'raw', Fixed("now()")) // here i am telling that I want to use a value without be parsed. Useful for calling functions.
  .addColumn('phone', 'string', Fixed("00 103-42013")) // sometimes you might just want a fixed value too. Use it calling fixed("val")
  .setUniqueKeys('id', 'email');


database.insert('user', { name: 'John', email: 'john@doe.com' });
database.insert('user', { name: 'Paul'});
database.insert('user', { name: 'Sarah'});


console.log(database.toSQL().join('\n'));
console.log(database.rollback().join('\n'));

// Run to see the result:
// node scenarios/1-simplest.js 

// Result:
// INSERT INTO "user" ("id", "name", "surname", "email", "gender", "is_active", "birth", "updated_at", "created_at", "phone") VALUES (11, 'John', 'Austin', 'john@doe.com', 'M', true, '2002-12-10', '2019-02-12 12:26:04', now(), '00 103-42013');
// INSERT INTO "user" ("id", "name", "surname", "email", "gender", "is_active", "birth", "updated_at", "created_at", "phone") VALUES (12, 'Paul', 'Nguyen', 'teged@ritnurka.ni', 'F', false, '2003-05-01', '2019-02-25 07:32:49', now(), '00 103-42013');
// INSERT INTO "user" ("id", "name", "surname", "email", "gender", "is_active", "birth", "updated_at", "created_at", "phone") VALUES (13, 'Sarah', 'Love', 'cuv@kel.cl', 'F', false, '2004-08-13', '2019-08-10 12:46:11', now(), '00 103-42013');
// /*  --- ROLLBACK */ 
// DELETE FROM "user" WHERE "id"=13 AND "email"='cuv@kel.cl';
// DELETE FROM "user" WHERE "id"=12 AND "email"='teged@ritnurka.ni';
// DELETE FROM "user" WHERE "id"=11 AND "email"='john@doe.com';





