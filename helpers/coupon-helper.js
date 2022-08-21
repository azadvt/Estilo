const db = require('../config/connection')
const collection = require('../config/collections')
const { response } = require('../app')
const ObjectId = require('mongodb').ObjectId

module.exports = {
    addCoupon: (couponData) => {
        oneDay=1000*60*60*24
        console.log(couponData.couponCode);
        let coupon = {
            couponCode: couponData.couponCode.toUpperCase(),
            discount: parseFloat(couponData.discount/100),
            validity:new Date(new Date().getTime()+(oneDay*parseInt(couponData.validity)))
        }
        return new Promise((resolve, reject) => {
            try{
                db.get().collection(collection.COUPON_COLLECTION).find().toArray().then((response) => {
                    if(response[0]==null){
                        db.get().collection(collection.COUPON_COLLECTION).createIndex({"couponCode":1},{unique:true})
    
                        db.get().collection(collection.COUPON_COLLECTION).createIndex({"validity":1},{expireAfterSeconds:0})
    
                        db.get().collection(collection.COUPON_COLLECTION).insertOne(coupon).then((response)=>{
                            resolve(response)
                        })
                    }
                    else{
                        db.get().collection(collection.COUPON_COLLECTION).insertOne(coupon).then((response)=>{
                            resolve(response)
                        })
                    }
                })
            }
            catch(error){
                reject(error)
            }
            
        })

    },
    applyCoupon: (code,total) => {
        const coupon = code.toString().toUpperCase()
        return new Promise(async (resolve, reject) => {
            try{
                let response = await db.get().collection(collection.COUPON_COLLECTION).findOne({ couponCode: coupon })
                console.log(response);
                if (response==null) {
                    reject({status:false})
                    }
                    else{
                        console.log('valid coupon');
                        let offerPrice=parseFloat(total*response.discount).toFixed(2)
    
                        let newTotal = parseInt(total-offerPrice)
                        let couponData =response
                        couponData.couponCode=coupon
                        couponData.status=true
                        couponData.amount=newTotal
                        couponData.discount=offerPrice
                        resolve(couponData)
                    }
            }
            catch(error){
                reject(error)
            }
            
            
            })
        
           
        
    },
   
    getAllCoupon:()=>{
        return new Promise(async(resolve, reject) => {
            try{
                let response = await db.get().collection(collection.COUPON_COLLECTION).find().toArray()
                for(var i=0; i<response.length;i++){
                    response[i].discount=response[i].discount*100
                }
                console.log('dd');
                console.log(response);
                resolve(response)
            }
            catch(error){
                reject(error)
            }
            
        })
        

    },
    deleteCoupon:(couponId)=>{
        return new Promise((resolve, reject) => {
            try{
                db.get().collection(collection.COUPON_COLLECTION).deleteOne({_id:ObjectId(couponId)}).then((response)=>{
                    resolve(response)
                })
            }
            catch(error){
                reject(error)
            }
            
        })
    }


}