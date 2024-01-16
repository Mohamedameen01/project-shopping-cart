const db = require('../config/connection')
const collections = require('../config/collections')
const { ObjectId } = require('mongodb');


module.exports = {
    addProduct(product, callback){
        db.get().collection(collections.PRODUCTS_COLLECTION).insertOne(product)
        .then(data => {
            callback(data.insertedId);
        })
    },
    getAllProduct() {
        return new Promise(async(resolve, reject) => {
            const products = await db.get().collection(collections.PRODUCTS_COLLECTION).find().toArray()
            resolve(products) 
        })
    },
    deleteProduct(proId) {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCTS_COLLECTION).deleteOne({_id: new ObjectId(proId)})
            .then(data => {
                console.log(data);
                resolve(data)
            })
        })
    },
    getProductDetails(proId) {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCTS_COLLECTION).findOne({_id: new ObjectId(proId)})
            .then(data => {
                resolve(data)
            })
        })
    },
    updateProduct(proId, proDetails){
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCTS_COLLECTION).updateOne({_id: new ObjectId(proId)},{
                $set:{
                    title: proDetails.title,
                    description: proDetails.description,
                    category: proDetails.category,
                    price: proDetails.price
                }
            }).then(data => {
                resolve()
            })
        })
    }
} 

