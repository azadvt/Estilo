const db = require('../config/connection')
const collection = require('../config/collections')
const bcrypt = require('bcrypt')
const { response } = require('../app')
const ObjectId = require('mongodb').ObjectId

module.exports = {
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            userData.password = await bcrypt.hash(userData.password, 10);
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                resolve(userData)
            })
        })
    }, doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
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
                            console.log(response);
                            resolve(response)
                        } else {
                            response.status = true;
                            response.blockedUser = false
                            console.log(response);
                            resolve(response);
                        }
                    } else {
                        resolve({ status: false })
                    }
                })
            } else {
                resolve({ status: false })
            }
        })
    }, checkUnique: (userData) => {
        return new Promise(async (resolve, reject) => {
            let valid = {}
            let existEmail = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email })
            let existPhone = await db.get().collection(collection.USER_COLLECTION).findOne({ phone: userData.phone })

            console.log("existemail=", existEmail);
            console.log("existphone=", existPhone);

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
                resolve(valid)
            }
        })
    },
    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            let userDetails = await db.get().collection(collection.USER_COLLECTION).find().sort({ firstName: 1 }).toArray()
            resolve(userDetails)
        })
    },
    blockUnBlockUser: async (userId) => {
        console.log(userId);
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectId(userId) })

            console.log(user);
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
        })
    },
    addUserAddress: (userId, userAddress) => {
        console.log(userId);
        const addressId = new ObjectId()
        userAddress.deletedAddress = false
        userAddress._id = addressId
        let address = [userAddress]
        return new Promise(async (resolve, reject) => {

            let userDetails = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: ObjectId(userId) })
            console.log(userDetails);
            console.log('hei');
            if (userDetails.address) {
                db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userId) }, {
                    $push: {
                        address: userAddress
                    }

                }).then((response) => {
                    resolve(response)
                })
            } else {
                console.log('heeehehe');
                db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userId) }, {
                    $set:
                    {
                        address: address
                    }
                }).then((response) => {
                    resolve(response)
                })
            }


        })
    },
    updateUserAddress: (address) => {
        let addressObj = address
        addressObj._id = ObjectId(address._id)
        addressObj.deletedAddress = false
        return new Promise((resolve, reject) => {
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
        })
    },
    getUserAddress: (userId) => {
        return new Promise(async (resolve, reject) => {
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
            console.log(addressArr);
            if (addressArr) {
                console.log(addressArr);
                const address = addressArr.slice(-3).reverse()
                resolve(address)
            }
            else {
                resolve()
            }

        })
    },
    deleteAddress: (addressId) => {
        return new Promise((resolve, reject) => {
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
        })
    },
    updateUserData:(userData)=>{
        console.log(userData);
        return new Promise((resolve, reject) => {
            
            db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userData.id)},
                {
                    $set:{
                        "firstName":userData.firstName,
                        "lastName":userData.lastName,
                        "email":userData.email,
                        "phone":userData.phone
                    }
                    
                }
            ).then((response)=>{
                response.user
                resolve(response)
            })
            
        })
    }


}