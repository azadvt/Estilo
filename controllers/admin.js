const adminHelper = require('../helpers/admin-helper')
const userHelper = require('../helpers/user-helper')
const vendorHelper = require('../helpers/vendor-helper')
const productHelper = require('../helpers/product-helper')
const categoryHelper  = require('../helpers/category-helper')
const orderHelper = require('../helpers/order-helper')
const couponHelper= require('../helpers//coupon-helper')
const bannerHelper = require('../helpers/banner-helper')
const { response } = require('../app')
const multer=require('../middlewares/multer')

module.exports = {
        getLogin: (req, res,next) => {
         try{
            if (req.session.adminLoggedIn) {
                res.redirect('/admin')
            } else {
                res.render('admin/admin-login', { adminLoggErr: req.session.adminLoggErr , layout: 'admin-vendor-layout' })
                req.session.adminLoggErr = false
            }
        }
        catch(error){
            next(error)
        }
    }
    ,
    postLogin: (req, res,next) => {
        try{
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

        }
        catch(error){
            next(error)
        }
       
    },
    getSignUp: (req, res,next) => {
    try{
        if (req.session.adminLoggedIn) {
            res.redirect('/admin')
        }
        else{
            res.render('admin/admin-signup', { layout: 'admin-vendor-layout',adminEmailExistErr:req.session.adminEmailExistErr})
            req.session.adminEmailExistErr=false
        }
    }
    catch(error){
        next(error)
    }
       
        
    },
    postSignUp: (req, res,next) => {

    try{

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
    }
    catch(error){
        next(error)
    }
        
    },

    getLogout: (req, res,next) => {
    try{
        req.session.adminLoggedIn = false
        res.redirect('/admin/login')
    }
    catch(error){
        next(error)
    }
        
    },
    getDashBoard: async(req, res, next) => {
        admin = req.session.admin
        try{
            let total =await orderHelper.getRevenue(admin._id)
            let vendorTotal = await orderHelper.getTotalOrders()
            let totalUsers = await orderHelper.getTotalUsers()
            let totalVendors = await orderHelper.getTotalVendors()
            let totalProducts = await orderHelper.getTotalProducts(admin._id)
            let ordersCount = await orderHelper.getOrdersCount(admin._id)
            let deliveredOrdersCount = await orderHelper.getDeliveredOrdersCount(admin._id)
            let canceledOrdersCount = await orderHelper.getCanceledOrdersCount(admin._id)
            let totalIncome = await orderHelper.getTotalAmountDeliveredOrders()
            let customers = await orderHelper.getMyCustomers(admin._id)
            res.render('admin/admin-dashboard', 
            {
                adminHeader:true ,
                layout: 'admin-vendor-layout',
                total, vendorTotal,totalUsers,
                totalVendors,totalProducts,
                ordersCount,deliveredOrdersCount,
                canceledOrdersCount,totalIncome,customers
            })
        }
        catch(error){
            next(error)
        }
        
       
    },
    getViewUsers: (req, res,next) => {
        try{
            userHelper.getAllUsers().then((userDetails)=>{
                res.render('admin/view-users', { layout: 'admin-vendor-layout',userDetails,adminHeader:true})
            })
        }
        catch(error){
            next(error)
        }
        
    },
    getViewVendors:(req,res,next)=>{
        try{
            vendorHelper.getAllVendor().then((vendorDetails)=>{
                res.render('admin/view-vendors',{layout:'admin-vendor-layout',vendorDetails,adminHeader:true})
            })
        }
        catch(error){
            next(error)
        }
        
    },
    getblockUnBlockUser:(req,res,next)=>{ 
    try{
        let userId=req.params.id
        console.log(userId);
        userHelper.blockUnBlockUser(userId).then((response)=>{
            res.json({status:true})
        })
    }
    catch(error){
        next(error)
    }
        
  
    },
    getBlockVendor:(req,res,next)=>{
    try{
        let adminId=req.params.id
        console.log(adminId);
        vendorHelper.blockVendor(adminId).then((response)=>{
            res.json({status:true})
        })
    }
    catch(error){
        next(error)
    }
        
        
    },
    getUnBlockVendor:(req,res,next)=>{ 
        try{
            let vendorId=req.query.id   
        vendorHelper.unBlockVendor(vendorId)
        res.redirect('/admin/viewVendors')
        }
        catch(error){
            next(error)
        }
        
  
    },
    getViewProduct: (req,res,next)=>{
        try{
            productHelper.getAllProductForAdmin().then((productData)=>{
                console.log(productData);
            res.render('admin/view-vendors-product',{ layout: 'admin-vendor-layout', adminHeader: true ,productData})
            })
        }
        catch(error){
            next(error)
        }

    },getAddProduct:(req,res,next)=>{
        try{
            admin = req.session.admin    
            console.log(admin);   
            categoryHelper.getViewCategory().then((categoryData)=>{
                res.render('admin/add-product',{ layout: 'admin-vendor-layout', adminHeader: true ,categoryData,admin})
            })
        }
        catch(error){
            next(error)
        }
       
    },
    postAddProduct:(req,res,next) =>{
        try{
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
        }
        catch(error){
            next(error)
        }
          

    },
    getEditProduct:(req,res,next)=>{
        try{
            admin = req.session.admin
            let productId=req.query.id
            categoryHelper.getViewCategory().then((categoryData)=>{
            
            productHelper.getOneProduct(productId).then((productData)=>{
            res.render('admin/edit-product',{ layout: 'admin-vendor-layout', adminHeader: true ,productData,categoryData,admin} )
            })
        })
        }
        catch(error){
            next(error)
        }
        
    
    },
    getDeleteProduct:(req,res,next)=>{
    try{
        let productId=req.query.id
        productHelper.deleteProduct(productId)
        res.redirect('/admin/viewProduct')
    }
    catch(error){
        next(error)
    }
        
    },
    postUpdateProduct:(req,res,next)=>{
        try{
            let productId=req.query.id
        let productData=req.body 
        let adminId=req.session.admin._id
        let images={}
        let files=req.files
        images=files.map((value)=>{return value.filename})
        console.log(productData);
        productHelper.updateProduct(productId,productData,images,adminId)
        res.redirect('/admin/viewProduct')
        }
        catch(error){
            next(error)
        }
        
    },
    getViewCategory:(req,res,next)=>{
        try{
            admin = req.session.admin
        categoryHelper.getViewCategory().then((categoryData)=>{
        res.render('admin/view-category',{ layout: 'admin-vendor-layout', adminHeader: true,categoryData ,admin})

        })
        }
        catch(error){
            next(error)
        }
        
    },
    getAddCategory:(req,res,next)=>{
        try{
            admin = req.session.admin
        res.render('admin/add-category',{ layout: 'admin-vendor-layout', adminHeader: true ,admin})
        }
        catch(error){
            next(error)
        }
        
    },
    postAddCategory:(req,res,next)=>{
        try{
            categoryHelper.addCategory(req.body)
        res.redirect('/admin/addCategory')
        }
        catch(error){
            next(error)
        }
        
    },
    getEditCategory:(req,res,next)=>{
        try{
            let categoryId=req.query.id
        admin = req.session.admin
        categoryHelper.getOneCategory(categoryId).then((categoryData)=>{
        res.render('admin/edit-category',{ layout: 'admin-vendor-layout', adminHeader: true ,categoryData,admin} )
        })
        }
        catch(error){
            next(error)
        }
        
    },
    getDeleteCategory:(req,res,next)=>{
        try{
            let categoryId=req.query.id
        categoryHelper.deleteCategory(categoryId)
        res.redirect('/admin/viewCategory')
        }
        catch(error){
            next(error)
        }
        
    },
    postEditCategory:(req,res,next)=>{ 
        try{
            let categoryId=req.query.id
        let categoryData=req.body
        categoryHelper.updateCategory(categoryId,categoryData)
        res.redirect('/admin/viewCategory')
        }
        catch(error){
            next(error)
        }
        
    },
    getViewOwnProduct:(req,res,next)=>{
        try{
            let admin=req.session.admin
        productHelper.getAdminOwnProducts(admin._id).then((productData)=>{
            res.render('admin/view-own-products',{ layout: 'admin-vendor-layout', adminHeader: true ,productData})
        })
        }
        catch(error){
            next(error)
        }
        
    },
    getOrdersForAdmin:async(req,res,next)=>{
        try{
            admin = req.session.admin
            let orders=await orderHelper.getOrders(admin._id)
            console.log(orders);
            res.render('admin/view-own-orders',{ layout: 'admin-vendor-layout', adminHeader: true,orders})
        }
        catch(error){
            next(error)
        }
            
    }
    ,
    getOrdersForVendors:async(req,res,next)=>{
        try{
            admin = req.session.admin
        let orders=await orderHelper.getFullOrders()
        console.log(orders);
        res.render('admin/view-vendors-orders',{ layout: 'admin-vendor-layout', adminHeader: true,orders}) 
        }
        catch(error){
            next(error)
        }
           
    },
    updateOrderStatus:(req,res,next)=>{
    try{
        let orderId=req.body.orderId
        let productId=req.body.productId
        let status=req.body.status
        console.log(req.body);
        orderHelper.changeOrderdProductStatus(orderId,productId,status).then((response)=>{
            res.json({status:true})
        })
    }
    catch(error){
        next(error)
    }
        
    },
    getCoupon:async(req,res,next)=>{
        try{
            let coupons = await couponHelper.getAllCoupon()
        console.log(coupons);
        res.render('admin/add-coupon',{ layout: 'admin-vendor-layout', adminHeader: true,coupons})
        }
        catch(error){
            next(error)
        }
        
    },
    postAddCoupon:(req,res,next)=>{
        try{
            console.log(req.body);
        couponHelper.addCoupon(req.body).then((response)=>{
            res.json({status:true})
        })
        }
        catch(error){
            next(error)
        }
        
    },
    getDeleteCoupon:(req,res,next)=>{
        try{
            let couponId=req.params.id
        couponHelper.deleteCoupon(couponId).then((response)=>{
            res.json({status:true})
        })
        }
        catch(error){
            next(error)
        }
        
        
    },
    getSubBanner:async(req,res,next)=>{
        try{
           let banners= await bannerHelper.getAllBanners()
           let categories = await categoryHelper.getViewCategory()
            res.render('admin/sub-banner',{ layout: 'admin-vendor-layout', adminHeader: true,banners,categories})
        }
        catch(error){
            next(error)
        }
        
    },
    postBanner:(req,res,next)=>{
        try{
            bannerHelper.addBanner(req.body,req.files[0].filename).then((response)=>{
                res.redirect('/admin/banner')
            })
        }
        catch(error){
            next(error)
        }
    },
    deleteBanner:(req,res,next)=>{
        let bannerId=req.params.id
        try{
            bannerHelper.deleteBanner(bannerId).then((response)=>{
                res.json({status:true})
            })
        }
        catch(error){
            next(error)
        }
    },
    getEditBanner:async(req,res,next)=>{
        let bannerId=req.params.id
        try{
        let categories = await categoryHelper.getViewCategory()
           let banner = await bannerHelper.getOneBanner(bannerId)
            res.render('admin/edit-banner',{ layout: 'admin-vendor-layout', adminHeader: true,banner,categories })
        }
        catch(error){
            next(error)
        }
    },
    updateBanner:(req,res,next)=>{
        console.log(req.body)
        try{
            bannerHelper.updateBanner(req.body,req.files[0].filename).then((response)=>{
                res.redirect('/admin/banner')
            })
        }
        catch(error){
            next(error)
        }
    }
}