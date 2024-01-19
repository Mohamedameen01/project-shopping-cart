const db = require('../config/connection')
const collections = require('../config/collections')
const { ObjectId } = require('mongodb');


module.exports = {
    addProduct(product, callback) {
        db.get().collection(collections.PRODUCTS_COLLECTION).insertOne(product)
            .then(data => {
                callback(data.insertedId);
            })
    },
    getAllProduct() {
        return new Promise(async (resolve, reject) => {
            const products = await db.get().collection(collections.PRODUCTS_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    deleteProduct(proId) {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCTS_COLLECTION).deleteOne({ _id: new ObjectId(proId) })
                .then(data => {
                    resolve(data)
                })
        })
    },
    getProductDetails(proId) {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCTS_COLLECTION).findOne({ _id: new ObjectId(proId) })
                .then(data => {
                    resolve(data)
                })
        })
    },
    updateProduct(proId, proDetails) {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCTS_COLLECTION).updateOne({ _id: new ObjectId(proId) }, {
                $set: {
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
        return new Promise(async (resolve, reject) => {
            const cartObj = {
                item: new ObjectId(proId),
                quantity: 1
            }
            const userCart = await db.get().collection(collections.CARTS_COLLECTION).findOne({ user: new ObjectId(userId) })
            if (userCart) {
                let isInCart = userCart.products.findIndex(product => product.item == proId)
                if (isInCart != -1) {
                    db.get().collection(collections.CARTS_COLLECTION)
                    .updateOne({ user: new ObjectId(userId),'products.item': new ObjectId(proId) },
                        {
                            // using $ sign to get first element of the array.
                            $inc: { 'products.$.quantity': 1 }
                        }).then(() => {
                            resolve()
                        })
                } else {
                    db.get().collection(collections.CARTS_COLLECTION).updateOne({user: new ObjectId(userId)},
                        {
                           $push:{products: cartObj} 
                        }
                    ).then(() => {
                        resolve()
                    })
                }
            } else {
                let cartProps = {
                    user: new ObjectId(userId),
                    products: [cartObj]
                }
                db.get().collection(collections.CARTS_COLLECTION).insertOne(cartProps).then(data => {
                    resolve()
                })
            }
        })
    },
    getCartProducts(userId) {
        return new Promise(async (resolve, reject) => {
            const cartItems = await db.get().collection(collections.CARTS_COLLECTION).aggregate([
                {
                    $match: { user: new ObjectId(userId) }
                },
                {
                    $unwind: "$products"
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collections.PRODUCTS_COLLECTION,
                        localField: "item",
                        foreignField: "_id",
                        as: "products"
                    }
                },
                {
                    $project: {
                        item:1,
                        quantity:1,
                        product: {$arrayElemAt: ['$products',0]} 
                    }
                }
            ]).toArray()
            console.log(cartItems)
            resolve(cartItems)
        })
    },
    getCartCounts(userId) {
        return new Promise(async (resolve, reject) => {
            let count = 0;
            const cart = await db.get().collection(collections.CARTS_COLLECTION).findOne({ user: new ObjectId(userId) })
            if (cart) {
                count = cart.products.length
            }
            resolve(count);
        })
    },
    changeProductQuantity({cartId, prodId, count}){
        count = parseInt(count)
        // console.log(props)
        return new Promise((resolve, reject) => {
            db.get().collection(collections.CARTS_COLLECTION)
            .updateOne({_id: new ObjectId(cartId), 'products.item': new ObjectId(prodId)},
            {
                $inc:{'products.$.quantity': count}
            }).then(() => {
                resolve()
            })
        })
    }
}

