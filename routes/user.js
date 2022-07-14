var express = require('express');
const twilio = require('twilio');
const { response } = require('../app');
var router = express.Router();
const usercontroller = require('../controllers/user')

/* GET home page. */
router.get('/', usercontroller.getHome);

router.get('/login', usercontroller.getLogin);

router.get('/signup', usercontroller.getSignUp);

router.post('/userLogin', usercontroller.postUserLogin)

router.post('/userSignUp', usercontroller.postUerSignUp)

router.get('/otp', usercontroller.getOTP)

router.post('/otp', usercontroller.postOTP)

router.get('/loggout', usercontroller.getLogin)

module.exports = router;
