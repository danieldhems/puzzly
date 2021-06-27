const MongoClient = require('mongodb').MongoClient;
const assert = require('assert')

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'puzzly';

const collection = 'puzzles'

// Create a new MongoClient
const client = new MongoClient(url);

// Use connect method to connect to the Server
client.connect().then((client, err) => {
    console.log(client, err)
    assert.strictEqual(err, undefined)
  console.log("Connected successfully to server");
});

module.exports = client;
