const db = require('../config/connection')
const collection = require('../config/collections')
const bcrypt = require('bcrypt')

module.exports={
    doLogin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            admin = await  db.get().collection(collection.ADMIN_COLLECTION).findOne({email:adminData.email})
            console.log('dddds');
            console.log(admin);
            if(admin){
                bcrypt.compare(adminData.password,admin.password).then((status)=>{
                    if(status){
                        response.admin = admin;
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
    doSignUp: (adminData) => {
        return new Promise(async (resolve, reject) => {
            adminData.password = await bcrypt.hash(adminData.password, 10);
            db.get().collection(collection.ADMIN_COLLECTION).insertOne(adminData).then((data) => {
                resolve(adminData)
            })
        })
    },
    checkUnique:(adminData)=>{
        return new Promise(async(resolve,reject)=>{
            let valid = {}
            exist = await db.get().collection(collection.ADMIN_COLLECTION).findOne({email:adminData.email})
            if(exist){
                valid.exist=true
                resolve(valid)
            }
            else{
                resolve(valid)
            }
        })
    },
}