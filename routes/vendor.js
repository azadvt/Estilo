var express = require('express');
var router = express.Router();
const vendorController = require('../controllers/vendor');
const multer=require('../middlewares/multer')

const verifyLogin=(req,res,next)=>{
    if(req.session.vendorLoggedIn){
        next()
    }else{
        res.redirect('/vendor/login')
    }

}

router.get('/',vendorController.getHome);   

router.get('/login',vendorController.getLogin);

router.post('/login',vendorController.postLogin)

router.get('/signup',vendorController.getSignUp);

router.post('/signup',vendorController.postSignUp)

router.get('/logOut',vendorController.getLogOut)

router.get('/viewProduct',verifyLogin,vendorController.getViewProduct)

router.get('/addProduct',verifyLogin,vendorController.getAddProduct)

router.post('/addProduct',verifyLogin,store.array('image',4),vendorController.postAddProduct)

router.get('/editProduct',verifyLogin,vendorController.getEditProduct)

router.get('/deleteProduct',verifyLogin,vendorController.getDeleteProduct)

router.post('/updateProduct',verifyLogin,store.array('image',4),vendorController.postUpdateProduct)

router.get('/viewCategory',verifyLogin,vendorController.getViewCategory)

router.get('/addCategory',verifyLogin,vendorController.getAddCategory)

router.post('/addCategory',verifyLogin,vendorController.postAddCategory)

router.get('/editCategory',verifyLogin,vendorController.getEditCategory)

router.post('/editCategory',verifyLogin,vendorController.postEditCategory)
    
router.get('/deleteCategory',verifyLogin,vendorController.getDeleteCategory)

router.get('/orders',verifyLogin,vendorController.getOrders)

router.post('/changeOrderStatus',verifyLogin,vendorController.getChangeOrderStatus)



module.exports = router;