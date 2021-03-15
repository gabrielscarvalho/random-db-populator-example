
const { PostgresDatabase } = require('random-db-populator/output/shortcut/database');
const { AutoIncrement, Random, DateGen } = require('random-db-populator/output/shortcut/value-gen');
const { Parser } = require('random-db-populator/output/shortcut/parser');


/**
 * Sometimes the default parsers will not help you. But you can create your own.
 * In this example, we want a parser that return the value with '---'
 * 
*/

class MyParser extends Parser {
  
  constructor(reservedWords) {
    super(reservedWords);
    this.type = 'my-parser';
    this.description = 'Parse to my specific format.';
  }

  parse(val) {
    return this.addQuotes(`--- ${val} ---`);
  }
}


const database = new PostgresDatabase();
database.addParser(new MyParser(database.reservedWords));


database.addTable('user')
  .addColumn('last-name', 'my-parser', Random.LastName())

database.insert('user', { name: 'John', email: 'john@doe.com' });


//We can check all parsers too
console.log("Available parsers: ");
database.printParsers()
console.log(database.toSQL().join('\n'));

// Run to see the result:
// node scenarios/3-new-parser.js


