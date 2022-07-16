var express = require('express');
const { response } = require('../app');
var router = express.Router();
const admincontroller = require('../controllers/admin')

/* GET users listing. */
router.get('/', admincontroller.getDashBoard);

router.get('/login', admincontroller.getLogin)

router.post('/adminLogin', admincontroller.postLogin)

router.get('/logOut', admincontroller.getLogout)

router.get('/viewUsers',admincontroller.getViewUsers)
module.exports = router;
