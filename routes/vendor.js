var express = require('express');
var router = express.Router();
const vendorController = require('../controllers/vendor');


router.get('/',vendorController.getHome);   

router.get('/login',vendorController.getLogin);

router.post('/login',vendorController.postLogin)

router.get('/signup',vendorController.getSignUp);

router.post('/signup',vendorController.postSignUp)

module.exports = router;