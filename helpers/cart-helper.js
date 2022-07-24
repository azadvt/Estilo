const db = require('../config/connection')
const collection = require('../config/collections')
const { response } = require('express')
const ObjectId = require('mongodb').ObjectId


module.exports = {
    addToCart: (productId, userId) => {
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
            console.log("usercart=", userCart);
            if (userCart) {
                db.get().collection(collection.CART_COLLECTION).updateOne({ user: ObjectId(userId) },
                    {
                        $push: { products: ObjectId(productId) }
                    })

            } else {
                let cartObj = {
                    user: ObjectId(userId),
                    products: [ObjectId(productId)]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve(response)
                })
            }
        })
    },
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: ObjectId(userId) }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        let: { productList: '$products' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $in: ['$_id', "$$productList"]
                                    }
                                }
                            }
                        ],
                        as: 'cartItems'
                    }
                }
            ]).toArray()
            // console.log(cartItems);
            resolve(cartItems)

        })
    }
}