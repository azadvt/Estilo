const db = require('../config/connection')
const collection = require('../config/collections')
const { response } = require('express')
const ObjectId = require('mongodb').ObjectId


module.exports = {

    addToCart: (productId, userId) => {
        let productObj = {
            item: ObjectId(productId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
            console.log(userCart);
            if (userCart) {
                let productExist = userCart.products.findIndex(product => product.item == productId)
                console.log("productExist=", productExist);
                if (productExist != -1) {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: ObjectId(userId), 'products.item': ObjectId(productId) },
                        {
                            $inc: { 'products.$.quantity': 1 }
                        }
                    ).then((response) => {
                        resolve(response)
                    })

                } else {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: ObjectId(userId) },
                        {
                            $push: { products: productObj }
                        }
                    ).then((response) => {
                        resolve(response)
                    })
                }

            } else {
                let cartObj = {
                    user: ObjectId(userId),
                    products: [productObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve(response)
                })
            }

            let product = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: ObjectId(userId) },
                {
                    products: { $elemMatch: { $eq: ObjectId(productId) } }
                })
                if(product){
                    let productExist = product.products.findIndex(product => product == productId)
                    if (productExist != -1) {
                        db.get().collection(collection.WISHLIST_COLLECTION).updateOne({ user: ObjectId(userId) },
                            {
                                $pull: { products: ObjectId(productId) }
                            }).then((response)=>{
                                resolve({status:true})
        
                            })
                       
                    }
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
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }, 
                {
                    '$addFields': {
                      'productTotal': {
                        '$sum': {
                          '$multiply': [
                            '$quantity', '$product.price'
                          ]
                        }
                      }
                    }
                  }


            ]).toArray()
            console.log("cartitems=", cartItems);
            resolve(cartItems)

        })
    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
            if (cart) {
                count = cart.products.length
            }
            resolve(count)
        })

    },
    changeProductQty: (details) => {
        console.log('dddd==', details);
        qty = parseInt(details.quantity)
        count = parseInt(details.count)
        let productId = details.productId
        let cartId = details.cartId
        console.log('cartId =', cartId, 'productId=', productId, 'quantity=', qty);
        return new Promise((resolve, reject) => {
            if (count == -1 && qty == 1) {
                db.get().collection(collection.CART_COLLECTION).updateOne({ _id: ObjectId(cartId) },
                    {
                        $pull: { products: { item: ObjectId(productId) } }
                    }
                ).then((response) => {
                    resolve({ productRemoved: true })
                })
            } else {
                db.get().collection(collection.CART_COLLECTION).updateOne({ _id: ObjectId(cartId), 'products.item': ObjectId(productId) },
                    {
                        $inc: { 'products.$.quantity': count }
                    }).then(() => {
                        resolve({ status: true })
                    })
            }

        })
    },
    removeProductFromCart: (details) => {
        let productId = details.productId
        let cartId = details.cartId
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).updateOne({ _id: ObjectId(cartId) },
                {
                    $pull: { products: { item: ObjectId(productId) } }
                }
            ).then((response) => {
                resolve(response)
            })
        })

    },
    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: ObjectId(userId) }
                },
                {
                    $unwind: '$products'
                },  
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', '$product.price'] } }
                    }
                }

            ]).toArray()

            if (total.length == 0) {
                resolve(total)
            }
            else {
                resolve(total[0].total)
            }

        })
    },

    //products id  
    
    getCartProductList:(userId)=>{
        return new Promise(async(resolve, reject) => {
            let date= Date.now()
            let cart=await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                  '$match': {
                    'user': ObjectId(userId)
                  }
                }, {
                  '$unwind': {
                    'path': '$products'
                  }
                }, {
                  '$project': {
                    'products': 1,'_id':0
                  }
                }, {
                  '$addFields': {
                    'products.status': 'pending', 
                    'products.active': true,
                    'products.date' : date
                  }
                },{
                    '$replaceRoot': {
                      'newRoot': '$products'
                    }
                  }
              ]).toArray()
              resolve(cart)
              console.log(cart);
            
        })
    },
    deleteCart:(userId)=>{
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).deleteOne({ user: ObjectId(userId) })
            resolve()
        })
        
        
    }
}