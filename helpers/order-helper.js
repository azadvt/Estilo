const db = require('../config/connection')
const collection = require('../config/collections')
const { response } = require('../app')
const ObjectId = require('mongodb').ObjectId
const Razorpay = require('razorpay');
const keys = require('../config/keys')
const key_id = keys.YOUR_KEY_ID
const key_secret = keys.YOUR_KEY_SECRET
var instance = new Razorpay({
    key_id: key_id,
    key_secret: key_secret,
});

module.exports = {

    placeOrder: async(orderData,userId, products, total) => {
        var currentdate = new Date();
        var date = currentdate.getDate() + "/"
            + (currentdate.getMonth() + 1) + "/"
            + currentdate.getFullYear()
        return new Promise((resolve, reject) => {
            let address=await db.get().collection(collection.USER_COLLECTION).aggregate([
                {
                    $match:{_id:ObjectId(userId)}
                }
            ])




            let OrderObj = {
                user: ObjectId(order.userId),
                date: date,

                products: products,
                totalAmount: total,
                paymentMethod: order.paymentMethod,
                status: 'pending'
            }




            db.get().collection(collection.ORDER_COLLECTION).insertOne(OrderObj).then((response) => {

                if (order.paymentMethod == "cashOnDelivery") {

    
                    resolve(response.insertedId)
                }

                resolve(response.insertedId)
            })


        })


    },
    //users ordered product
    getOrderdProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
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
                },
                {
                    $match: {
                        status: {
                            $eq: "placed"
                        }
                    }
                }

            ]).toArray()
            console.log("products=", orderedProducts.product);
            resolve(orderedProducts)
        })
    },
    //get full orders for vendor
    getOrders: (vendorId) => {
        return new Promise(async (resolve, reject) => {
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
        })
    },
    generateRazorpay: (orderId, total) => {
        console.log(orderId);
        return new Promise((resolve, reject) => {

            var options = {
                amount: total,
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
        })
    },
    verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
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


        })
    },
    changeStatus: (orderId) => {
        return new Promise((resolve, reject) => {
            console.log(orderId);
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: ObjectId(orderId) },
                {
                    $set: {
                        status: 'placed'
                    }
                }

            ).then((response) => {
                console.log(response);
                resolve()
            })
        })
    }
}