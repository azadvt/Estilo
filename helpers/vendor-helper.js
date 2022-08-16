const db = require('../config/connection')
const collection = require('../config/collections')
const bcrypt = require('bcrypt')
const ObjectId=require('mongodb').ObjectId

module.exports = {

    doSignUp: (vendorData) => {
        return new Promise(async (resolve, reject) => {
            try{
                vendorData.password = await bcrypt.hash(vendorData.password, 10);
                db.get().collection(collection.VENDOR_COLLECTION).insertOne(vendorData).then((data) => {
                    resolve(vendorData)
                })
            }
            catch(error){
                reject(error)
            }
            
        })
    },
    doLogin: (vendorData) => {
        return new Promise(async (resolve, reject) => {
            try{
                let response = {}
                vendor = await  db.get().collection(collection.VENDOR_COLLECTION).findOne({email:vendorData.email})
                if(vendor){
                    bcrypt.compare(vendorData.password,vendor.password).then((status)=>{
                        if(status){
                            response.vendor = vendor;
                            response.status = true
                            resolve(response)
                        }
                        else{
                            resolve({status:false})
                        }
                    })
                }
                else{
                    resolve({status:false})
                }
            }
            catch(error){
                reject(error)
            }
            
        })
    },
    checkUnique:(vendorData)=>{
        return new Promise(async(resolve,reject)=>{
            try{
                let valid = {}
                exist = await db.get().collection(collection.VENDOR_COLLECTION).findOne({email:vendorData.email})
                if(exist){
                    valid.exist=true
                    resolve(valid)
                }
                else{
                    resolve(valid)
                }
            }
            catch(error){
                reject(error)
            }
            
        })
    },
    
    getAllVendor:()=>{
        return new Promise(async(resolve,reject)=>{
            try{
                let vendorDetails= await db.get().collection(collection.VENDOR_COLLECTION).find().sort({name:1}).toArray()
                resolve(vendorDetails)
            }
            catch(error){
                reject(error)
            }
            
        })
    },
    blockVendor:(vendorId)=>{
        console.log(vendorId);
        return new Promise(async(resolve, reject) => {
            try{
                let vendor= await db.get().collection(collection.VENDOR_COLLECTION).findOne({_id:ObjectId(vendorId)})
  
                console.log(vendor);
                if(vendor.blockedVendor){
                  db.get().collection(collection.VENDOR_COLLECTION).updateOne({ _id: ObjectId(vendorId) }, { $set: { blockedVendor: false } }).then((response) => {
                      resolve(response)
                  })
                }
                else{
                  db.get().collection(collection.VENDOR_COLLECTION).updateOne({ _id: ObjectId(vendorId) }, { $set: { blockedVendor: true } }).then((response) => {
                      resolve(response)
                  })
                }
            }
            catch(error){
                reject(error)
            }
            
          })
    },
    unBlockVendor:(vendorId)=>{
        console.log(vendorId);
        return new Promise((resolve,reject)=>{
            try{
                db.get().collection(collection.VENDOR_COLLECTION).updateOne({_id:ObjectId(vendorId)},{$set:{blockedVendor:false}})
      
            }
            catch(error){
                reject(error)
            }
              })
    }
}