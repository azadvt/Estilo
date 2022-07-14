var express = require('express');
var router = express.Router();
const vendorController = require('../controllers/vendor');


router.get('/',vendorController.getHome);   

router.get('/login',vendorController.getLogin)

router.get('/signup',vendorController.getSignUp)

module.exports = router;