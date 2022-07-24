const db = require('../config/connection')
const collection = require('../config/collections')
const bcrypt = require('bcrypt')
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
    blockUser: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userId) }, { $set: { blockedUser: true } })
        })
    },
    unBlockUser: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: ObjectId(userId) }, { $set: { blockedUser: false } })
        })
    }
}