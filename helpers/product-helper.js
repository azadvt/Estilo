const db = require('../config/connection')
const collection = require('../config/collections')
const ObjectId = require('mongodb').ObjectId



module.exports = {
    addProduct: (productData, images,vendor) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).insertOne({
                name: productData.name,
                brand: productData.brand,
                price: productData.price,
                categoryName: productData.categoryName,
                productDescription: productData.productDescription,
                'deletedProduct':false,
                images,vendor
            })
        })

    },
    getAllProduct: () => {
        return new Promise(async (resolve, reject) => {
            let productData = await db.get().collection(collection.PRODUCT_COLLECTION).find({deletedProduct:false}).sort({ name: 1 }).toArray()
            resolve(productData)
        })
    },
    getOneProduct: (productId) => {
        return new Promise(async (resolve, reject) => {
            let productData = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: ObjectId(productId) })
            resolve(productData)
        })
    },
    deleteProduct: (productId) => {
        db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(productId) }, { $set: { deletedProduct: true } })
    },
    updateProduct: (productId, productData, images,vendor) => {
        db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(productId) }, {
            $set: {
                'name': productData.name,
                'brand': productData.brand,
                'price': productData.price,
                'category': productData.category,
                productDescription: productData.productDescription,
                images,vendor
            }
        })
    }
}


