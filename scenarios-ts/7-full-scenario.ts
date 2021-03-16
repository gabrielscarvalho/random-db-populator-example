import { LastValue, Fixed }  from 'random-db-populator/dist/index';
import { PostgresDatabase }  from 'random-db-populator/dist/index';
import { AutoIncrement, Random, DateGen }  from 'random-db-populator/dist/index';

/**
 * In this scenario we create a whole database and its scenario.
 * The first part of it (configuration of database), I would recommend you to be let splited - then you can reuse it.
 * 
 * The second part I will create 10 orders with consistent data.
*/



// Part 1: Database Configuration:  (When creating your own, split this part in a common file, to be reused)

const database = new PostgresDatabase();
const autoIncrement = new AutoIncrement();

autoIncrement
  .initialId("user.id", 200)
  .initialId("address.id", 200)  
  .initialId("order.id", 200)
  .initialId("order_item.id", 200);

const tUser = database.addTable("t_user")
  .addColumn('id', 'int', autoIncrement.valueGen('user.id'))
  .addColumn('name', 'string', Random.FirstName())
  .addColumn('surname', 'string', Random.LastName())
  .addColumn('email', 'string', Random.Email())
  .addColumn('gender','string', Random.PickOne(['M', 'F']))
  .addColumn('is_active','boolean', Random.Boolean())
  .addColumn('birth', 'date', DateGen.between({ year: { min: 2000, max: 2005 }}))
  .addColumn('created_at', 'datetime', DateGen.between({ year: { min: 2019, max: 2020 }}))
  .addColumn('updated_at', 'raw', Fixed("now()")) // here i am telling that I want to use a value without be parsed. Useful for calling functions.
  .setUniqueKeys('id');


const tAddress = database.addTable("t_address")  
  .addColumn('id', 'int', autoIncrement.valueGen('address.id'))
  .addColumn('user_id', 'int', LastValue(tUser.getColumn('id')))
  .addColumn('street', 'string', Random.Street())
  .addColumn('city', 'string', Random.City())
  .addColumn('country', 'string', Random.Country())
  .addColumn('postcode', 'string', Random.FromRegularExpression(Random.PATTERNS.brazil.POSTAL_CODE))
  .addColumn('phone', 'string', Random.FromRegularExpression(Random.PATTERNS.brazil.PHONE))
  .addColumn('receiver_name','string', Random.FullName())
  .setUniqueKeys('id');


const tOrder = database
  .addTable("t_order")
  .addColumn("id", "int", autoIncrement.valueGen("order.id"))
  .addColumn('user_id', 'int', LastValue(tUser.getColumn('id')))
  .addColumn('delivery_address_id', 'int', LastValue(tAddress.getColumn('id')))
  .addColumn('billing_address_id', 'int', LastValue(tAddress.getColumn('id')))
  .addColumn("total_price", "number", Random.Number(100, 900))
  .addColumn("freight_price", "number", Random.Number(100, 900))
  .addColumn("discount_price", "number", Random.Number(100, 900))
  .addColumn('created_at', 'datetime', DateGen.between({ year: { min: 2019, max: 2020 }}))
  .addColumn('status', 'string', Random.PickOne(['canceled', 'approved']))
  .setUniqueKeys("id");

const tOrderItem = database
  .addTable("t_order_item")
  .addColumn("id", "int", autoIncrement.valueGen("order_item.id"))
  .addColumn('product_name', 'string', Random.Sentence({ words: 3 }))
  .addColumn("order_id", "int", LastValue(tOrder.getColumn("id")))
  .addColumn("total_price", "number", Random.Number(100, 200))
  .addColumn("freight_price", "number", Random.Number(10, 20))
  .addColumn("discount_price", "number", Random.Number(5, 10))
  .setUniqueKeys("id");



// Part 2: Creating the full scenario!



const user1 = database.insert('t_user', { name: 'John', email: 'john@doe.com' }, 'Creating first user');

const deliveryAddress1 = database.insert('t_address');
const billingAddress1 = database.insert('t_address');

const order1 = database.insert('t_order', { 
  delivery_address_id: deliveryAddress1.getRawValue('id'),
  billing_address_id: billingAddress1.getRawValue('id')
});

const order1Item1 = database.insert("t_order_item", { product_name: 'Iphone 12', total_price: 1200 });
const order1Item2 = database.insert("t_order_item", { product_name: 'Tv Samsung', total_price: 2200 });

order1.setRawValue("total_price", order1Item1.getRawValue("total_price") + order1Item2.getRawValue("total_price"));


// In the following example, we don't care about specific details:

database.insert('t_user', {}, 'Add user 2, with 2 orders.');
database.insert('t_address');

database.insert('t_order', {}, 'User 2, 1# order has 3 items');
database.insert('t_order_item');
database.insert('t_order_item');
database.insert('t_order_item');

database.insert('t_order', {}, 'User 2, 2# order has 1 item');
database.insert('t_order_item');



console.log(database.toSQL().join("\n"));

