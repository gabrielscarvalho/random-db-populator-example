const { LastValue } = require('random-db-populator/output/core/value-generator/last-value');
const { PostgresDatabase } = require("random-db-populator/output/shortcut/database");
const { AutoIncrement, Random } = require("random-db-populator/output/shortcut/value-gen");

/**
 * In this scenario, we generate values in other table, that should affect the total price of our "order" table.
*/

const database = new PostgresDatabase();
const autoIncrement = new AutoIncrement();

autoIncrement.initialId("order.id", 200);
autoIncrement.initialId("order_item.id", 200);

const tOrder = database
  .addTable("order")
  .addColumn("id", "int", autoIncrement.valueGen("order.id"))
  .addColumn("total_price", "number", Random.Number(100, 900))
  .setUniqueKeys("id");

database
  .addTable("order_item")
  .addColumn("id", "int", autoIncrement.valueGen("order_item.id"))
  .addColumn("order_id", "int", LastValue(tOrder.getColumn("id")))
  .addColumn("total_price", "number", Random.Number(100, 200))
  .setUniqueKeys("id");


const order = database.insert("order", {});
const item1 = database.insert("order_item", {});
const item2 = database.insert("order_item", {});

// here we can fix the value, making order total price to be the sum of items price.
order.setRawValue("total_price", item1.getRawValue("total_price") + item2.getRawValue("total_price"));


console.log(database.toSQL().join("\n"));

// Run to see the result:
// node scenarios/5-make-data-more-realistic-othe-tables.js

// Result

// INSERT INTO "order" ("id", "total_price") VALUES (201, 269.32);
// INSERT INTO "order_item" ("id", "order_id", "total_price") VALUES (201, 201, 142.51);
// INSERT INTO "order_item" ("id", "order_id", "total_price") VALUES (202, 201, 126.81);
