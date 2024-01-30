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
        console.log(proId, userId);
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
                        .updateOne({ user: new ObjectId(userId), 'products.item': new ObjectId(proId) },
                            {
                                // using $ sign to get first element of the array.
                                $inc: { 'products.$.quantity': 1 }
                            }).then(() => {
                                resolve()
                            })
                } else {
                    db.get().collection(collections.CARTS_COLLECTION).updateOne({ user: new ObjectId(userId) },
                        {
                            $push: { products: cartObj }
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
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ['$products', 0] },
                    }
                },
            ]).toArray()
            // console.log(cartItems)
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
    changeProductQuantity({ cartId, prodId, count, quantity }) {
        count = parseInt(count)

        return new Promise((resolve, reject) => {
            if (count == -1 && quantity == 1) {
                db.get().collection(collections.CARTS_COLLECTION).updateOne({ _id: new ObjectId(cartId) },
                    {
                        $pull: { products: { item: new ObjectId(prodId) } }
                    }).then(() => {
                        resolve({ removeProduct: true })
                    })
            } else {
                db.get().collection(collections.CARTS_COLLECTION)
                    .updateOne({ _id: new ObjectId(cartId), 'products.item': new ObjectId(prodId) },
                        {
                            $inc: { 'products.$.quantity': count }
                        }).then(() => {
                            resolve({ status: true })
                        })
            }
        })
    },
    removeCartProduct({ cart, product }) {
        console.log(cart, product);
        return new Promise((resolve, reject) => {
            db.get().collection(collections.CARTS_COLLECTION).updateOne({ _id: new ObjectId(cart) },
                {
                    $pull: { products: { item: new ObjectId(product) } }
                }).then(() => {
                    resolve()
                })
        })
    },
    getTotalAmount(userId) {
        return new Promise(async (resolve, reject) => {

            let total = await db.get().collection(collections.CARTS_COLLECTION).aggregate([
                {
                    $match: { user: new ObjectId(userId) }
                },
                {
                    $unwind: "$products"
                },
                {
                    $project: {
                        item: "$products.item",
                        quantity: "$products.quantity"
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
                        item: 1,
                        quantity: 1,
                        product: { $arrayElemAt: ["$products", 0] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: [{ $toInt: "$quantity" }, { $toInt: "$product.price" }] } }
                    }
                }
            ]).toArray()
            if (total.length !== 0) {
                resolve(total[0].total)
            } else {
                total = 0
                resolve(total)
            }
        })
    },
    getCartProductsList(userId) {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collections.CARTS_COLLECTION).findOne({ user: new ObjectId(userId) })
            resolve(cart.products)
        })
    },
    placeOrder(order, products, total) {
        return new Promise((resolve, reject) => {
            let status = order['payment-method'] === 'COD' ? 'Placed' : 'Pending'
            let orderDetails = {
                deliveryDetails: {
                    address: order.address,
                    mobile: order.mobile,
                    pincode: order.pincode
                },
                userId: new ObjectId(order.userId),
                paymentMethod: order['payment-method'],
                products, status, total,
                date: new Date().toLocaleString("en-IN")
            }
            db.get().collection(collections.ORDER_COLLECTION).insertOne(orderDetails).then((response) => {
                db.get().collection(collections.CARTS_COLLECTION).deleteOne({ user: new ObjectId(order.userId) })
                resolve(response.insertedId)
            })
        })
    },
    getOrderedDetails(id) {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.ORDER_COLLECTION).findOne({ _id: new ObjectId(id) })
                .then(response => {
                    resolve(response)
                })
        })
    },
    getUserAllOrders(userId) {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.ORDER_COLLECTION).find({ userId: new ObjectId(userId) }).toArray()
                .then(response => {
                    console.log("me");
                    console.log(response);
                    resolve(response);
                })
        })
    },
    getSelectedOrder(id) {
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: new ObjectId(id) }
                },
                {
                    $unwind: "$products"
                },
                {
                    $project: { products: 1 }
                },
                {
                    $lookup: {
                        from: collections.PRODUCTS_COLLECTION,
                        localField: "products.item",
                        foreignField: "_id",
                        as: "product"
                    }
                },
                {
                    $project: {
                        item: "$products.item",
                        quantity: "$products.quantity",
                        product: { $arrayElemAt: ["$product", 0] }
                    }
                }
            ]).toArray()
            resolve(product);
        })
    },
    getAllUsers() {
        return new Promise(async (resolve, reject) => {
            let users = await db.get().collection(collections.USERS_COLLECTION).find().toArray()
            resolve(users);
        })
    },
    getAllOrders() {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collections.ORDER_COLLECTION).find().toArray()
            resolve(orders);
        })
    }


}

