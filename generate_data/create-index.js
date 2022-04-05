var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/';
MongoClient.connect(url, async function (err, db) {
  if (err) throw err;
  dbo = db.db('travelsocial');
  dbo
    .collection('places')
    .createIndex({ name: 'text', formattedAddress: 'text' });
  db.close();

  console.log('db close');
});
