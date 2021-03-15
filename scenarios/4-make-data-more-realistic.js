const { PostgresDatabase } = require("random-db-populator/output/shortcut/database");
const { AutoIncrement, Random } = require("random-db-populator/output/shortcut/value-gen");

/**
 * In this scenario, we have a function that is called after the data is generated.
 * You can apply new values to it, to make it more realistic.
 * In this case, it is really calculating the total price of an order.
 * 
*/

const database = new PostgresDatabase();
const autoIncrement = new AutoIncrement();

autoIncrement.initialId("order.id", 200);

database
  .addTable("order")
  .addColumn("id", "int", autoIncrement.valueGen("order.id"))
  .addColumn("total_price", "number", Random.Number(100, 900))
  .addColumn("freight_price", "number", Random.Number(10, 50))
  .addColumn("item_price", "number", Random.Number(90, 160))
  .addColumn("discount_price", "number", Random.Number(10, 30))
  .setUniqueKeys("id")
  .afterGenerateData((dataRow) => {
    const freight = dataRow.getRawValue("freight_price");
    const items = dataRow.getRawValue("item_price");
    const discount = dataRow.getRawValue("discount_price");

    dataRow.setRawValue("total_price", items + freight - discount);

    return dataRow;
  });

database.insert("order", {});
database.insert("order", {});
database.insert("order", {});

console.log(database.toSQL().join("\n"));

// Run to see the result:
// node scenarios/4-make-data-more-realistic.js