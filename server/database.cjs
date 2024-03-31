const MongoClient = require("mongodb").MongoClient;

const dbConfig = {
    protocol: 'mongodb+srv://',
    url: 'cluster0.0t6gvus.mongodb.net',
    queryParams: 'retryWrites=true&w=majority&appName=Cluster0',
    username: 'danhems87',
    password: 'GCo4jTrojM01vhRr'
}

const url = `${dbConfig.protocol}${dbConfig.username}:${dbConfig.password}@${dbConfig.url}/?${dbConfig.queryParams}`;

module.exports.default = new MongoClient(url);
