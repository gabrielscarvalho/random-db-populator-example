import { Database } from 'random-db-populator/dist/index';
import { BooleanParser } from 'random-db-populator/dist/index';
import { DateParser } from 'random-db-populator/dist/index';
import { DateTimeParser } from 'random-db-populator/dist/index';
import { IntParser } from 'random-db-populator/dist/index';
import { NumberParser } from 'random-db-populator/dist/index';
import { RawParser } from 'random-db-populator/dist/index';
import { StringParser } from 'random-db-populator/dist/index';
import { iDatabase, iDataRowParsed } from 'random-db-populator/dist/index';
import { DatabaseReservedWords } from 'random-db-populator/dist/index';

export class MyDatabaseDatabase extends Database implements iDatabase {
 
  public constructor() {
    // change reserved words if your database has any structural diff from Postgres
    const reservedWords = new DatabaseReservedWords();
    super(reservedWords);


    // Add the parsers your database will have :)
    // Check scenarios/3-new-parser.js
    this.addParser(new StringParser(reservedWords));
    this.addParser(new NumberParser(reservedWords));
    this.addParser(new IntParser(reservedWords));
    this.addParser(new DateParser(reservedWords));
    this.addParser(new DateTimeParser(reservedWords));
    this.addParser(new RawParser(reservedWords));
    this.addParser(new BooleanParser(reservedWords));
  }

  /**
   * How its a comment in you db?
  */
  protected createComment(comment: string): string {
    return `/* ${comment} */ `;
  }


  /**
   * How is the insert structure ?
  */
  protected createInsertQuery(dataRow: iDataRowParsed) : string {

    // dataRow.values is a NamedMap (/utils/map.ts) which contains parsed column name => parsed column value.
    const columns: string = dataRow.values.getKeys().join(', ');   
    const values: string  = dataRow.values.getValues().join(', ');
   
    // iDataRowParsed gives you only parsed values, so you don't need to worry about it here. Just use the values.
    const table = dataRow.tableName;

    return `INSERT INTO TABLE ${table} THE COLUMNS (${columns}) RECEIVE THE VALUES (${values});`;
  }

  protected createDeleteQuery(dataRow: iDataRowParsed): string {
    const tableName = dataRow.tableName;
    
    const whereData: string[] = [];

    // dataRow.unique contains all columns that was marked as uniqueKey. 
    // database.addColumn(...).setUniqueKeys('columnName')
    dataRow.unique.forEachEntry((columnName: string, value: string) => {
      whereData.push(`${columnName}=${value}`);
    });

    const where = whereData.join(' AND ');

    return `DELETE FROM TABLE ${tableName} WHERE THE CONDITIONS ${where};`;
  }
}