var express = require('express');
const twilio = require('twilio');
const { response } = require('../app');
var router = express.Router();
const usercontroller = require('../controllers/user')

const verifyLogin=(req,res,next)=>{

    if(req.session.userLoggedIn){
        next()
    }else{
        res.redirect('/')
    }

}


/* GET home page. */
router.get('/', usercontroller.getHome);

router.post('/userLogin', usercontroller.postLogin)

router.post('/userSignUp', usercontroller.postSignUp)

router.post('/otp', usercontroller.postOTP)

router.get('/logout', usercontroller.getLogout)

router.get('/viewProduct',verifyLogin,usercontroller.getViewProduct)

router.get('/cart',verifyLogin,usercontroller.getCart)

router.get('/addToCart/:id',verifyLogin,usercontroller.getAddToCart)

router.post('/changeProductQuantity',verifyLogin,usercontroller.postChangeProductQty)

router.post('/removeProductFromCart',verifyLogin,usercontroller.postRemoveProductFromCart)

router.get('/wishlist',verifyLogin,usercontroller.getwishlist)

router.get('/addToWishlist/:id',verifyLogin,usercontroller.getAddToWishlist)

router.post('/viewProductAddToCart',verifyLogin,usercontroller.postAddToCartFromViewProduct)

router.post('/removeProductFromWishlist',verifyLogin,usercontroller.postRemoveProductFromWishlist)

router.get('/checkOut',verifyLogin,usercontroller.getCheckOut)

router.post('/userAddress',verifyLogin,usercontroller.postUserAddress)

router.post('/checkOut',verifyLogin,usercontroller.postPlaceOrder)

router.get('/orderSuccess',verifyLogin,usercontroller.getOrderPlaced)

router.get('/viewOrders',verifyLogin,usercontroller.getviewOrders)

router.post('/verifyPayment',verifyLogin,usercontroller.postVerifyPayment)

router.post('/couponCode',verifyLogin,usercontroller.postCouponCode)

router.get('/profile',verifyLogin,usercontroller.getProfile)

router.post('/editAddress',verifyLogin,usercontroller.postEditAddress)

router.get('/deleteAddress/:id',verifyLogin,usercontroller.deleteAddress)

router.get('/orderDetails',verifyLogin,usercontroller.getOrderDetails)

router.get('/shop',verifyLogin,usercontroller.getShop)

router.post('/editProfile',verifyLogin,usercontroller.updateProfile)

module.exports = router;
