const mongoClient = require('mongodb').MongoClient;
const dotenv = require("dotenv");

dotenv.config();

const state = {
    db: null
}

module.exports.connect = function (done) {
    const url = process.env.MONGODB_URL;
    
    mongoClient.connect(url)
        .then(data => {
            state.db = data.db('shopping')
            done()
        })
        .catch(err => {
            done(err)
        })
}

module.exports.get = () => {
    return state.db
}