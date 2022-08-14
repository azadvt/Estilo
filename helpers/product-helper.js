const db = require('../config/connection')
const collection = require('../config/collections')
const ObjectId = require('mongodb').ObjectId



module.exports = {
    addProduct: (productData, images,vendorId) => {
        let price = Number(productData.price)  
        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).insertOne({
                vendor:ObjectId(vendorId),
                name: productData.name,
                brand: productData.brand,
                price: price,
                categoryName: productData.categoryName,
                productDescription: productData.productDescription,
                'deletedProduct':false,
                images
            })
        })

    },
    getAllProductForAdmin: () => {
        return new Promise(async (resolve, reject) => {
            let productData = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                {
                  '$lookup': {
                    'from': 'vendor', 
                    'localField': 'vendor',
                    'foreignField': '_id', 
                    'as': 'vendor'
                  }
                }, {
                  '$unwind': {
                    'path': '$vendor'
                  }
                }, {
                  '$match': {
                    'deletedProduct': false
                  }
                }, {
                  '$sort': {
                    'name': 1
                  }
                }
              ]).toArray()
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
    updateProduct: (productId, productData, images,vendorId) => {
        let price = Number(productData.price) 
        db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(productId) }, {
            $set: {
                'vendor':vendorId,
                'name': productData.name,
                'brand': productData.brand,
                'price': price,
                'category': productData.category,
                'productDescription': productData.productDescription,
                images
            }
        })
    },
    getProductsForVendor:(vendorId)=>{
      return new Promise(async(resolve, reject) => {
        let productData = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
          {
            '$match': {
              'vendor': new ObjectId(vendorId)
            }
          }, {
            '$match': {
              'deletedProduct': false
            }
          }
        ]).toArray()
        console.log(productData);
        resolve(productData)
      })
    },
    getAdminOwnProducts:(adminId)=>{
      return new Promise(async(resolve, reject) => {
        let productData = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
          {
            '$match': {
              'vendor': new ObjectId(adminId)
            }
          }, {
            '$match': {
              'deletedProduct': false
            }
          }
        ]).toArray()
        console.log(productData);
        resolve(productData)
      })
    },
    getAllProducts:(req,res)=>{
      return new Promise(async (resolve, reject) => {
        let productData = await db.get().collection(collection.PRODUCT_COLLECTION).find({deletedProduct:false}).sort({ name: 1 }).toArray()
        resolve(productData)
    })
    }
}


