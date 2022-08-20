const db = require('../config/connection')
const collection = require('../config/collections')
const { response } = require('../app')
const ObjectId = require('mongodb').ObjectId

module.exports={
    addBanner:(bannerData,image)=>{
        let banner = bannerData
        banner.image=image
        return new Promise((resolve, reject) => {
            try{
                db.get().collection(collection.BANNER_COLLECTION).insertOne(banner).then((response)=>{
                    resolve(response)
                })

            }
            catch(error){
                reject(error)
            }
        })
    },
    getAllBanners:()=>{
        return new Promise(async(resolve, reject) => {
            try{
               let banners = await db.get().collection(collection.BANNER_COLLECTION).find().toArray()
               resolve(banners)
            }
            catch(error){
                reject(error)
            }
        })
    },
    deleteBanner:(bannerId)=>{
        return new Promise((resolve, reject) => {
            try{
                db.get().collection(collection.BANNER_COLLECTION).deleteOne({_id:ObjectId(bannerId)}).then((response)=>{
                    resolve(response)
                })
            }
            catch(error){
                reject(error)
            }
        })
    },
    getOneBanner:(bannerId)=>{
        return new Promise(async (resolve, reject) => {
            try{
                let bannerData = await db.get().collection(collection.BANNER_COLLECTION).findOne({ _id: ObjectId(bannerId)})
                resolve(bannerData)
            }catch(error){
                reject(error)
            }
            
        })
    },
    updateBanner:(bannerData,image)=>{
        return new Promise((resolve, reject) => {
            try{
                db.get().collection(collection.BANNER_COLLECTION).updateOne({_id:ObjectId(bannerData._id)},{
                    $set:{
                        bannerName:bannerData.bannerData,
                        description1:bannerData.description1,
                        description2:bannerData.description2,
                        link:bannerData.link,
                        image:image
                    }
                }).then((response)=>{
                    resolve(response)
                })

            }
            catch(error){
                reject(error)
            }
        })
    }
}