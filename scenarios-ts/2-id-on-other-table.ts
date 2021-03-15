
import { PostgresDatabase } from 'random-db-populator/dist/index';
import { AutoIncrement, Random, LastValue } from 'random-db-populator/dist/index';

const database = new PostgresDatabase();
const autoIncrement = new AutoIncrement();

/**
 * Observe user.id and address.id.
 * When you create a user, the next address that you created will be related to the last created user.
 * 
*/

autoIncrement
  .initialId('user.id', -100) // Some times you can use negative ids to not affect your environment
  .initialId('address.id', -200);


const tUser = database.addTable('user')
  .addColumn('id', 'int', autoIncrement.valueGen('user.id', -2)) // and you can defined that each new id will be last-2 for example. Default is last+1
  .setUniqueKeys('id');


database.addTable('address')
  .addColumn('id', 'int', autoIncrement.valueGen('address.id'))
  .addColumn('user_id', 'int', LastValue(tUser.getColumn('id'))) // notice here that we are capturing the id of previous user!
  .setUniqueKeys('id');


database.insert('user', { name: 'Mark'});
database.insert('address', {});

database.insert('user', { name: 'Joe'});
database.insert('address', {});


console.log(database.toSQL().join('\n'));
console.log(database.rollback().join('\n'));

// Run to see the result:
// node scenarios/2-id-on-other-table.js

// Result

// INSERT INTO "user" ("id") VALUES (-102);
// INSERT INTO "address" ("id", "user_id") VALUES (-199, -102);
// INSERT INTO "user" ("id") VALUES (-104);
// INSERT INTO "address" ("id", "user_id") VALUES (-198, -104);
// /*  --- ROLLBACK */ 
// DELETE FROM "address" WHERE "id"=-198;
// DELETE FROM "user" WHERE "id"=-104;
// DELETE FROM "address" WHERE "id"=-199;
// DELETE FROM "user" WHERE "id"=-102;
