const path = require('path')
require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
})
const db = require('../config/connection')
const collection = require('../config/collections')
const { response } = require('../app')
const ObjectId = require('mongodb').ObjectId
const Razorpay = require('razorpay');
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
    
                let deliveryDetails = userData[0].address
                let netAmount =(discountData) ? discountData.amount : total
                let OrderObj = {
                    user: ObjectId(userId),
                    date: date,
                    deliveryDetails,
                    products: products,
                    totalAmount: netAmount,
                    coupon:orderData.coupon,
                    paymentMethod: orderData.paymentMethod,
                }
                
                if(discountData) db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(userId)},{ $set:{ coupon:true} })
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
              let orders = await db.get().collection(collection.ORDER_COLLECTION).find()
                let orderedProducts = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                  {
                    '$match': {
                      'user': new ObjectId(userId)
                    }
                  }, {
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
                    '$lookup': {
                      'from': 'coupon', 
                      'localField': 'coupon', 
                      'foreignField': 'couponCode', 
                      'as': 'coupon'
                    }
                  }, {
                    '$unwind': {
                      'path': '$coupon', 
                      'preserveNullAndEmptyArrays': true
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
                    '$addFields': {
                      'discount': {
                        '$sum': {
                          '$multiply': [
                            '$products.quantity', '$product.price', '$coupon.discount'
                          ]
                        }
                      }
                    }
                  }, {
                    '$addFields': {
                      'newTotal': {
                        '$subtract': [
                          '$productTotal', '$discount'
                        ]
                      }
                    }
                  }, {
                    '$match': {
                      'products.status': {
                        '$ne': 'Pending'
                      }
                    }
                  }, {
                    '$sort': {
                      'date': -1
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
        return new Promise((resolve, reject) => {
            try{
                var options = {
                    amount: total*100,
                    currency: "INR",
                    receipt: "" + orderId
                };
                instance.orders.create(options, function (err, order) {
                    if (err) {
                        alert(err);
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
                        resolve()
                    })
            }catch(error){
                reject(error)
            }

                
               
           
        })
    },
    changeOrderdProductStatus:(orderId,productId,status)=>{

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
                      '_id': new ObjectId(orderId)
                    }
                  }, {
                    '$unwind': {
                      'path': '$products'
                    }
                  }, {
                    '$match': {
                      'products.item': new ObjectId(productId)
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
                    '$lookup': {
                      'from': 'coupon', 
                      'localField': 'coupon', 
                      'foreignField': 'couponCode', 
                      'as': 'coupon'
                    }
                  }, {
                    '$unwind': {
                      'path': '$coupon', 
                      'preserveNullAndEmptyArrays': true
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
                    '$addFields': {
                      'discount': {
                        '$sum': {
                          '$multiply': [
                            '$products.quantity', '$product.price', '$coupon.discount'
                          ]
                        }
                      }
                    }
                  }, {
                    '$addFields': {
                      'newTotal': {
                        '$subtract': [
                          '$productTotal', '$discount'
                        ]
                      }
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
    getRevenue:(id)=>{
        return new Promise(async(resolve, reject) => {
            try{
                let total = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
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
                      '$match': {
                        'products.status': 'Delivered', 
                        'product.vendor': new ObjectId(id)
                      }
                    }, {
                      '$group': {
                        '_id': null, 
                        'total': {
                          '$sum': {
                            '$multiply': [
                              '$products.quantity', '$product.price'
                            ]
                          }
                        }
                      }
                    }
                  ]

            ).toArray()
            if(total.length==0){
                resolve(total=0)
            }else{
                resolve(total[0].total)   
            }
            }catch(error){
                reject(error)
            }
            
            
        })
    },
        getTotalOrders:()=>{
            return new Promise(async(resolve, reject) => {
                try{
                    let total = await db.get().collection(collection.ORDER_COLLECTION).find().count()
                    

                    resolve(total)
                }catch(error){
                        reject(error)
                    }
            })
        },
    getTotalUsers:()=>{
        return new Promise(async(resolve, reject) => {
            try{
                let total = await db.get().collection(collection.USER_COLLECTION).find().count()
                resolve(total)
            }
            catch(error){
                reject(error)
            }
        })
    },
    getTotalVendors:()=>{
        return new Promise(async(resolve, reject) => {
            try{
                let total = await db.get().collection(collection.VENDOR_COLLECTION).find().count()
                resolve(total)
            }
            catch(error){
                reject(error)
            }
        })
    },
    getTotalProducts:(id)=>{
        return new Promise(async(resolve, reject) => {
            try{
                let total = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                    {
                      '$match': {
                        'vendor': new ObjectId(id)
                      }
                    }, {
                      '$count': 'count'
                    }
                  ]).toArray()
                  if(total.length==0){
                    resolve(total=0)
                }else{
                    resolve(total[0].count)
                }
            }
            catch(error){
                reject(error)
            }
            
        })
    },
    getOrdersCount:(id)=>{
        return new Promise(async(resolve, reject) => {
            try{
                let total = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
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
                      '$match': {
                        'product.vendor': new ObjectId(id)
                      }
                    }, {
                      '$count': 'count'
                    }
                  ]).toArray()
                  if(total.length==0){
                    resolve(total=0)
                }else{
                    resolve(total[0].count)
                }
            }
            catch(error){
                reject(error)
            }
        })
    },
    getTotalOrdersCount:(id)=>{
      return new Promise(async(resolve, reject) => {
          try{
              let total = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
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
                  }, 
                   {
                    '$count': 'count'
                  }
                ]).toArray()
                if(total.length==0){
                  resolve(total=0)
              }else{
                  resolve(total[0].count)
              }
          }
          catch(error){
              reject(error)
          }
      })
  },
    
    getStatusWiseOrdersCount:(id,status)=>{
        return new Promise(async(resolve, reject) => {
            try{
                let total = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
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
                      '$match': {
                        'product.vendor': new ObjectId(id),
                        "products.status":status

                      }
                    }, {
                      '$count': 'count'
                    }
                  ]).toArray()
                if(total.length==0){
                    resolve(total=0)
                }else{
                    resolve(total[0].count)
                }
                  
            }
            catch(error){
                reject(error)
            }
        })
    },
        getTotalAmountDeliveredOrders:()=>{
            return new Promise(async(resolve, reject) => {
                try{
                    let total = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
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
                          '$match': {
                            'products.status': 'Delivered'
                          }
                        }, {
                          '$group': {
                            '_id': null, 
                            'total': {
                              '$sum': {
                                '$multiply': [
                                  '$products.quantity', '$product.price'
                                ]
                              }
                            }
                          }
                        }
                      ]).toArray()
                      if(total.length==0){
                          resolve(total=0)
                      }else{
                          resolve(total[0].total)
                      }
                }
                catch(error){
                    reject(error)
                }
            })
        },
        getMyCustomers:(id)=>{
            return new Promise(async(resolve, reject) => {
                try{
                    let count= await db.get().collection(collection.ORDER_COLLECTION).aggregate([
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
                          '$match': {
                            'product.vendor': new ObjectId(id)
                          }
                        }, {
                          '$group': {
                            '_id': {
                              'user': '$user'
                            }
                          }
                        }, {
                          '$count': 'count'
                        }
                      ]).toArray()
                      if(count.length==0){
                        resolve(count=0)
                    }else{
                        resolve(count[0].count)
                    }
                }
                catch(error){
                    reject(error)
                }
            })
            

        },
        getCountOfDeliveryMethod:(id,paymentMethod)=>{
          return new Promise(async(resolve, reject) => {
            try{
              let count= await db.get().collection(collection.ORDER_COLLECTION).aggregate([
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
                  '$match': {
                    'product.vendor': new ObjectId(id)
                  }
                }, {
                  '$match': {
                    'paymentMethod': paymentMethod
                  }
                }, {
                  '$count': 'count'
                }
              ]).toArray()
                if(count.length==0){
                  resolve(count=0)
              }else{
                  resolve(count[0].count)
              }
          }
          catch(error){
              reject(error)
          }
      })
        
        }
    

    
}