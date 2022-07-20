var express = require('express');
const { response } = require('../app');
var router = express.Router();
const admincontroller = require('../controllers/admin')


const verifyLogin=(req,res,next)=>{

    if(req.session.adminLoggedIn){
        next()
    }else{
        res.redirect('/admin/login')
    }

}

/* GET users listing. */
router.get('/',verifyLogin, admincontroller.getDashBoard);

router.get('/login', admincontroller.getLogin)

router.post('/adminLogin', admincontroller.postLogin)

router.get('/logOut', admincontroller.getLogout)

router.get('/viewUsers',verifyLogin,admincontroller.getViewUsers)

router.get('/viewVendors',verifyLogin,admincontroller.getViewVendors)

router.get('/blockUser',verifyLogin,admincontroller.getBlockUser)

router.get('/unBlockUser',verifyLogin,admincontroller.getUnBlockUser)

router.get('/blockVendor',verifyLogin,admincontroller.getBlockVendor)

router.get('/unBlockVendor',verifyLogin,admincontroller.getUnBlockVendor)

module.exports = router;
