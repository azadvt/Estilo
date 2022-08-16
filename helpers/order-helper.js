const db = require('../config/connection')
const collection = require('../config/collections')
const { response } = require('../app')
const ObjectId = require('mongodb').ObjectId
const Razorpay = require('razorpay');
require('dotenv').config()
const key_id = process.env.YOUR_KEY_ID
const key_secret = process.env.YOUR_KEY_SECRET
var instance = new Razorpay({
    key_id: key_id,
    key_secret: key_secret,
});

module.exports = {

    placeOrder: (orderData, userId, products, total,discountData) => {
        var currentdate = new Date();
        var date = currentdate.getDate() + "/"
            + (currentdate.getMonth() + 1) + "/"
            + currentdate.getFullYear()
console.log('//////////');
console.log(discountData);
        return new Promise(async (resolve, reject) => {
            try{
                let userData = await db.get().collection(collection.USER_COLLECTION).aggregate([
                    {
                        $match: { _id: ObjectId(userId) }
                    },
                    {
                        $unwind: "$address"
                    },
                    {
                        $match: { "address._id": ObjectId(orderData.addressId) }
                    }
                ]).toArray()
    
                console.log(userData[0].address);
                let deliveryDetails = userData[0].address
                let netAmount =(discountData) ? discountData.amount : total
                let OrderObj = {
                    user: ObjectId(userId),
                    date: date,
                    deliveryDetails,
                    products: products,
                    totalAmount: netAmount,
                    paymentMethod: orderData.paymentMethod,
                }
    
                db.get().collection(collection.ORDER_COLLECTION).insertOne(OrderObj).then((response) => {
    
                    if (orderData.paymentMethod == "cashOnDelivery") {
    
    
                        resolve(response.insertedId)
                    }
    
                    resolve(response.insertedId)
                })
            }catch(error){
                reject(error)
            }
            

        })


    },

    //users ordered product
    getOrderdProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            try{
                let orderedProducts = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        $match: { user: ObjectId(userId) }
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $lookup:
                        {
                            from: 'products',
                            localField: 'products.item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
    
                    {
                        $unwind: '$product'
                    },{
                        '$addFields': {
                            'productTotal': {
                                '$sum': {
                                    '$multiply': [
                                        '$products.quantity', '$product.price'
                                    ]
                                }
                            }
                        }
                    },
                    {
                        $match: {
                            "products.status": {
                                $ne: "Pending"
                            }
                        }
                    },{
                        $sort: {
                            date: 1
                        }
                    }
                    
    
                ]).toArray()
                resolve(orderedProducts)
            }catch(error){
                reject(error)
            }
            
        })
    },
    //get full orders for vendor
    getOrders: (vendorId) => {
        return new Promise(async (resolve, reject) => {
            try{
                let orders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([

                    {
                        $unwind: "$products"
                    },
                    {
                        $lookup: {
                            from: 'products',
                            localField: "products.item",
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $unwind: "$product"
                    },{
                        '$addFields': {
                            'productTotal': {
                                '$sum': {
                                    '$multiply': [
                                        '$products.quantity', '$product.price'
                                    ]
                                }
                            }
                        }
                    },
                    {
                        $match: {
                            'product.vendor': ObjectId(vendorId)
                        }
                    },
                    {
                        $sort: {
                            date: -1
                        }
                    }
    
    
                ]).toArray()
                resolve(orders)
            }catch(error){
                reject(error)
            }
            
        })
    },
    generateRazorpay: (orderId, total) => {
        console.log(orderId);
        return new Promise((resolve, reject) => {
            try{
                var options = {
                    amount: total*100,
                    currency: "INR",
                    receipt: "" + orderId
                };
                instance.orders.create(options, function (err, order) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        resolve(order)
                    }
    
                });
            }catch(error){
                reject(error)
            }

            
        })
    },
    verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            try{
                var crypto = require("crypto");
                let hmac = crypto.createHmac('sha256', key_secret)
                hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
                hmac = hmac.digest('hex');
                console.log(hmac);
                console.log(details['payment[razorpay_signature]']);
                if (hmac == details['payment[razorpay_signature]']) {
                    resolve()
    
                } else {
                    reject()
    
                }
            }catch(error){
                reject(error)
            }
            


        })
    },
    changeStatus: (orderId) => {
        return new Promise((resolve, reject) => {
            try{
                db.get().collection(collection.ORDER_COLLECTION).updateOne(
                    {_id:ObjectId(orderId)},{$set:{'products.$[].status':"Placed"}}).then((response) => {
                        console.log(response);
                        resolve()
                    })
            }catch(error){
                reject(error)
            }

                
               
           
        })
    },
    changeOrderdProductStatus:(orderId,productId,status)=>{
        console.log(orderId,productId,status);

            return new Promise((resolve, reject) => {
                try{
                    db.get().collection(collection.ORDER_COLLECTION).updateOne(
                        {_id:ObjectId(orderId),
                        'products.item':ObjectId(productId)
                    },
                    {
                        $set:{
                            'products.$.status':status
                        }
                    }
                    ).then((response) => {
                        resolve(response)
                    })
                }catch(error){
                    reject(error)
                }
                
            })
    },
    getOneOrder:(orderId,productId)=>{
        return new Promise(async(resolve, reject) => {
            try{
                let orderedProduct= await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                        '$match': {
                            '_id': ObjectId(orderId)
                        }
                    }, {
                        '$unwind': {
                            'path': '$products'
                        }
                    }, {
                        '$match': {
                            'products.item': ObjectId(productId)
                        }
                    }, {
                        '$lookup': {
                            'from': 'products', 
                            'localField': 'products.item', 
                            'foreignField': '_id', 
                            'as': 'product'
                        }
                    }, {
                        '$unwind': {
                            'path': '$product'
                        }
                    }
                ]).toArray()
                resolve(orderedProduct[0])
            }catch(error){
                reject(error)
            }
           
        })
    },
    getFullOrders: () => {
        return new Promise(async (resolve, reject) => {
            try{
                let orders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                    {
                      '$unwind': {
                        'path': '$products'
                      }
                    }, {
                      '$lookup': {
                        'from': 'products', 
                        'localField': 'products.item', 
                        'foreignField': '_id', 
                        'as': 'product'
                      }
                    }, {
                      '$unwind': {
                        'path': '$product'
                      }
                    }, {
                      '$addFields': {
                        'productTotal': {
                          '$sum': {
                            '$multiply': [
                              '$products.quantity', '$product.price'
                            ]
                          }
                        }
                      }
                    }, {
                      '$lookup': {
                        'from': 'vendor', 
                        'localField': 'product.vendor', 
                        'foreignField': '_id', 
                        'as': 'vendor'
                      }
                    }, {
                      '$unwind': {
                        'path': '$vendor'
                      }
                    }
                  ]).toArray()
                resolve(orders)
            }catch(error){
                reject(error)
            }
            
        })
    },
    getTotalForAdmin:()=>{
        return new Promise(async(resolve, reject) => {
            try{
                let total = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                
                    {
                      '$match': {
                        'products.status': 'Delivered'
                      }
                    }, {
                      '$group': {
                        '_id': null, 
                        'totalAmount': {
                          '$sum': '$totalAmount'
                        }
                      }
                    }
                  
              ]

            ).toArray()
            if(total.length==0){
                resolve(total)
            }else{
                resolve(total[0].totalAmount)
            }
            }catch(error){
                reject(error)
            }
            
            
        })
    }
    
}