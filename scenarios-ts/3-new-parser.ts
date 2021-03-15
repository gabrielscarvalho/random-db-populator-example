
const { PostgresDatabase } = require('random-db-populator/dist/index');
const { AutoIncrement, Random, DateGen } = require('random-db-populator/dist/index');
const { Parser } = require('random-db-populator/dist/index');


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



console.log(database.toSQL().join('\n'));
//We can check all parsers too
console.log("Available parsers: ");
database.printParsers()

// Run to see the result:
// node scenarios/3-new-parser.js


// Result 
// INSERT INTO "user" ("last-name") VALUES ('--- Lucas ---');

// Available parsers: 
// |-- PARSERS ------------------------
// 	string                         Parse as simple string
// 	number                         Parse number to number with precision: 2
// 	int                            Parse number to int
// 	date                           Parse date to format: "YYYY-MM-DD"
// 	datetime                       Parse date to format: "YYYY-MM-DD hh:mm:ss"
// 	raw                            Will not parse. The received value will be used directly on the query. You can use this type to send functions, like NOW()
// 	boolean                        Parses values to boolean.
// 	my-parser                      Parse to my specific format.

