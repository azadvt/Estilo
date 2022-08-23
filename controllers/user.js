const userHelper = require('../helpers/user-helper');
const twilioHelpers = require('../helpers/twilio-helper');
const productHelper = require('../helpers/product-helper');
const cartHelper = require('../helpers/cart-helper');
const { response } = require('../app');
const wishlistHelper = require('../helpers/wishlist-helper');
const orderHelper = require('../helpers/order-helper');
const couponHelper = require('../helpers/coupon-helper');
const categoryHelper = require('../helpers/category-helper');
const bannerHelper = require('../helpers/banner-helper')

let couponData = []
module.exports = {

    getHome: function (req, res, next) {
        console.log("djdj");
        try {
            productHelper.getAllProducts().then(async (productData) => {
                    let banners= await bannerHelper.getAllBanners()
                    console.log(banners);

                if (req.session.userLoggedIn) {
                    let user = req.session.user
                    cartCount = await cartHelper.getCartCount(user._id)
                    wishlistcount = await wishlistHelper.getWishlistCount(user._id)
                    res.render('user/home', { layout: 'user-layout', user, productData, cartCount, wishlistcount ,banners});
                } else {
                    res.render('user/home', { layout: 'user-layout', productData, userExistErr: req.session.userExistErr, userLogErr: req.session.userLogErr,banners })
                    req.session.userLogErr = false;
                    req.session.userExistErr = false
                }

            })
        }
        catch (error) {
            console.log(error);
            next(error)
        }

    },

    getSignUp: (req, res, next) => {
        try {
            if (req.session.userLoggedIn) {
                res.redirect('/')
            }
            else {
                res.render('user/user-signup', { userExistErr: req.session.userExistErr})

            }
        }
        catch (error) {
            next(error)
        }


    },
    postLogin: (req, res, next) => {
        try {
            userHelper.doLogin(req.body).then((response) => {
                console.log(response);
                if (response.blockedUser) {
                    res.json({ userBlockErr: true })
                }
                else if (response.status) {
                    req.session.userLoggedIn = true
                    req.session.user = response.user
                    res.json({ status: true })
                } else {
                    res.json({ userLogErr: true })
                }
            })
        }
        catch (error) {
            next(error)
        }


    },
    postSignUp: (req, res, next) => {
        try {
            console.log(req.body);
            delete req.body.c_password
            userHelper.checkUnique(req.body).then((response) => {
                console.log("response=", response);
                if (response.existEmail && response.existPhone) {
                    console.log('1')
                    let existErr = "Allready registerd Email and Phone"
                    res.json({ existErr })
                }
                else if (response.existEmail) {
                    console.log('2')
                    let existErr = "Allready registered Email"
                    res.json({ existErr })
                }
                else if (response.existPhone) {
                    console.log('3')
                    let existErr = "Allready registerd Phone Number"
                    res.json({ existErr })
                }
                else {
                    console.log('4')
                    req.session.body = req.body
                    twilioHelpers.dosms(req.session.body).then((data) => {
                        if (data) {
                            console.log('data');
                            let phone = req.body.phone.slice(6, 10)
                            res.json({ status: true, phone: phone })
                        }
                    })
                }
            })
        }
        catch (error) {
            next(error)
        }

    },

    postOTP: (req, res, next) => {
        try {
            let userphone = req.session.body.phone
            let otp = req.body.otp.join('')
            twilioHelpers.otpVerify(otp, userphone).then((response) => {
                if (response.valid) {
                    userHelper.doSignup(req.session.body).then((response) => {
                        req.session.userLoggedIn = true
                        req.session.user = req.session.body
                        console.log(userphone);
                        res.json({ status: true })
                    })
                } else {
                    res.json({ status: false })
                }
            })
        }
        catch (error) {
            next(error)
        }

    },

    getLogout: (req, res, next) => {
        try {
            req.session.userLoggedIn = false
            res.redirect('/')
        }
        catch (error) {
            next(error)
        }

    },
    getViewProduct: (req, res, next) => {
        try {
            console.log('product id')
            let productId = req.query.id
            productHelper.getOneProduct(productId).then(async(productData) => {
                let user = req.session.user
               let cartCount = await cartHelper.getCartCount(user._id)
                let    wishlistcount = await wishlistHelper.getWishlistCount(user._id)
                res.render('user/view-product', { layout: 'user-layout', user, productData ,cartCount, wishlistcount})
            })
        }
        catch (error) {
            next(error)
        }

    },
    getCart: async (req, res, next) => {
        try {
            let user = req.session.user
            let products = await cartHelper.getCartProducts(user._id)
            let total = await cartHelper.getTotalAmount(user._id)
            let    wishlistcount = await wishlistHelper.getWishlistCount(user._id)
            res.render('user/cart', { layout: 'user-layout', user, products, total , wishlistcount})
        }
        catch (error) {
            next(error)
        }

    },
    getAddToCart: (req, res, next) => {
        try {
            let productId = req.params.id
            let userId = req.session.user._id
            console.log(userId);
            console.log(productId);
            cartHelper.addToCart(productId, userId).then(() => {
                res.json({ status: true })
            })
        }
        catch (error) {
            next(error)
        }


    },
    postChangeProductQty: (req, res, next) => {
        try {
            cartHelper.changeProductQty(req.body).then(async (response) => {
                response.total = await cartHelper.getTotalAmount(req.body.userId)
                res.json(response)
            })
        }
        catch (error) {
            next(error)
        }

    },
    postAddToCartFromViewProduct: (req, res, next) => {
        try {
            let userId = req.session.user._id
            cartHelper.addToCartWithQnty(req.body, userId).then(() => {
                res.json({ status: true })
            })
        }
        catch (error) {
            next(error)
        }

    },
    postRemoveProductFromCart: (req, res, next) => {
        try {
            cartHelper.removeProductFromCart(req.body).then((response) => {
                res.json({ status: true })
            })
        }
        catch (error) {
            next(error)
        }


    },
    getAddToWishlist: (req, res, next) => {
        try {
            let productId = req.params.id
            let userId = req.session.user._id
            wishlistHelper.addToWishlist(productId, userId).then((response) => {
                console.log(response);
                res.json(response)
            })
        }
        catch (error) {
            next(error)
        }


    },
    getwishlist: async (req, res, next) => {
        try {
            let user = req.session.user
            let products = await wishlistHelper.getwishlistProducts(user._id)
            let cartCount = await cartHelper.getCartCount(user._id)
            res.render('user/wishlist', { layout: 'user-layout', user, products ,cartCount})
        }
        catch (error) {
            next(error)
        }

    },
    postRemoveProductFromWishlist: (req, res, next) => {
        try {
            wishlistHelper.removeProductFromWishlist(req.body).then((response) => {
                res.json(response)
            })
        }
        catch (error) {
            next(error)
        }

    },
    postCouponCode: async (req, res, next) => {
        try {
            let user = req.session.user
            let total = await cartHelper.getTotalAmount(user._id)
            couponHelper.applyCoupon(req.body.couponCode, total).then((response) => {
                res.json(response)
            }).catch((response) => {
                res.json(response)
            })
        }
        catch (error) {
            next(error)
        }


    },
    getCheckOut: async (req, res, next) => {
        try {
            let user = req.session.user
            let products = await cartHelper.getCartProducts(user._id)
            let total = await cartHelper.getTotalAmount(user._id)
            let address = await userHelper.getUserAddress(user._id)
            let cartCount = await cartHelper.getCartCount(user._id)
            let wishlistcount = await wishlistHelper.getWishlistCount(user._id)
            res.render('user/checkout', { layout: 'user-layout', user, products, total, address ,cartCount, wishlistcount})
        }
        catch (error) {
            next(error)
        }


    },
    postUserAddress: (req, res, next) => {
        try {
            userId = req.session.user._id
            console.log(req.body);
            userHelper.addUserAddress(userId, req.body).then((response) => {
                console.log(response);
                res.json({ status: true })
            })
        }
        catch (error) {
            next(error)
        }

    },
    postPlaceOrder: async (req, res, next) => {
        try {
            var discountData
            userId = req.session.user._id
            let products = await cartHelper.getCartProductList(userId)
            let total = await cartHelper.getTotalAmount(userId)
            console.log(products);
            if (req.body.coupon) {
                await couponHelper.applyCoupon(req.body.coupon, total).then((response) => {
                    discountData = response
                }).catch(() => discountData = null)
            }else{
                req.body.coupon=null
            }
            console.log("before body");
            console.log(req.body);
            orderHelper.placeOrder(req.body, userId, products, total, discountData).then((orderId) => {
                if (req.body.paymentMethod == "cashOnDelivery") {
                    orderHelper.changeStatus(orderId).then(() => {
                        cartHelper.deleteCart(userId).then(() => {
                        })
                        res.json({ codSuccess: true })
                    })
                }
                else {
                    let netAmount = (discountData) ? discountData.amount : total

                    orderHelper.generateRazorpay(orderId, netAmount).then((response) => {
                        res.json(response)
                    })
                }

            })
        }
        catch (error) {
            next(error)
        }

    },
    postVerifyPayment: (req, res, next) => {

        try {
            let user = req.session.user
            orderHelper.verifyPayment(req.body).then(() => {
                orderHelper.changeStatus(req.body['order[receipt]']).then(() => {
                    cartHelper.deleteCart(user._id).then(() => {

                    })
                    res.json({ status: true })
                })
            }).catch((err) => {
                res.json({ status: false })
                console.log('failed');
            })
        }
        catch (error) {
            next(error)
        }

    },
    getOrderPlaced: async(req, res, next) => {
        try {
            let user = req.session.user
            let    wishlistcount = await wishlistHelper.getWishlistCount(user._id)
            res.render('user/order-placed', { layout: 'user-layout', user , wishlistcount})
        }
        catch (error) {
            next(error)
        }

    },
    getviewOrders: async (req, res, next) => {
        try {
            let user = req.session.user
            let products = await orderHelper.getOrderdProducts(user._id)
            console.log("products", products);
            let cartCount = await cartHelper.getCartCount(user._id)
            let    wishlistcount = await wishlistHelper.getWishlistCount(user._id)
            res.render('user/view-orders', { layout: 'user-layout', user, products ,cartCount, wishlistcount})
        }
        catch (error) {
            next(error)
        }

    },


    getProfile: async (req, res, next) => {
        try {
            let user = req.session.user
            let address = await userHelper.getUserAddress(user._id)
            let cartCount = await cartHelper.getCartCount(user._id)
         let    wishlistcount = await wishlistHelper.getWishlistCount(user._id)
            res.render('user/profile', { layout: 'user-layout', user, address ,cartCount, wishlistcount})
        }
        catch (error) {
            next(error)
        }

    },
    postEditAddress: (req, res, next) => {

        try {
            userHelper.updateUserAddress(req.body).then((response) => {
                res.json({ staus: true })
            })
        }
        catch (error) {
            next(error)
        }


    },
    deleteAddress: (req, res, next) => {
        try {
            console.log(req.params.id)
            userHelper.deleteAddress(req.params.id).then((response) => {
                res.json({ status: true })
            })
        }
        catch (error) {
            next(error)
        }

    },
    getOrderDetails: async(req, res, next) => {
        try {
            let user = req.session.user
            let productId = req.query.proId
            let orderId = req.query.orderId
            let cartCount = await cartHelper.getCartCount(user._id)
             let    wishlistcount = await wishlistHelper.getWishlistCount(user._id)
            orderHelper.getOneOrder(orderId, productId).then((orderedProduct) => {
                orderedProduct.discount= orderedProduct.discount.toFixed(2)
                console.log(orderedProduct)
                res.render('user/order-details', { layout: 'user-layout', user, orderedProduct ,cartCount, wishlistcount})
            })
        }
        catch (error) {
            next(error)
        }

    },
    updateProfile: (req, res, next) => {
        try {
            userHelper.updateUserData(req.body).then((response) => {
                console.log(response);
                req.session.user = response.user
                res.json({ status: true })
            })
        }
        catch (error) {
            next(error)
        }

    },
    getFilter: async (req, res, next) => {
        try {
            let productData = await productHelper.getProductCategoryWise(req.params.id)
            let category = await categoryHelper.getViewCategory()
            console.log(productData);
            res.render('user/shop', { layout: 'user-layout', productData, category })
        }
        catch (error) {
            next(error)
        }


    },
        searchProducts:async(req,res,next)=>{
            console.log(req.params.id);
            let category = await categoryHelper.getViewCategory()
            const productData = await productHelper.searchProducts(req.query.search,req.params.id);
            try {
                console.log(req.query);
                let category = await categoryHelper.getViewCategory()
                res.render('user/shop', { layout: 'user-layout', productData, category })
            } catch (err) {
                res.render('user/shop', { layout: 'user-layout', productData:[], category })

            }
        
        }
    ,
    getShop: async (req, res, next) => {
        try {
            let category = await categoryHelper.getViewCategory()
            
            productHelper.getAllProducts().then((productData) => {
                res.render('user/shop', { layout: 'user-layout', productData, category})
            })
        }
        catch (error) {
            next(error)
        }

    },
    getForgottPassword: (req, res, next) => {
        try {
            req.session.phone = req.body.phone
            userHelper.checkUnique(req.body).then((response) => {
                if (response.existEmail && response.existPhone) {
                    twilioHelpers.dosms(req.body).then((data) => {
                        if (data) {
                            let phone = req.body.phone.slice(6, 10)
                            res.json({ status: true, phone: phone })
                        }
                        else {
                            res.json({ status: false })
                        }
                    })
                }
            })
        }
        catch (error) {
            next(error)
        }


    },
    postForgottPasswordOtp: (req, res, next) => {
        try {
            let otp = req.body.otp.join('')
            let userphone = req.session.phone
            twilioHelpers.otpVerify(otp, userphone).then((response) => {
                if (response.valid) {
                    res.json({ status: true })
                }
                else {
                    res.json({ status: false })
                }
            })
        }
        catch (error) {
            next(error)
        }

    },
    updatePassword: (req, res, next) => {
        try {
            delete req.body.c_password
            let phone = req.session.phone
            console.log(req.body);
            console.log(phone);
            userHelper.updatePassword(req.body.password, phone).then((response) => {
                res.json({ status: true })
            })
        }

        catch (error) {
            next(error)
        }
    },
    postViewBill:(req,res,next)=>{
        try{
              let user = req.session.user
            console.log(req.params)
            orderHelper.getOneOrder(req.params.orderId,req.params.prodId).then((orderedProduct)=>{
                orderedProduct.discount= orderedProduct.discount.toFixed(2)
                console.log(orderedProduct);
                res.render('user/view-bill',{ layout: 'user-layout', user, orderedProduct })
            })
        }
        catch(error){
            next(error)
        }
    },
    updateOrderStatus:(req,res,next)=>{
        try{
            let orderId=req.body.orderId
            let productId=req.body.productId
            let status=req.body.status
            console.log(req.body);
            orderHelper.changeOrderdProductStatus(orderId,productId,status).then((response)=>{
                res.json({status:true})
            })
        }
        catch(error){
            next(error)
        }
            
        }


}