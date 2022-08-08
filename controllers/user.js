const userHelper = require('../helpers/user-helper');
const twilioHelpers = require('../helpers/twilio-helper');
const productHelper = require('../helpers/product-helper');
const cartHelper = require('../helpers/cart-helper');
const { response } = require('../app');
const wishlistHelper = require('../helpers/wishlist-helper');
const orderHelper = require('../helpers/order-helper')

module.exports = {

    getHome: function (req, res, next) {


        productHelper.getAllProduct().then(async (productData) => {
            if (req.session.userLoggedIn) {
                let user = req.session.user
                cartCount = await cartHelper.getCartCount(user._id)
                wishlistcount = await wishlistHelper.getWishlistCount(user._id)
                res.render('user/home', { layout: 'user-layout', user, productData, cartCount, wishlistcount });
            } else {
                res.render('user/home', { layout: 'user-layout', productData,userExistErr: req.session.userExistErr,userLogErr: req.session.userLogErr })
                req.session.userLogErr = false;
                req.session.userExistErr = false
            }

        })
    },
   
    getSignUp: (req, res) => {
        if (req.session.userLoggedIn) {
            res.redirect('/')
        }
        else {
            res.render('user/user-signup', { userExistErr: req.session.userExistErr })
            
        }

    },
    postLogin: (req, res) => {
        userHelper.doLogin(req.body).then((response) => {
            console.log(response);
            if (response.blockedUser) {
                req.session.userLogErr = "your account is blocked "
                res.redirect('/')
            }
            else if (response.status) {
                req.session.userLoggedIn = true
                req.session.user = response.user
                res.redirect('/')
            } else {
                req.session.userLogErr = "Invalid Email or Password";
                res.redirect('/')
            }
        })

    },
    postSignUp: (req, res) => {
        userHelper.checkUnique(req.body).then((response) => {
            console.log("response=", response);
            if (response.existEmail && response.existPhone) {
                req.session.userExistErr = "Allready registerd Email and Phone"
                res.redirect('/')
            }
            else if (response.existEmail) {
                req.session.userExistErr = "Allready registered Email"
                res.redirect('/')
            }
            else if (response.existPhone) {
                req.session.userExistErr = "Allready registerd Phone Number"
                res.redirect('/')
            }
            else {
                req.session.body = req.body
                console.log(req.body);
                twilioHelpers.dosms(req.session.body).then((data) => {
                    if (data) {
                        res.redirect('/otp')
                    }
                })
            }
        })
    },
    getOTP: (req, res) => {
        if (req.session.userLoggedIn) {
            res.redirect('/')
        }
        else {

            userphone = req.session.body.phone
            res.render('user/otp', { userphone, otpErr: req.session.otpErr })
            req.session.otpErr = false
        }
    },
    postOTP: (req, res) => {
        userphone = req.session.body.phone

        twilioHelpers.otpVerify(req.body, userphone).then((response) => {
            if (response.valid) {
                userHelper.doSignup(req.session.body).then((response) => {
                    req.session.userLoggedIn = true
                    req.session.user = req.session.body
                    res.redirect('/');
                })
            } else {
                req.session.otpErr = true
                res.redirect('/otp')
            }
        })
    },
    getLogout: (req, res) => {
        req.session.userLoggedIn = false
        res.redirect('/')
    },
    getViewProduct: (req, res) => {
        console.log('product id')
        let productId = req.query.id
        productHelper.getOneProduct(productId).then((productData) => {
            console.log(productData);
            let user = req.session.user
            res.render('user/view-product', { layout: 'user-layout', user, productData })
        })
    },
    getCart: async (req, res) => {
        let user = req.session.user
        let products = await cartHelper.getCartProducts(user._id)
        let total = await cartHelper.getTotalAmount(user._id)

        res.render('user/cart', { layout: 'user-layout', user, products, total })
    },
    getAddToCart: (req, res) => {
        let productId = req.params.id
        let userId = req.session.user._id
        console.log(userId);
        console.log(productId);
        cartHelper.addToCart(productId, userId).then(() => {
            res.json({ status: true })
        })

    },
    postChangeProductQty: (req, res) => {
        console.log(req.body);
        cartHelper.changeProductQty(req.body).then(async (response) => {
            response.total = await cartHelper.getTotalAmount(req.body.userId)
            res.json(response)
        })
    },
    postRemoveProductFromCart: (req, res) => {
        console.log(req.body);
        cartHelper.removeProductFromCart(req.body).then((response) => {
            res.json({status:true})
        })
    },
    getAddToWishlist: (req, res) => {
        let productId = req.params.id
        let userId = req.session.user._id
        console.log(userId);
        console.log(productId);
        wishlistHelper.addToWishlist(productId, userId).then((response) => {
            console.log(response);
            res.json(response)
        })

    },
    getwishlist: async (req, res) => {
        let user = req.session.user
        let products = await wishlistHelper.getwishlistProducts(user._id)
        console.log(products);
        res.render('user/wishlist', { layout: 'user-layout', user, products })
    },
    postRemoveProductFromWishlist: (req, res) => {
        console.log(req.body);
        wishlistHelper.removeProductFromWishlist(req.body).then((response) => {
            res.json(response)
        })
    },

    getCheckOut: async (req, res) => {
        let user = req.session.user
        let products = await cartHelper.getCartProducts(user._id)
        let total = await cartHelper.getTotalAmount(user._id)
        let address  = await userHelper.getUserAddress(user._id)
        console.log(address);
        res.render('user/checkout', { layout: 'user-layout', user, products, total,address })

    },
    postUserAddress:(req,res)=>{
        console.log('worked');
        userId=req.session.user._id
        console.log(req.body);
        userHelper.addUserAddress(userId,req.body).then((response)=>{
            console.log(response);
            res.json({status:true})
        })
    },
    postPlaceOrder: async (req, res) => {
        console.log(req.body);
        userId=req.session.user._id
        let products = await cartHelper.getCartProductList(userId)
        let total = await cartHelper.getTotalAmount(userId)
        console.log("ddd");
        console.log(products);
        orderHelper.placeOrder(req.body,userId, products,total).then((orderId) => {
            if (req.body.paymentMethod == "cashOnDelivery") {
                orderHelper.changeStatus(orderId).then(() => {
                    cartHelper.deleteCart(userId).then(()=>{
                    })
                    res.json({ codSuccess: true })
                })

            }
            else {
                orderHelper.generateRazorpay(orderId, total).then((response) => {
                    res.json(response)
                })
            }

        })
    },
    postVerifyPayment: (req, res) => {
        let user = req.session.user
        orderHelper.verifyPayment(req.body).then(() => {
            orderHelper.changeStatus(req.body['order[receipt]']).then(() => {
                cartHelper.deleteCart(user._id).then(()=>{
                        
                })
                res.json({ status: true })
            })
        }).catch((err) => {
            res.json({ status: false })
            console.log('failed');
        })
    },
    getOrderPlaced: (req, res) => {
        let user = req.session.user
        res.render('user/order-placed', { layout: 'user-layout', user })
    },
    getviewOrders: async (req, res) => {
        let user = req.session.user
        let products = await orderHelper.getOrderdProducts(user._id)
        console.log("products", products);
        res.render('user/view-orders', { layout: 'user-layout', user, products })
    },
    
    postCouponCode: (req, res) => {
        console.log(req.body);
    },
    getProfile:async(req,res)=>{
        let user = req.session.user
        let address  = await userHelper.getUserAddress(user._id)
        res.render('user/profile',{layout:'user-layout',user,address})
    },
    postEditAddress:(req,res)=>{
        console.log(req.body)
                    
        userHelper.updateUserAddress(req.body).then((response)=>{
            res.json({staus:true})
        })

    },
    deleteAddress:(req,res)=>{
        console.log(req.params.id)
        userHelper.deleteAddress(req.params.id).then((response)=>{
            res.json({status:true})
        })
    },
    getOrderDetails:(req,res)=>{
        let user = req.session.user 
        let productId = req.query.proId
        let orderId = req.query.orderId
        console.log(orderId)
        orderHelper.getOneOrder(orderId,productId).then((orderedProduct)=>{
            console.log(orderedProduct)
            res.render('user/order-details',{ layout: 'user-layout', user,orderedProduct})
        })
        
    },
    updateOrderStatus:(req,res)=>{
        let orderId=req.body.orderId
        let productId=req.body.productId
        let status=req.body.status
        console.log(req.body);
        orderHelper.changeOrderdProductStatus(orderId,productId,status).then((response)=>{
            res.json({status:true})
        })
    },
    getShop:(req,res)=>{
        let user = req.session.user 
        productHelper.getAllProduct().then( (productData) => {
        res.render('user/shop',{ layout: 'user-layout', user,productData})
    })
    }


}