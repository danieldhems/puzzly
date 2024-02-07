const MongoClient = require('mongodb').MongoClient;
const assert = require('assert')

// Connection URL
const url = 'mongodb://localhost:27017';
const API_KEY = 'gSM5sBXJ2nYl8bOqpZUYSX6KF7mLqbjGkwmVqdEFzY90DT7gTMm1XwEowKRi8qyI';
// const url = 'https://data.mongodb-api.com/app/data-vqdlp/endpoint/data/beta';

// Database Name
const db = 'puzzly';

const collection = 'puzzles'
const username = 'admin';
const password = 'mxb8YOWC0uM68RVO';

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
