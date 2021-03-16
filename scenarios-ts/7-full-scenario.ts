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


// Now the other non specific data:

for (let i = 2; i <= 10; i++) {

  database.insert('t_user', {}, `Add user ${i}/10`);
  database.insert('t_address');
  
  database.insert('t_order', {}, `User ${i} - order`);
  database.insert('t_order_item');
  database.insert('t_order_item');

}



console.log(database.toSQL().join("\n"));

console.log(database.rollback().join("\n"));

// Run to see the result:
// node scenarios/5-make-data-more-realistic-othe-tables.js

// Result

// /* Creating first user */ 
// INSERT INTO "t_user" ("id", "name", "surname", "email", "gender", "is_active", "birth", "created_at", "updated_at") VALUES (201, 'John', 'French', 'john@doe.com', 'F', true, '2000-03-14', '2020-09-26 02:49:30', now());
// INSERT INTO "t_address" ("id", "user_id", "street", "city", "country", "postcode", "phone", "receiver_name") VALUES (201, 201, 'Apeca Avenue', 'Ezocejuze', 'French Polynesia', '41498-399', '28 0098-0426', 'Frank Lambert');
// INSERT INTO "t_address" ("id", "user_id", "street", "city", "country", "postcode", "phone", "receiver_name") VALUES (202, 201, 'Cinte Point', 'Gupzehu', 'Madagascar', '75938-736', '68 5610-2625', 'Marcus Stephens');
// INSERT INTO "t_order" ("id", "user_id", "delivery_address_id", "billing_address_id", "total_price", "freight_price", "discount_price", "created_at", "status") VALUES (201, 201, 201, 202, 3400.00, 538.77, 781.74, '2020-03-21 05:53:37', 'approved');
// INSERT INTO "t_order_item" ("id", "product_name", "order_id", "total_price", "freight_price", "discount_price") VALUES (201, 'Iphone 12', 201, 1200.00, 17.30, 8.53);
// INSERT INTO "t_order_item" ("id", "product_name", "order_id", "total_price", "freight_price", "discount_price") VALUES (202, 'Tv Samsung', 201, 2200.00, 18.15, 5.60);
// /* Add user 2/10 */ 
// INSERT INTO "t_user" ("id", "name", "surname", "email", "gender", "is_active", "birth", "created_at", "updated_at") VALUES (202, 'Jay', 'Pittman', 'ruppu@mirsaj.bn', 'M', true, '2004-08-22', '2019-08-18 03:43:26', now());
// INSERT INTO "t_address" ("id", "user_id", "street", "city", "country", "postcode", "phone", "receiver_name") VALUES (203, 202, 'Mifu Mill', 'Gataja', 'Mauritania', '55053-578', '65 1888-1970', 'Antonio Garcia');
// /* User 2 - order */ 
// INSERT INTO "t_order" ("id", "user_id", "delivery_address_id", "billing_address_id", "total_price", "freight_price", "discount_price", "created_at", "status") VALUES (202, 202, 203, 203, 434.21, 899.21, 760.68, '2020-12-23 04:57:08', 'approved');
// INSERT INTO "t_order_item" ("id", "product_name", "order_id", "total_price", "freight_price", "discount_price") VALUES (203, 'Gefunamod nuj homvuw.', 202, 138.48, 16.97, 9.85);
// INSERT INTO "t_order_item" ("id", "product_name", "order_id", "total_price", "freight_price", "discount_price") VALUES (204, 'Pawzu sisa dupanpeb.', 202, 159.32, 19.29, 5.55);
// /* Add user 3/10 */ 
// INSERT INTO "t_user" ("id", "name", "surname", "email", "gender", "is_active", "birth", "created_at", "updated_at") VALUES (203, 'Glenn', 'Russell', 'juhcisow@ome.md', 'F', true, '2000-03-06', '2020-08-08 02:57:18', now());
// INSERT INTO "t_address" ("id", "user_id", "street", "city", "country", "postcode", "phone", "receiver_name") VALUES (204, 203, 'Fola Junction', 'Migtizop', 'Ghana', '34792-516', '16 6985-2069', 'Dominic Williams');
// /* User 3 - order */ 
// INSERT INTO "t_order" ("id", "user_id", "delivery_address_id", "billing_address_id", "total_price", "freight_price", "discount_price", "created_at", "status") VALUES (203, 203, 204, 204, 802.92, 776.39, 108.45, '2020-01-26 12:18:09', 'canceled');
// INSERT INTO "t_order_item" ("id", "product_name", "order_id", "total_price", "freight_price", "discount_price") VALUES (205, 'Nuwov cejgozgum wocobwu.', 203, 174.61, 13.01, 5.14);
// INSERT INTO "t_order_item" ("id", "product_name", "order_id", "total_price", "freight_price", "discount_price") VALUES (206, 'Fuzpa zelero dakak.', 203, 157.58, 13.74, 6.22);
// /* Add user 4/10 */ 
// INSERT INTO "t_user" ("id", "name", "surname", "email", "gender", "is_active", "birth", "created_at", "updated_at") VALUES (204, 'Alfred', 'Waters', 'av@jedwa.al', 'M', false, '2003-11-23', '2020-12-04 01:58:04', now());
// INSERT INTO "t_address" ("id", "user_id", "street", "city", "country", "postcode", "phone", "receiver_name") VALUES (205, 204, 'Jijwuk Extension', 'Eljuir', 'French Guiana', '67007-675', '95 8715-6154', 'Joel Riley');
// /* User 4 - order */ 
// INSERT INTO "t_order" ("id", "user_id", "delivery_address_id", "billing_address_id", "total_price", "freight_price", "discount_price", "created_at", "status") VALUES (204, 204, 205, 205, 760.10, 658.79, 281.59, '2020-01-02 09:36:45', 'canceled');
// INSERT INTO "t_order_item" ("id", "product_name", "order_id", "total_price", "freight_price", "discount_price") VALUES (207, 'Kialaof ecu oc.', 204, 135.26, 14.81, 8.12);
// INSERT INTO "t_order_item" ("id", "product_name", "order_id", "total_price", "freight_price", "discount_price") VALUES (208, 'Pi merigob if.', 204, 136.82, 17.78, 8.56);
// /* Add user 5/10 */ 
// INSERT INTO "t_user" ("id", "name", "surname", "email", "gender", "is_active", "birth", "created_at", "updated_at") VALUES (205, 'Warren', 'Ruiz', 'pi@vockur.bz', 'F', true, '2002-12-11', '2019-05-10 07:44:53', now());
// INSERT INTO "t_address" ("id", "user_id", "street", "city", "country", "postcode", "phone", "receiver_name") VALUES (206, 205, 'Nojro Heights', 'Woomiru', 'United Arab Emirates', '94554-557', '75 3555-6055', 'Christian Williamson');
// /* User 5 - order */ 
// INSERT INTO "t_order" ("id", "user_id", "delivery_address_id", "billing_address_id", "total_price", "freight_price", "discount_price", "created_at", "status") VALUES (205, 205, 206, 206, 779.39, 835.52, 824.91, '2020-01-16 08:00:27', 'approved');
// INSERT INTO "t_order_item" ("id", "product_name", "order_id", "total_price", "freight_price", "discount_price") VALUES (209, 'Fildocdih levpipaj titbaine.', 205, 163.95, 15.64, 9.11);
// INSERT INTO "t_order_item" ("id", "product_name", "order_id", "total_price", "freight_price", "discount_price") VALUES (210, 'Zemwifig darid noduwaf.', 205, 197.38, 15.59, 7.22);
// /* Add user 6/10 */ 
// INSERT INTO "t_user" ("id", "name", "surname", "email", "gender", "is_active", "birth", "created_at", "updated_at") VALUES (206, 'Dale', 'Murphy', 'wo@zadozig.sd', 'M', true, '2004-09-10', '2020-03-27 07:03:59', now());
// INSERT INTO "t_address" ("id", "user_id", "street", "city", "country", "postcode", "phone", "receiver_name") VALUES (207, 206, 'Jaone Key', 'Hawgipzu', 'South Georgia & South Sandwich Islands', '58525-150', '35 4523-9027', 'Edgar Santos');
// /* User 6 - order */ 
// INSERT INTO "t_order" ("id", "user_id", "delivery_address_id", "billing_address_id", "total_price", "freight_price", "discount_price", "created_at", "status") VALUES (206, 206, 207, 207, 198.35, 195.79, 510.64, '2019-09-24 01:24:45', 'approved');
// INSERT INTO "t_order_item" ("id", "product_name", "order_id", "total_price", "freight_price", "discount_price") VALUES (211, 'Kuvunu cihi gawekuw.', 206, 110.08, 18.93, 8.04);
// INSERT INTO "t_order_item" ("id", "product_name", "order_id", "total_price", "freight_price", "discount_price") VALUES (212, 'Boz kefle hi.', 206, 191.31, 14.67, 7.49);
// /* Add user 7/10 */ 
// INSERT INTO "t_user" ("id", "name", "surname", "email", "gender", "is_active", "birth", "created_at", "updated_at") VALUES (207, 'Luke', 'Maldonado', 'piohe@altop.ae', 'M', false, '2000-07-27', '2019-12-03 09:38:37', now());
// INSERT INTO "t_address" ("id", "user_id", "street", "city", "country", "postcode", "phone", "receiver_name") VALUES (208, 207, 'Ohowe View', 'Sizacceg', 'United States', '10867-612', '21 1404-0279', 'Thomas Stephens');
// /* User 7 - order */ 
// INSERT INTO "t_order" ("id", "user_id", "delivery_address_id", "billing_address_id", "total_price", "freight_price", "discount_price", "created_at", "status") VALUES (207, 207, 208, 208, 232.53, 162.34, 207.84, '2020-06-04 03:41:34', 'approved');
// INSERT INTO "t_order_item" ("id", "product_name", "order_id", "total_price", "freight_price", "discount_price") VALUES (213, 'Os luoniep ehineusa.', 207, 124.60, 13.92, 5.22);
// INSERT INTO "t_order_item" ("id", "product_name", "order_id", "total_price", "freight_price", "discount_price") VALUES (214, 'Miritanic zitde newvuj.', 207, 181.65, 14.70, 7.18);
// /* Add user 8/10 */ 
// INSERT INTO "t_user" ("id", "name", "surname", "email", "gender", "is_active", "birth", "created_at", "updated_at") VALUES (208, 'Howard', 'Lindsey', 'tejarek@gomipo.gb', 'M', false, '2005-09-28', '2020-11-06 11:30:10', now());
// INSERT INTO "t_address" ("id", "user_id", "street", "city", "country", "postcode", "phone", "receiver_name") VALUES (209, 208, 'Hicov Trail', 'Kofumno', 'Brunei', '10727-453', '42 1293-7354', 'Gary Reid');
// /* User 8 - order */ 
// INSERT INTO "t_order" ("id", "user_id", "delivery_address_id", "billing_address_id", "total_price", "freight_price", "discount_price", "created_at", "status") VALUES (208, 208, 209, 209, 768.29, 525.42, 727.03, '2019-09-21 11:04:49', 'canceled');
// INSERT INTO "t_order_item" ("id", "product_name", "order_id", "total_price", "freight_price", "discount_price") VALUES (215, 'Uzovaw ho hat.', 208, 124.21, 17.32, 5.68);
// INSERT INTO "t_order_item" ("id", "product_name", "order_id", "total_price", "freight_price", "discount_price") VALUES (216, 'Izulap kutgatpi ofunoban.', 208, 169.28, 10.74, 5.71);
// /* Add user 9/10 */ 
// INSERT INTO "t_user" ("id", "name", "surname", "email", "gender", "is_active", "birth", "created_at", "updated_at") VALUES (209, 'Jesus', 'Klein', 'focga@zoezone.uz', 'F', false, '2003-02-04', '2019-08-22 03:48:27', now());
// INSERT INTO "t_address" ("id", "user_id", "street", "city", "country", "postcode", "phone", "receiver_name") VALUES (210, 209, 'Tuus Highway', 'Zibwicek', 'Kazakhstan', '20261-010', '65 5327-1831', 'Alan Bell');
// /* User 9 - order */ 
// INSERT INTO "t_order" ("id", "user_id", "delivery_address_id", "billing_address_id", "total_price", "freight_price", "discount_price", "created_at", "status") VALUES (209, 209, 210, 210, 192.92, 407.32, 864.88, '2019-02-28 06:10:35', 'approved');
// INSERT INTO "t_order_item" ("id", "product_name", "order_id", "total_price", "freight_price", "discount_price") VALUES (217, 'Ru suer tujcip.', 209, 137.33, 13.73, 6.35);
// INSERT INTO "t_order_item" ("id", "product_name", "order_id", "total_price", "freight_price", "discount_price") VALUES (218, 'Dadku veidebif ra.', 209, 112.34, 11.97, 8.38);
// /* Add user 10/10 */ 
// INSERT INTO "t_user" ("id", "name", "surname", "email", "gender", "is_active", "birth", "created_at", "updated_at") VALUES (210, 'Travis', 'Moreno', 'upi@ab.no', 'F', true, '2004-01-12', '2020-08-06 12:46:23', now());
// INSERT INTO "t_address" ("id", "user_id", "street", "city", "country", "postcode", "phone", "receiver_name") VALUES (211, 210, 'Jejub Circle', 'Suvoku', 'France', '38752-728', '55 5669-4454', 'Matthew Reed');
// /* User 10 - order */ 
// INSERT INTO "t_order" ("id", "user_id", "delivery_address_id", "billing_address_id", "total_price", "freight_price", "discount_price", "created_at", "status") VALUES (210, 210, 211, 211, 839.07, 225.10, 122.09, '2020-11-17 08:46:30', 'approved');
// INSERT INTO "t_order_item" ("id", "product_name", "order_id", "total_price", "freight_price", "discount_price") VALUES (219, 'Ifubaak af ermup.', 210, 126.63, 12.78, 8.82);
// INSERT INTO "t_order_item" ("id", "product_name", "order_id", "total_price", "freight_price", "discount_price") VALUES (220, 'Ride sosuiru nik.', 210, 151.86, 13.24, 6.41);
// /*  --- ROLLBACK */ 
// DELETE FROM "t_order_item" WHERE "id"=220;
// DELETE FROM "t_order_item" WHERE "id"=219;
// DELETE FROM "t_order" WHERE "id"=210;
// /* User 10 - order */ 
// DELETE FROM "t_address" WHERE "id"=211;
// DELETE FROM "t_user" WHERE "id"=210;
// /* Add user 10/10 */ 
// DELETE FROM "t_order_item" WHERE "id"=218;
// DELETE FROM "t_order_item" WHERE "id"=217;
// DELETE FROM "t_order" WHERE "id"=209;
// /* User 9 - order */ 
// DELETE FROM "t_address" WHERE "id"=210;
// DELETE FROM "t_user" WHERE "id"=209;
// /* Add user 9/10 */ 
// DELETE FROM "t_order_item" WHERE "id"=216;
// DELETE FROM "t_order_item" WHERE "id"=215;
// DELETE FROM "t_order" WHERE "id"=208;
// /* User 8 - order */ 
// DELETE FROM "t_address" WHERE "id"=209;
// DELETE FROM "t_user" WHERE "id"=208;
// /* Add user 8/10 */ 
// DELETE FROM "t_order_item" WHERE "id"=214;
// DELETE FROM "t_order_item" WHERE "id"=213;
// DELETE FROM "t_order" WHERE "id"=207;
// /* User 7 - order */ 
// DELETE FROM "t_address" WHERE "id"=208;
// DELETE FROM "t_user" WHERE "id"=207;
// /* Add user 7/10 */ 
// DELETE FROM "t_order_item" WHERE "id"=212;
// DELETE FROM "t_order_item" WHERE "id"=211;
// DELETE FROM "t_order" WHERE "id"=206;
// /* User 6 - order */ 
// DELETE FROM "t_address" WHERE "id"=207;
// DELETE FROM "t_user" WHERE "id"=206;
// /* Add user 6/10 */ 
// DELETE FROM "t_order_item" WHERE "id"=210;
// DELETE FROM "t_order_item" WHERE "id"=209;
// DELETE FROM "t_order" WHERE "id"=205;
// /* User 5 - order */ 
// DELETE FROM "t_address" WHERE "id"=206;
// DELETE FROM "t_user" WHERE "id"=205;
// /* Add user 5/10 */ 
// DELETE FROM "t_order_item" WHERE "id"=208;
// DELETE FROM "t_order_item" WHERE "id"=207;
// DELETE FROM "t_order" WHERE "id"=204;
// /* User 4 - order */ 
// DELETE FROM "t_address" WHERE "id"=205;
// DELETE FROM "t_user" WHERE "id"=204;
// /* Add user 4/10 */ 
// DELETE FROM "t_order_item" WHERE "id"=206;
// DELETE FROM "t_order_item" WHERE "id"=205;
// DELETE FROM "t_order" WHERE "id"=203;
// /* User 3 - order */ 
// DELETE FROM "t_address" WHERE "id"=204;
// DELETE FROM "t_user" WHERE "id"=203;
// /* Add user 3/10 */ 
// DELETE FROM "t_order_item" WHERE "id"=204;
// DELETE FROM "t_order_item" WHERE "id"=203;
// DELETE FROM "t_order" WHERE "id"=202;
// /* User 2 - order */ 
// DELETE FROM "t_address" WHERE "id"=203;
// DELETE FROM "t_user" WHERE "id"=202;
// /* Add user 2/10 */ 
// DELETE FROM "t_order_item" WHERE "id"=202;
// DELETE FROM "t_order_item" WHERE "id"=201;
// DELETE FROM "t_order" WHERE "id"=201;
// DELETE FROM "t_address" WHERE "id"=202;
// DELETE FROM "t_address" WHERE "id"=201;
// DELETE FROM "t_user" WHERE "id"=201;
// /* Creating first user */ 