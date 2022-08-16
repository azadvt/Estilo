var express = require('express');
const { response } = require('../app');
var router = express.Router();
const adminController = require('../controllers/admin')


const verifyLogin=(req,res,next)=>{

    if(req.session.adminLoggedIn){
        next()
    }else{
        res.redirect('/admin/login')
    }

}

/* GET users listing. */
router.get('/',verifyLogin, adminController.getDashBoard);

router.get('/login', adminController.getLogin)

router.get('/signup',adminController.getSignUp);

router.post('/signup',adminController.postSignUp)

router.post('/adminLogin', adminController.postLogin)

router.get('/logOut', adminController.getLogout)

router.get('/viewUsers',verifyLogin,adminController.getViewUsers)

router.get('/viewVendors',verifyLogin,adminController.getViewVendors)

router.get('/blockUnBlockUser/:id',verifyLogin,adminController.getblockUnBlockUser)

router.get('/blockUnBlockVendor/:id',verifyLogin,adminController.getBlockVendor)

router.get('/unBlockVendor',verifyLogin,adminController.getUnBlockVendor)

router.get('/viewProduct',verifyLogin,adminController.getViewProduct)


router.get('/addProduct',verifyLogin,adminController.getAddProduct)

router.post('/addProduct',verifyLogin,store.array('image',4),adminController.postAddProduct)

router.get('/editProduct',verifyLogin,adminController.getEditProduct)

router.get('/deleteProduct',verifyLogin,adminController.getDeleteProduct)

router.post('/updateProduct',verifyLogin,store.array('image',4),adminController.postUpdateProduct)

router.get('/viewCategory',verifyLogin,adminController.getViewCategory)

router.get('/addCategory',verifyLogin,adminController.getAddCategory)

router.post('/addCategory',verifyLogin,adminController.postAddCategory)

router.get('/editCategory',verifyLogin,adminController.getEditCategory)

router.post('/editCategory',verifyLogin,adminController.postEditCategory)
    
router.get('/deleteCategory',verifyLogin,adminController.getDeleteCategory)

router.get('/viewOwnProduct',verifyLogin,adminController.getViewOwnProduct)

router.get('/ordersForAdmin',verifyLogin,adminController.getOrdersForAdmin)

router.get('/ordersForVendors',verifyLogin,adminController.getOrdersForVendors)

router.post('/updateOrderStatus',verifyLogin,adminController.updateOrderStatus)

router.get('/coupon',verifyLogin,adminController.getCoupon)

router.post('/addCoupon',verifyLogin,adminController.postAddCoupon)

router.get('/deleteCoupon/:id',verifyLogin,adminController.getDeleteCoupon)

router.get('/banner',verifyLogin,adminController.getBanner)


module.exports = router;
