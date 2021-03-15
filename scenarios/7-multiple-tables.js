
const { PostgresDatabase } = require('random-db-populator/output/shortcut/database');
const { AutoIncrement, Random, DateGen } = require('random-db-populator/output/shortcut/value-gen');


const database = new PostgresDatabase();

const autoIncrement = new AutoIncrement();

autoIncrement
  .initialId('user.id', 0)
  .initialId('address.id', 0)
  .initialId('order.id', 200);


const tUser = database.addTable('user')
  .addColumn('id', 'int', autoIncrement.valueGen('user.id'))
  .addColumn('name', 'string', Random.Name())
  .addColumn('surname', 'string', Random.LastName())
  .addColumn('email', 'string', Random.Email())
  .addColumn('gender','string', Random.PickOne(['M', 'F']))
  .addColumn('is_active','boolean', Random.Boolean())
  .addColumn('birth', 'date', DateGen.between({ year: { min: 2000, max: 2005 }}))
  .addColumn('updated_at', 'datetime', DateGen.between({ year: { min: 2019, max: 2020 }}))
  .addColumn('created_at', 'datetime', DateGen.between({ year: { min: 2018, max: 2018 }}))
  .setUniqueKeys('id', 'email');

/*
const tAddress = database.addTable('address')
  .addColumn('id', 'int', autoIncrement.valueGen('address.id'))
  .addColumn('user_id', 'int', LastValue(tUser.getColumn('id')))
  .addColumn('receiver', 'string', Random.Name())
  .setUniqueKeys('id');;


const tOrder = database.addTable('order')
  .addColumn('id', 'int', autoIncrement.valueGen('order.id'))
  .addColumn('user_id', 'int', LastValue(tUser.getColumn('id')))
  .addColumn('user_email', 'string', LastValue(tUser.getColumn('email')))
  .addColumn('delivery_address_id', 'int', LastValue(tAddress.getColumn('id')))
  .addColumn('total_price', 'number', Random.Number(100, 900))
  .addColumn('freight_price', 'number', Random.Number(10, 50))
  .addColumn('item_price', 'number', Random.Number(90, 160))
  .addColumn('discount_price', 'number', Random.Number(10, 30))
  .setUniqueKeys('id')
  .afterGenerateData((dataRow: iDataRow) => {

    const freight = dataRow.getRawValue('freight_price');
    const items = dataRow.getRawValue('item_price');
    const discount = dataRow.getRawValue('discount_price');

    dataRow.setRawValue('total_price', (items + freight - discount));
    
    return dataRow;
  });

  /*
database.insert('user', { name: 'John'}, 'Creating first user data');
database.insert('address', {});

database.insert('order', {}, '---- 1st user 3 orders');
database.insert('order', {});
database.insert('order', {});*/


database.insert('user', { name: 'John'});
/*
database.insert('address', {});

database.insert('user', { name: 'Mark'});
database.insert('address', {});

database.insert('user', { name: 'Joe'});
database.insert('address', {});
*/

console.log(database.toSQL().join('\n'));
console.log(database.rollback().join('\n'));

// console.log('hellow'); 

