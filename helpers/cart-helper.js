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
                try{
                let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
                if (userCart) {
                    let productExist = userCart.products.findIndex(product => product.item == productId)
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

        }
        catch(error){
            reject(error)
        }
        
            
        })
    },
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            try{
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
                resolve(cartItems)
            }
            catch(error){
                reject(error)
            }
            

        })
    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            try{
                let count = 0
                let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: ObjectId(userId) })
                if (cart) {
                    count = cart.products.length
                }
                resolve(count)
            }
            catch(error){
                reject(error)
            }
           
        })

    },
    changeProductQty: (details) => {
        qty = parseInt(details.quantity)
        count = parseInt(details.count)
        let productId = details.productId
        let cartId = details.cartId
        return new Promise((resolve, reject) => {
            try{
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
            }
            catch(error){
                reject(error)
            }
            

        })
    },
    removeProductFromCart: (details) => {
        let productId = details.productId
        let cartId = details.cartId
        return new Promise((resolve, reject) => {
            try{
                db.get().collection(collection.CART_COLLECTION).updateOne({ _id: ObjectId(cartId) },
                {
                    $pull: { products: { item: ObjectId(productId) } }
                }
            ).then((response) => {
                resolve(response)
            })
            }
            catch(error){
                reject(error)
            }
            
        })

    },
    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            try{
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
            }catch(error){
                reject(error)
            }
            

            

        })
    },

    //products id  
    
    getCartProductList:(userId)=>{
        return new Promise(async(resolve, reject) => {
            try{
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
                        'products.status': 'Pending', 
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
            }catch(error){
                reject(error)
            }
            
            
        })
    },
    deleteCart:(userId)=>{
        return new Promise((resolve, reject) => {
            try{
                db.get().collection(collection.CART_COLLECTION).deleteOne({ user: ObjectId(userId) })
                resolve()
            }catch(error){
                reject(error)
            }
            
        })
        
        
    },
    addToCartWithQnty:(productData,userId)=>{
          let productObj = {
            item: ObjectId(productData.productId),
            quantity: parseInt(productData.quantity)
        }
        let cartObj = {
            user: ObjectId(userId),
            products: [productObj]
        }
        return new Promise((resolve, reject) => {
            try{
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve(response)
                })
            }catch(error){
                reject(error)
            }
            
        })
        
    }
}