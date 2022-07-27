var express = require('express');
const twilio = require('twilio');
const { response } = require('../app');
var router = express.Router();
const usercontroller = require('../controllers/user')

const verifyLogin=(req,res,next)=>{

    if(req.session.userLoggedIn){
        next()
    }else{
        res.redirect('/login')
    }

}


/* GET home page. */
router.get('/', usercontroller.getHome);

router.get('/login', usercontroller.getLogin);

router.get('/signup', usercontroller.getSignUp);

router.post('/userLogin', usercontroller.postLogin)

router.post('/userSignUp', usercontroller.postSignUp)

router.get('/otp',verifyLogin, usercontroller.getOTP)

router.post('/otp', usercontroller.postOTP)

router.get('/logout', usercontroller.getLogout)

router.get('/viewProduct',verifyLogin,usercontroller.getViewProduct)

router.get('/cart',verifyLogin,usercontroller.getCart)

router.get('/addToCart/:id',verifyLogin,usercontroller.getAddToCart)

router.post('/changeProductQuantity',verifyLogin,usercontroller.postChangeProductQty)

router.post('/removeProductFromCart',verifyLogin,usercontroller.postRemoveProductFromCart)

router.get('/checkOut',verifyLogin,usercontroller.getCheckOut)

module.exports = router;
