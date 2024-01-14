const { ObjectId } = require('mongodb');
const db = require('../config/connection')

module.exports = {
    addProduct(product, callback){
        console.log(product)
        db.get().collection('products').insertOne(product)
        .then(data => {
            callback(data.insertedId);
        })
    }
} 

