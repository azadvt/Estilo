const db = require('../config/connection')
const collection = require('../config/collections')
const { response } = require('../app')
const ObjectId = require('mongodb').ObjectId
const Razorpay = require('razorpay');
const keys = require('../config/keys')
const key_id = keys.YOUR_KEY_ID
const key_secret= keys.YOUR_KEY_SECRET
var instance = new Razorpay({
    key_id: key_id,
    key_secret: key_secret,
});

module.exports = {

    placeOrder: (order, products, total) => {
        var currentdate = new Date();
        var date = currentdate.getDate() + "/"
            + (currentdate.getMonth() + 1) + "/"
            + currentdate.getFullYear()
        return new Promise((resolve, reject) => {
            let status = order.paymentMethod === 'onlinePayment' ? 'pending' : 'placed'
            let OrderObj = {
                user: ObjectId(order.userId),
                date: date,
                deliveryDetails: {
                    firstName: order.firstName,
                    lastName: order.lastName,
                    phone: order.phone,
                    email: order.email,
                    country: order.country,
                    addressLineOne: order.addressLineOne,
                    addressLineTwo: order.addressLineTwo,
                    town: order.town,
                    state: order.state,
                    postcode: order.postcode
                },
                products: products,
                totalAmount: total,
                status
            }

            db.get().collection(collection.ORDER_COLLECTION).insertOne(OrderObj).then((response) => {
                db.get().collection(collection.CART_COLLECTION).deleteOne({ user: ObjectId(order.userId) })
                resolve(response.insertedId)
            })
        })


    },
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
                    $project:
                    {
                        date: 1,
                        deliveryDetails: 1,
                        product: { $arrayElemAt: ['$product', 0] },
                        status: 1
                    }
                },
                {
                    $sort: {
                        date: -1
                    }
                }

            ]).toArray()
            console.log("products=", orderedProducts.product);
            resolve(orderedProducts)
        })
    },
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
    generateRazorpay: (orderId,total) => {
        console.log(orderId);
        return new Promise((resolve, reject) => {

            var options = {
                amount: total, 
                currency: "INR",
                receipt: orderId
              };
              instance.orders.create(options, function(err, order) {
                if(err){
                    console.log(err);
                }
                else{
                    console.log("order=",order);
                    resolve(order)
                }
               
              });

           

        })
    }
}