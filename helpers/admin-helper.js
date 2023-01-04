const db = require('../config/connection')
const collection = require('../config/collections')
const bcrypt = require('bcrypt')

module.exports={
    doLogin: (adminData) => {
        console.log(adminData);
        return new Promise(async (resolve, reject) => {
            try{
                let response = {}
            admin = await  db.get().collection(collection.ADMIN_COLLECTION).findOne({email:adminData.email})
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
        
        }
        catch(error){
            reject(error)
        }
    })
            
    },
    doSignUp: (adminData) => {
        return new Promise(async (resolve, reject) => {
            try{
                adminData.password = await bcrypt.hash(adminData.password, 10);
                db.get().collection(collection.ADMIN_COLLECTION).insertOne(adminData).then((data) => {
                    resolve(adminData)
                })
            
            }
       
        catch(error){
            reject(error)
        }
    })
           
    },
    checkUnique:(adminData)=>{
        return new Promise(async(resolve,reject)=>{
            try{
                let valid = {}
                exist = await db.get().collection(collection.ADMIN_COLLECTION).findOne({email:adminData.email})
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
}