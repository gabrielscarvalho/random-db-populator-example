import { LastValue, Fixed }  from 'random-db-populator/dist/index';
import { PostgresDatabase }  from 'random-db-populator/dist/index';
import { AutoIncrement, Random, DateGen }  from 'random-db-populator/dist/index';


// Database Configuration

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


export {
  database
};
