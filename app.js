require('dotenv').config();

const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;  
const client = new MongoClient(uri);


async function connectToMongoDB() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
        // return client.db();
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    } finally {
        await client.close();
        console.log('Connection closed');
    }
}

module.exports = { connectToMongoDB }
