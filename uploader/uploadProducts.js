const db = require('../config/connection')
const collection = require('../config/collections')

module.exports = {
    addProduct(product, callback){
        db.get().collection(collection.PRODUCTS_COLLECTION).insertOne(product)
        .then(data => {
            callback(data.insertedId);
        })
    },
    getAllProduct() {
        return new Promise(async(resolve, reject) => {
            const products = await db.get().collection(collection.PRODUCTS_COLLECTION).find().toArray()
            resolve(products) 
        })
    }
} 

