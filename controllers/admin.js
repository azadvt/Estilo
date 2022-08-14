const adminHelper = require('../helpers/admin-helper')
const userHelper = require('../helpers/user-helper')
const vendorHelper = require('../helpers/vendor-helper')
const productHelper = require('../helpers/product-helper')
const categoryHelper  = require('../helpers/category-helper')
const orderHelper = require('../helpers/order-helper')
const couponHelper= require('../helpers//coupon-helper')
const { response } = require('../app')
const multer=require('../middlewares/multer')

module.exports = {
    getLogin: (req, res) => {
        if (req.session.adminLoggedIn) {
            res.redirect('/admin')
        } else {
            res.render('admin/admin-login', { adminLoggErr: req.session.adminLoggErr , layout: 'admin-vendor-layout' })
            req.session.adminLoggErr = false
        }
    },
    postLogin: (req, res) => {
        adminHelper.doLogin(req.body).then((response) => {
            if (response.status) {
                req.session.adminLoggedIn = true
                req.session.admin=response.admin
                res.redirect('/admin')
            }
            else {
                req.session.adminLoggErr = "Invalid email or password"
                req.session.adminLoggedIn = false
                res.redirect('/admin/login')
            }
        })
    },
    getSignUp: (req, res) => {
        if (req.session.adminLoggedIn) {
            res.redirect('/admin')
        }
        else{
            res.render('admin/admin-signup', { layout: 'admin-vendor-layout',adminEmailExistErr:req.session.adminEmailExistErr})
            req.session.adminEmailExistErr=false
        }
        
    },
    postSignUp: (req, res) => {
        delete req.body.c_password
            console.log(req.body);
            delete req.body.c_password
            adminHelper.checkUnique(req.body).then((response) => {
                console.log(response.exist);
                if (response.exist) {
                    req.session.adminEmailExistErr = true;
                    res.redirect('/admin/signup')
                } else {
                    adminHelper.doSignUp(req.body).then((response) => {
                        req.session.adminLoggedIn = true
                        req.session.admin = req.body
                        res.redirect('/admin/')
                    })
    
                }
            })
             

        
    },
    getLogout: (req, res) => {
        req.session.adminLoggedIn = false
        res.redirect('/admin/login')
    },
    getDashBoard: async(req, res, next) => {
        
        let total =await orderHelper.getTotalForAdmin()

            res.render('admin/admin-dashboard', 
            { 
                adminHeader:true ,
                layout: 'admin-vendor-layout',
                total
            })
       
    },
    getViewUsers: (req, res) => {
        userHelper.getAllUsers().then((userDetails)=>{
            res.render('admin/view-users', { layout: 'admin-vendor-layout',userDetails,adminHeader:true})
        })
        
    },
    getViewVendors:(req,res)=>{
        vendorHelper.getAllVendor().then((vendorDetails)=>{
            res.render('admin/view-vendors',{layout:'admin-vendor-layout',vendorDetails,adminHeader:true})
        })
    },
    getblockUnBlockUser:(req,res)=>{ 
        let userId=req.params.id
        console.log(userId);
        userHelper.blockUnBlockUser(userId).then((response)=>{
            res.json({status:true})
        })
  
    },
    getBlockVendor:(req,res)=>{
        let adminId=req.params.id
        console.log(adminId);
        vendorHelper.blockVendor(adminId).then((response)=>{
            res.json({status:true})
        })
        
    },
    getUnBlockVendor:(req,res)=>{ 
        let vendorId=req.query.id
        vendorHelper.unBlockVendor(vendorId)
        res.redirect('/admin/viewVendors')
  
    },
    getViewProduct: (req,res)=>{
        productHelper.getAllProductForAdmin().then((productData)=>{
            console.log(productData);
        res.render('admin/view-vendors-product',{ layout: 'admin-vendor-layout', adminHeader: true ,productData})
        })

    },getAddProduct:(req,res)=>{
        admin = req.session.admin    
        console.log(admin);   
        categoryHelper.getViewCategory().then((categoryData)=>{
            res.render('admin/add-product',{ layout: 'admin-vendor-layout', adminHeader: true ,categoryData,admin})
        })
    },
    postAddProduct:(req,res) =>{
        console.log(req.session.admin);
        adminId = req.session.admin._id
        let images=[]
        let files=req.files
        console.log("files=",files);
        images=files.map((value)=>{
            return value.filename
        })
        productHelper.addProduct(req.body,images,adminId).then((response)=>{
        })
        res.redirect('/admin/addProduct')  

    },
    getEditProduct:(req,res)=>{
        admin = req.session.admin
        let productId=req.query.id
        categoryHelper.getViewCategory().then((categoryData)=>{
        
        productHelper.getOneProduct(productId).then((productData)=>{
        res.render('admin/edit-product',{ layout: 'admin-vendor-layout', adminHeader: true ,productData,categoryData,admin} )
        })
    })
    },
    getDeleteProduct:(req,res)=>{
        let productId=req.query.id
        productHelper.deleteProduct(productId)
        res.redirect('/admin/viewProduct')
    },
    postUpdateProduct:(req,res)=>{
        let productId=req.query.id
        let productData=req.body 
        let adminId=req.session.admin._id
        let images={}
        let files=req.files
        images=files.map((value)=>{return value.filename})
        console.log(productData);
        productHelper.updateProduct(productId,productData,images,adminId)
        res.redirect('/admin/viewProduct')
    },
    getViewCategory:(req,res)=>{
        admin = req.session.admin
        categoryHelper.getViewCategory().then((categoryData)=>{
        res.render('admin/view-category',{ layout: 'admin-vendor-layout', adminHeader: true,categoryData ,admin})

        })
    },
    getAddCategory:(req,res)=>{
        admin = req.session.admin
        res.render('admin/add-category',{ layout: 'admin-vendor-layout', adminHeader: true ,admin})
    },
    postAddCategory:(req,res)=>{
        categoryHelper.addCategory(req.body)
        res.redirect('/admin/addCategory')
    },
    getEditCategory:(req,res)=>{
        let categoryId=req.query.id
        admin = req.session.admin
        categoryHelper.getOneCategory(categoryId).then((categoryData)=>{
        res.render('admin/edit-category',{ layout: 'admin-vendor-layout', adminHeader: true ,categoryData,admin} )
        })
    },
    getDeleteCategory:(req,res)=>{
        let categoryId=req.query.id
        categoryHelper.deleteCategory(categoryId)
        res.redirect('/admin/viewCategory')
    },
    postEditCategory:(req,res)=>{ 
        let categoryId=req.query.id
        let categoryData=req.body
        categoryHelper.updateCategory(categoryId,categoryData)
        res.redirect('/admin/viewCategory')
    },
    getViewOwnProduct:(req,res)=>{
        let admin=req.session.admin
        productHelper.getAdminOwnProducts(admin._id).then((productData)=>{
            res.render('admin/view-own-products',{ layout: 'admin-vendor-layout', adminHeader: true ,productData})
        })
    },
    getOrdersForAdmin:async(req,res)=>{
            admin = req.session.admin
            let orders=await orderHelper.getOrders(admin._id)
            console.log(orders);
            res.render('admin/view-own-orders',{ layout: 'admin-vendor-layout', adminHeader: true,orders})
    }
    ,
    getOrdersForVendors:async(req,res)=>{
        admin = req.session.admin
        let orders=await orderHelper.getFullOrders()
        console.log(orders);
        res.render('admin/view-vendors-orders',{ layout: 'admin-vendor-layout', adminHeader: true,orders})    
    },
    updateOrderStatus:(req,res)=>{
        let orderId=req.body.orderId
        let productId=req.body.productId
        let status=req.body.status
        console.log(req.body);
        orderHelper.changeOrderdProductStatus(orderId,productId,status).then((response)=>{
            res.json({status:true})
        })
    },
    getCoupon:async(req,res)=>{
        let coupons = await couponHelper.getAllCoupon()
        console.log(coupons);
        res.render('admin/add-coupon',{ layout: 'admin-vendor-layout', adminHeader: true,coupons})
    },
    postAddCoupon:(req,res)=>{
        console.log(req.body);
        couponHelper.addCoupon(req.body).then((response)=>{
            res.json({status:true})
        })
    },
    getDeleteCoupon:(req,res)=>{
        let couponId=req.params.id
        couponHelper.deleteCoupon(couponId).then((response)=>{
            res.json({status:true})
        })
        
    }
}