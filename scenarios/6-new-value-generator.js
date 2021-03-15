
const { PostgresDatabase } = require('random-db-populator/output/shortcut/database');

/**
 * Sometimes you might want to create you own value generator.
 * You just need to create a function that will return the falue.
*/

const MyValueGen = (val) => {
  return () => { 
    return Math.random() + val > 0.5 ? 'bigger than 0.5' : 'lower than 0.5';
  }
}
  
const MyValueGen2 = () => {
  return Math.random();
}

const database = new PostgresDatabase();


database.addTable('user')
  .addColumn('probability', 'string', MyValueGen(0.1)) //the value here must be a () => val
  .addColumn('probability2', 'number', MyValueGen2); // here we have the same, valid. But you cannot execute it as the line above, because will not return a () => value, but simply value.

database.insert('user');


console.log(database.toSQL().join('\n'));

// Run to see the result:
// node scenarios/6-new-value-generator.js

// Result:
// INSERT INTO "user" ("probability", "probability2") VALUES ('lower than 0.5', 0.75);