console.log(database.rollback().join("\n"));

// Run to see the result:
// node scenarios/5-make-data-more-realistic-othe-tables.js

// Result

// /* Creating first user */ 
// INSERT INTO "t_user" ("id", "name", "surname", "email", "gender", "is_active", "birth", "created_at", "updated_at") VALUES (201, 'John', 'Banks', 'john@doe.com', 'F', false, '2003-01-20', '2020-07-21 12:00:01', now());
// INSERT INTO "t_address" ("id", "user_id", "street", "city", "country", "postcode", "phone", "receiver_name") VALUES (201, 201, 'Igugi Court', 'Apgisa', 'Marshall Islands', '14981-124', '32 4278-0464', 'Jackson Glover');
// INSERT INTO "t_address" ("id", "user_id", "street", "city", "country", "postcode", "phone", "receiver_name") VALUES (202, 201, 'Bepwi Lane', 'Nijifu', 'Mauritius', '27150-437', '08 3274-8816', 'Francisco Boyd');
// INSERT INTO "t_order" ("id", "user_id", "delivery_address_id", "billing_address_id", "total_price", "freight_price", "discount_price", "created_at", "status") VALUES (201, 201, 201, 202, 3400.00, 883.10, 300.27, '2019-11-13 05:45:29', 'canceled');
// INSERT INTO "t_order_item" ("id", "product_name", "order_id", "total_price", "freight_price", "discount_price") VALUES (201, 'Iphone 12', 201, 1200.00, 16.66, 9.78);
// INSERT INTO "t_order_item" ("id", "product_name", "order_id", "total_price", "freight_price", "discount_price") VALUES (202, 'Tv Samsung', 201, 2200.00, 16.68, 5.77);

// /* Add user 2, with 2 orders. */ 
// INSERT INTO "t_user" ("id", "name", "surname", "email", "gender", "is_active", "birth", "created_at", "updated_at") VALUES (202, 'Jeanette', 'Meyer', 'ze@uzueti.ag', 'M', false, '2005-03-15', '2019-12-27 08:25:34', now());
// INSERT INTO "t_address" ("id", "user_id", "street", "city", "country", "postcode", "phone", "receiver_name") VALUES (203, 202, 'Lefcok Heights', 'Jiwirkid', 'Réunion', '79228-927', '62 0561-1030', 'Alejandro Reyes');
// /* User 2, 1# order has 3 items */ 
// INSERT INTO "t_order" ("id", "user_id", "delivery_address_id", "billing_address_id", "total_price", "freight_price", "discount_price", "created_at", "status") VALUES (202, 202, 203, 203, 432.10, 471.06, 168.75, '2019-03-18 01:18:45', 'canceled');
// INSERT INTO "t_order_item" ("id", "product_name", "order_id", "total_price", "freight_price", "discount_price") VALUES (203, 'Godhi ji onori.', 202, 168.54, 11.96, 9.41);
// INSERT INTO "t_order_item" ("id", "product_name", "order_id", "total_price", "freight_price", "discount_price") VALUES (204, 'Afami hig wac.', 202, 157.90, 17.52, 5.94);
// INSERT INTO "t_order_item" ("id", "product_name", "order_id", "total_price", "freight_price", "discount_price") VALUES (205, 'Elo toj zu.', 202, 108.13, 16.21, 6.02);
// /* User 2, 2# order has 1 item */ 
// INSERT INTO "t_order" ("id", "user_id", "delivery_address_id", "billing_address_id", "total_price", "freight_price", "discount_price", "created_at", "status") VALUES (203, 202, 203, 203, 289.97, 596.91, 264.94, '2019-04-11 08:34:32', 'approved');
// INSERT INTO "t_order_item" ("id", "product_name", "order_id", "total_price", "freight_price", "discount_price") VALUES (206, 'Sirdas la fif.', 203, 149.43, 13.83, 7.03);

// /*  --- ROLLBACK */ 
// DELETE FROM "t_order_item" WHERE "id"=206;
// DELETE FROM "t_order" WHERE "id"=203;
// /* User 2, 2# order has 1 item */ 
// DELETE FROM "t_order_item" WHERE "id"=205;
// DELETE FROM "t_order_item" WHERE "id"=204;
// DELETE FROM "t_order_item" WHERE "id"=203;
// DELETE FROM "t_order" WHERE "id"=202;
// /* User 2, 1# order has 3 items */ 
// DELETE FROM "t_address" WHERE "id"=203;
// DELETE FROM "t_user" WHERE "id"=202;
// /* Add user 2, with 2 orders. */ 
// DELETE FROM "t_order_item" WHERE "id"=202;
// DELETE FROM "t_order_item" WHERE "id"=201;
// DELETE FROM "t_order" WHERE "id"=201;
// DELETE FROM "t_address" WHERE "id"=202;
// DELETE FROM "t_address" WHERE "id"=201;
// DELETE FROM "t_user" WHERE "id"=201;
// /* Creating first user */ 

