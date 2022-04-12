var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/';
MongoClient.connect(url, async function (err, db) {
  if (err) throw err;
  dbo = db.db('travelsocial');
  dbo.collection('followings').createIndex({ user: 1 });
  dbo.collection('followings').createIndex({ following: 1 });
  db.close();

  console.log('db close');
});
