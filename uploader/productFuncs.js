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
    },
    addToCart(proId, userId) {
        return new Promise(async(resolve, reject) => {
            const userCart = await db.get().collection(collections.CARTS_COLLECTION).findOne({user: new ObjectId(userId)})
            if(userCart) {
                console.log(proId)
                db.get().collection(collections.CARTS_COLLECTION).updateOne({user: new ObjectId(userId)},
                    {
                       $push:{products: new ObjectId(proId)} 
                    }
                ).then(data => {
                    resolve()
                })
            } else {
                let cartProps = {
                    user: new ObjectId(userId),
                    products: [new ObjectId(proId)]
                }
                db.get().collection(collections.CARTS_COLLECTION).insertOne(cartProps).then(data => {
                    resolve()
                })
            }
        })
    },
    getCartProducts(userId) {
        return new Promise(async(resolve, reject) => {
            const cartItems = await db.get().collection(collections.CARTS_COLLECTION).aggregate([
                {
                    $match: {user: new ObjectId(userId)}
                },
                {
                    $lookup: {
                        from: collections.PRODUCTS_COLLECTION,
                        localField: "products",
                        foreignField: "_id",
                        as: "cartItems"
                    }
                }
            ]).toArray()
            
            resolve(cartItems[0].cartItems)
        })
    }
} 

