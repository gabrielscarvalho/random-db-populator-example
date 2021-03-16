import { database } from './config-database';

// Part 2: Query builder

database.insert('t_user', { name: 'John', email: 'john@doe.com' }, 'Creating first user');

const deliveryAddress1 = database.insert('t_address');
const billingAddress1 = database.insert('t_address');

const order1 = database.insert('t_order', { 
  delivery_address_id: deliveryAddress1.getRawValue('id'),
  billing_address_id: billingAddress1.getRawValue('id')
});

const order1Item1 = database.insert("t_order_item", { product_name: 'Iphone 12', total_price: 1200 });
const order1Item2 = database.insert("t_order_item", { product_name: 'Tv Samsung', total_price: 2200 });

order1.setRawValue("total_price", order1Item1.getRawValue("total_price") + order1Item2.getRawValue("total_price"));



console.log(database.toSQL().join("\n"));
console.log(database.rollback().join("\n"));

// Run ts-node ts-organized-example/my-query-builder.ts

// Result

// /* Creating first user */ 
// INSERT INTO "t_user" ("id", "name", "surname", "email", "gender", "is_active", "birth", "created_at", "updated_at") VALUES (201, 'John', 'Flores', 'john@doe.com', 'M', true, '2004-09-13', '2020-03-01 12:39:55', now());
// INSERT INTO "t_address" ("id", "user_id", "street", "city", "country", "postcode", "phone", "receiver_name") VALUES (201, 201, 'Ovve Circle', 'Huvezba', 'Botswana', '03277-050', '93 6695-1304', 'Brandon Salazar');
// INSERT INTO "t_address" ("id", "user_id", "street", "city", "country", "postcode", "phone", "receiver_name") VALUES (202, 201, 'Semi Highway', 'Cavhenlo', 'Israel', '87504-514', '93 8803-0253', 'Jorge Stevens');
// INSERT INTO "t_order" ("id", "user_id", "delivery_address_id", "billing_address_id", "total_price", "freight_price", "discount_price", "created_at", "status") VALUES (201, 201, 201, 202, 3400.00, 875.18, 834.74, '2020-12-28 12:54:48', 'approved');
// INSERT INTO "t_order_item" ("id", "product_name", "order_id", "total_price", "freight_price", "discount_price") VALUES (201, 'Iphone 12', 201, 1200.00, 11.71, 8.88);
// INSERT INTO "t_order_item" ("id", "product_name", "order_id", "total_price", "freight_price", "discount_price") VALUES (202, 'Tv Samsung', 201, 2200.00, 18.30, 6.01);
// /*  --- ROLLBACK */ 
// DELETE FROM "t_order_item" WHERE "id"=202;
// DELETE FROM "t_order_item" WHERE "id"=201;
// DELETE FROM "t_order" WHERE "id"=201;
// DELETE FROM "t_address" WHERE "id"=202;
// DELETE FROM "t_address" WHERE "id"=201;
// DELETE FROM "t_user" WHERE "id"=201;
// /* Creating first user */ 
