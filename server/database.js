const MongoClient = require('mongodb').MongoClient;
const assert = require('assert')

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const db = 'puzzly';

const collection = 'puzzles'

// Create a new MongoClient
const client = new MongoClient(url);

// Use connect method to connect to the Server
client.connect().then((client, err) => {
    assert.strictEqual(err, undefined);
    const db = client.db(db);
    const collection = db.use(collection);
  console.log("Connected successfully to server");
});

module.exports = client;
