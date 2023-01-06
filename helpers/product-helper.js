const db = require('../config/connection')
const collection = require('../config/collections')
const ObjectId = require('mongodb').ObjectId



module.exports = {
  addProduct: (productData, images, vendorId) => {
    let price = Number(productData.price)
    return new Promise((resolve, reject) => {
      try {
        db.get().collection(collection.PRODUCT_COLLECTION).insertOne({
          vendor: ObjectId(vendorId),
          name: productData.name,
          brand: productData.brand,
          price: price,
          categoryName: productData.categoryName,
          productDescription: productData.productDescription,
          'deletedProduct': false,
          images
        })
      }
      catch (error) {
        reject(error)
      }

    })

  },
  getAllProductForAdmin: () => {
    return new Promise(async (resolve, reject) => {
      try {
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
      } catch (error) {
        reject(error)
      }

    })
  },
  getOneProduct: (productId) => {
    console.log("proudct///////",productId);
    return new Promise(async (resolve, reject) => {
      try {
        let productData = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: ObjectId(productId) })
        console.log(productData);
        resolve(productData)
      } catch (error) {
        reject(error)
      }

    })
  },
  deleteProduct: (productId) => {
    return new Promise((resolve, reject) => {
      try {
        db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(productId) }, { $set: { deletedProduct: true } })

      }
      catch (error) {
        reject(error)
      }
    })

  },
  updateProduct: (productId, productData, images, vendorId) => {

    let price = Number(productData.price)
    return new Promise((resolve, reject) => {
      try {
        db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(productId) }, {
          $set: {
            'vendor': vendorId,
            'name': productData.name,
            'brand': productData.brand,
            'price': price,
            'category': productData.category,
            'productDescription': productData.productDescription,
            images
          }
        })
      }
      catch (error) {
        reject(error)
      }

    })
  },
  getProductsForVendor: (vendorId) => {
    return new Promise(async (resolve, reject) => {
      try {
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
        resolve(productData)
      } catch (error) {
        reject(error)
      }

    })
  },
  getAdminOwnProducts: (adminId) => {
    return new Promise(async (resolve, reject) => {
      try {
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
        resolve(productData)
      } catch (error) {
        reject(error)
      }

    })
  },
  getAllProducts: () => {

    return new Promise(async (resolve, reject) => {
      try {
        let productData = await db.get().collection(collection.PRODUCT_COLLECTION).find({ deletedProduct: false }).sort({ name: 1 }).toArray()
        resolve(productData)
      } catch (error) {
        reject(error)
      }

    })
  },
  getProductCategoryWise: (category) => {
    return new Promise(async (resolve, reject) => {
      try {
        let productData = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
          {
            '$match': {
              'categoryName': category,
              'deletedProduct': false
            }
          }, {
            '$sort': {
              'name': 1
            }
          }
        ]).toArray()
        resolve(productData)
      } catch (error) {
        reject(error)
      }


    })
  },
  searchProducts:(search,search2)=>{

    let searchData;

    if(search) searchData = search;
    else if(search2) searchData = search2;
    return new Promise(async(resolve, reject) => {
      try {
        const products = await db
            .get()
            .collection(collection.PRODUCT_COLLECTION)
            .find({
              name: {
                    $regex: searchData,
                    $options: 'i'
                },
            })
            .toArray();
  
        resolve(products);
    } catch (err) {
        reject(error);
    }
    })
   
  }
}


