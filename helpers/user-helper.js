const db = require('../config/connection')
const collection = require('../config/collections')
const bcrypt = require('bcrypt')
const { response } = require('../app')
const ObjectId = require('mongodb').ObjectId

module.exports = {
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            try{
                userData.password = await bcrypt.hash(userData.password, 10);
                db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                    resolve(userData)
                })
            }catch(error){
                reject(error)
            }
            
        })
    }, doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            try{
                let loginStatus = false
                let response = {}
                let user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
                if (user) {
                    bcrypt.compare(userData.password, user.password).then((status) => {
                        if (status) {
                            response.user = user;
                            if (user.blockedUser) {
                                response.status = false;
                                response.blockedUser = true
                                resolve(response)
                            } else {
                                response.status = true;
                                response.blockedUser = false
                                resolve(response);
                            }
                        } else {
                            resolve({ status: false })
                        }
                    })
                } else {
                    resolve({ status: false })
                }
            }catch(error){
                reject(error)
            }
            
        })
    }, checkUnique: (userData) => {
        return new Promise(async (resolve, reject) => {
            try{
                let valid = {}
                let existEmail = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
                let existPhone = await db.get().collection(collection.USER_COLLECTION).findOne({ phone: userData.phone })
    
           
                if (existEmail && existPhone) {
                    valid.existEmail = true
                    valid.existPhone = true
                    resolve(valid)
                }
                else if (existEmail) {
                    valid.existEmail = true
                    resolve(valid)
    
                }
                else if (existPhone) {
                    valid.existPhone = true
                    resolve(valid)
                }
    
                else {
                    valid=true
                    resolve(valid)
                }
            }catch(error){
                reject(error)
            }
            
        })
    },
    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            try{
                let userDetails = await db.get().collection(collection.USER_COLLECTION).find().sort({ firstName: 1 }).toArray()
                resolve(userDetails)
            }catch(error){
                reject(error)
            }
            
        })
    },
    blockUnBlockUser: async (userId) => {
        return new Promise(async (resolve, reject) => {
            try{
                let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectId(userId) })

                if (user.blockedUser) {
                    db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userId) }, { $set: { blockedUser: false } }).then((response) => {
                        resolve(response)
                    })
                }
                else {
                    db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userId) }, { $set: { blockedUser: true } }).then((response) => {
                        resolve(response)
                    })
    
                }
            }catch(error){
                reject(error)
            }
            
        })
    },
    addUserAddress: (userId, userAddress) => {
        const addressId = new ObjectId()
        userAddress.deletedAddress = false
        userAddress._id = addressId
        let address = [userAddress]
        return new Promise(async (resolve, reject) => {
            try{
                let userDetails = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectId(userId) })
               
                if (userDetails.address) {
                    db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userId) }, {
                        $push: {
                            address: userAddress
                        }
    
                    }).then((response) => {
                        resolve(response)
                    })
                } else {
                    db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userId) }, {
                        $set:
                        {
                            address: address
                        }
                    }).then((response) => {
                        resolve(response)
                    })
                }
            }catch(error){
                reject(error)
            }

            


        })
    },
    updateUserAddress: (address) => {
        let addressObj = address
        addressObj._id = ObjectId(address._id)
        addressObj.deletedAddress = false
        return new Promise((resolve, reject) => {
            try{
                db.get().collection(collection.USER_COLLECTION)
                .updateOne(
                    {
                        address:
                        {
                            $elemMatch: {
                                _id: ObjectId(address._id)
                            }
                        }
                    },
                    {
                        $set: {
                            "address.$": addressObj
                        }
                    }).then((response) => {
                        resolve(response)
                    })
            }catch(error){
                reject(error)
            }
            
        })
    },
    getUserAddress: (userId) => {
        return new Promise(async (resolve, reject) => {
            try{
                let addressArr = await db.get().collection(collection.USER_COLLECTION).aggregate([
                    {
                        '$match': {
                            '_id': ObjectId(userId)
                        }
                    }, {
                        '$unwind': {
                            'path': '$address'
                        }
                    }, {
                        '$match': {
                            'address.deletedAddress': false
                        }
                    }, {
                        '$project': {
                            'address': "$address",
                            '_id': 0
                        }
                    }, {
                        '$replaceRoot': {
                            'newRoot': '$address'
                        }
                    }
                ]).toArray()
                if (addressArr) {
                    const address = addressArr.slice(-3).reverse()
                    resolve(address)
                }
                else {
                    resolve()
                }
            }catch(error){
                reject(error)
            }
           

        })
    },
    deleteAddress: (addressId) => {
        return new Promise((resolve, reject) => {
            try{
                db.get().collection(collection.USER_COLLECTION).updateOne(
                    {
                        address: {
                            $elemMatch: {
                                _id: ObjectId(addressId)
                            }
                        }
                    },
                    {
                        $set: {
                            "address.$.deletedAddress": true
                        }
                    }).then((response) => {
                        resolve(response)
                    })
            }catch(error){
                reject(error)
            }
            
        })
    },
    updateUserData:(userData)=>{
        return new Promise((resolve, reject) => {
            try{
                db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userData.id)},
                {
                    $set:{
                        "firstName":userData.firstName,
                        "lastName":userData.lastName,
                        "email":userData.email,
                        "phone":userData.phone
                    }
                    
                }
            ).then(async(response)=>{
                let user = await db.get().collection(collection.USER_COLLECTION).findOne({phone:userData.phone})
                    response.user=user
                resolve(response)
            })
            }catch(error){
                reject(error)
            }
            
           
            
        })
    },
    updatePassword:(newPassword,phone)=>{
       
        return new Promise(async(resolve, reject) => {
            try{
                let password = await bcrypt.hash(newPassword, 10);
                db.get().collection(collection.USER_COLLECTION).updateOne({phone:phone},
                    {
                        $set:{
                            password:password
                        }
                        
                    }
                ).then((response)=>{
                    
                    resolve(response)
                })
            }catch(error){
                reject(error)
            }
           
            
        })
    }


}