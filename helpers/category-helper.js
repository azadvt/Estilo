const db = require('../config/connection')
const collection = require('../config/collections')
const ObjectId = require('mongodb').ObjectId

module.exports={
    addCategory:(categoryData)=>{
        db.get().collection(collection.CATEGORY_COLLECTION).insertOne({
            categoryName:categoryData.categoryName,
            'deletedCategory':false
        })
    },      
    getViewCategory:()=>{
        return new Promise(async(resolve,reject)=>{
         let categoryData= await db.get().collection(collection.CATEGORY_COLLECTION).find({deletedCategory:false}).sort({category:1}).toArray()
         resolve(categoryData)
        })
    },
    getOneCategory: (categoryId) => {
        return new Promise(async (resolve, reject) => {
            let categoryData = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ _id: ObjectId(categoryId)})
            resolve(categoryData)
        })
    },
    deleteCategory: (categoryId) => {
        db.get().collection(collection.CATEGORY_COLLECTION).updateOne({ _id: ObjectId(categoryId) }, { $set: { deletedCategory: true } })
    },
    updateCategory: (categoryId,categoryData) => {
        db.get().collection(collection.CATEGORY_COLLECTION).updateOne({ _id: ObjectId(categoryId) }, {
            $set: {
                categoryName:categoryData.categoryName
            }
        })
    }
}