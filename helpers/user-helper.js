const db = require('../config/connection')
const collection = require('../config/collections')
const bcrypt = require('bcrypt')

module.exports={
    doSignup:(userData)=>{
        return new Promise(async (resolve, reject) => {
            userData.password = await bcrypt.hash(userData.password, 10);
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                resolve(userData)
            })  
        })
    },doLogin:(userData)=>{
        return new Promise(async (resolve,reject)=>{
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
            if(user){
                bcrypt.compare(userData.password,user.password).then((status)=>{
                    if(status){
                        response.user = user;
                        response.status =true;
                        resolve(response);
                    }else{
                        resolve({status:false})
                    }
                })
            }else{
                resolve({status : false})
            }
        })
    },checkUnique:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let valid={}
               let exist = await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
               if(exist){
                valid.exist=true
                resolve(valid)
               }else{
                resolve(valid)                
               }
        })
    },
    getAllUsers:()=>{
        return new Promise((resolve,reject)=>{
            let userDetails = db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(userDetails)
        })
    }
}