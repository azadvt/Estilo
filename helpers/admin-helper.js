const db = require('../config/connection')
const collection = require('../config/collections')

module.exports={
    doLogin:(adminData)=>{
        return new Promise(async(resolve,reject)=>{
            let admin= await db.get().collection(collection.ADMIN_COLLECTION).findOne({username:adminData.username,password:adminData.password})
                resolve(admin)
        })
       
    }
}