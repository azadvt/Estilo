const db = require('../config/connection')
const collection = require('../config/collections')
const { response } = require('express')
const { getwishlist } = require('../controllers/user')
const ObjectId = require('mongodb').ObjectId

module.exports = {

    addToWishlist: (productId, userId) => {
        wishlistObj = {
            user: ObjectId(userId),
            products: [ObjectId(productId)]
        }
        return new Promise(async (resolve, reject) => {
            try{
                let response={}
                let userWishlist = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: ObjectId(userId) })
                console.log(userWishlist)
                if (userWishlist) {
    
                    let product = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: ObjectId(userId) },
                        {
                            products: { $elemMatch: { $eq: ObjectId(productId) } }
                        })
                    console.log("product=", product);
                    let productExist = product.products.findIndex(product => product == productId)
                    console.log("product exist=", productExist);
                    if (productExist != -1) {
                        db.get().collection(collection.WISHLIST_COLLECTION).updateOne({ user: ObjectId(userId) },
                            {
                                $pull: { products: ObjectId(productId) }
                            })
                            response.removed=true
                            response.added=false
                            resolve(response)
                    }
                    else {
                        console.log('haai');
                        db.get().collection(collection.WISHLIST_COLLECTION).updateOne({ user: ObjectId(userId) },
                            {
                                $push: { products: ObjectId(productId) }
                            })
                            response.removed=false
                            response.added=true
                            resolve(response)
                    }
    
    
    
                }
                else {
                    db.get().collection(collection.WISHLIST_COLLECTION).insertOne(wishlistObj)
                    resolve({added:true})
                }
            }catch(error){
                reject(error)
            }
            


        })
    },
    getwishlistProducts:(userId)=>{
            return new Promise(async(resolve, reject) => {
                try{
                    let wishlistItems=await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
                        {
                            $match:{user:ObjectId(userId)}
                        },
                        {
                            $unwind:'$products'
                        },
                        {
                            $lookup:{
                                from:collection.PRODUCT_COLLECTION,
                                localField:'products',
                                foreignField:'_id',
                                as:'product'
                            }
                        },
                        {
                            $project:{
                                product:{$arrayElemAt:['$product',0]}
                            }
                        }
                    ]).toArray()
                    resolve(wishlistItems)
                }catch(error){
                    reject(error)
                }
                
            })
    },
    removeProductFromWishlist:(details)=>{
        console.log(details);
            let productId=details.productId
            let wishlistId=details.wishlistId
            return new Promise((resolve, reject) => {
                try{
                    db.get().collection(collection.WISHLIST_COLLECTION).updateOne({_id:ObjectId(wishlistId)},
                    {
                        $pull:{products:ObjectId(productId)} 
                    }
                    ).then((response)=>{
                        resolve({productRemoved:true})
                    })
                }catch(error){
                    reject(error)
                }
                
            })
    },
    getWishlistCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            try{
                let count = 0
                let wishlist = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({ user: ObjectId(userId) })
                if (wishlist) {
                    count = wishlist.products.length
                }
                resolve(count)
            }catch(error){
                reject(error)
            }
            
        })

    }

}