const db = require('../config/connection')
const collection = require('../config/collections')
const ObjectId = require('mongodb').ObjectId

module.exports={
    addCategory:(categoryData)=>{
        return new Promise((resolve, reject) => {
            try{
                db.get().collection(collection.CATEGORY_COLLECTION).insertOne({
                    categoryName:categoryData.categoryName,
                    'deletedCategory':false
                })
            }catch(error){
                reject(error)
            }
            
        })
       
    },      
    getViewCategory:()=>{
        return new Promise(async(resolve,reject)=>{
            try{
                let categoryData= await db.get().collection(collection.CATEGORY_COLLECTION).find({deletedCategory:false}).sort({category:1}).toArray()
                resolve(categoryData)
            }catch(error){
                reject(error)
            }
        })
    },
    getOneCategory: (categoryId) => {
        return new Promise(async (resolve, reject) => {
            try{
                let categoryData = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ _id: ObjectId(categoryId)})
                resolve(categoryData)
            }catch(error){
                reject(error)
            }
            
        })
    },
    deleteCategory: (categoryId) => {
        try{
            db.get().collection(collection.CATEGORY_COLLECTION).updateOne({ _id: ObjectId(categoryId) }, { $set: { deletedCategory: true } })
        }catch(error){
            reject(error)
        }
        
    },
    updateCategory: (categoryId,categoryData) => {
        
        return new Promise((resolve, reject) => {
            try{
                db.get().collection(collection.CATEGORY_COLLECTION).updateOne({ _id: ObjectId(categoryId) }, {
                    $set: {
                        categoryName:categoryData.categoryName
                    }
            
            
             })
            }
            catch(error){
                reject(error)
            }
            
        })
            
    }
        
       
    
}