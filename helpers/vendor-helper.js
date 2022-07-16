const db = require('../config/connection')
const collection = require('../config/collections')
const bcrypt = require('bcrypt')

module.exports = {

    doSignUp: (vendorData) => {
        return new Promise(async (resolve, reject) => {
            vendorData.password = await bcrypt.hash(vendorData.password, 10);
            db.get().collection(collection.VENDOR_COLLECTION).insertOne(vendorData).then((data) => {
                resolve(vendorData)
            })
        })
    },
    doLogin: (vendorData) => {
        return new Promise(async (resolve, reject) => {
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
        })
    },
    checkUnique:(vendorData)=>{
        return new Promise(async(resolve,reject)=>{
            let valid = {}
            vendor = db.get().collection(collection.VENDOR_COLLECTION).findOne({email:vendorData.email})
            if(vendor){
                valid.exist=true
                resolve(valid)
            }
            else{
                resolve(valid)
            }
        })
    }
}