import { AutoIncrement, Random } from 'random-db-populator/dist/index';
import { MyDatabaseDatabase } from './8-create-my-database';


const database = new MyDatabaseDatabase();

const autoIncrement = new AutoIncrement();

autoIncrement
  .initialId('user.id', 10); // First will be id = 11

database.addTable('user')
  .addColumn('id', 'int', autoIncrement.valueGen('user.id'))
  .addColumn('name', 'string', Random.FirstName())
  .setUniqueKeys('id', 'name');

database.insert('user', { name: 'Paul'});


console.log(database.toSQL().join('\n'));
console.log(database.rollback().join('\n'));

// Run to see the result:
// ts-node scenarios-ts/8.1-my-database-usage.ts 

// Result
// INSERT INTO TABLE "user" THE COLUMNS ("id", "name") RECEIVE THE VALUES (11, 'Paul');
// /*  --- ROLLBACK */ 
// DELETE FROM TABLE "user" WHERE THE CONDITIONS "id"=11 AND "name"='Paul';






