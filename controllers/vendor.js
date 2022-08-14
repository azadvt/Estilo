const { response } = require('../app')
const productHelper = require('../helpers/product-helper')
const vendorHelper = require('../helpers/vendor-helper')
const categoryHelper  = require('../helpers/category-helper')
const orderHelper = require('../helpers/order-helper')

module.exports = {
    getHome: (req, res) => {
        if (req.session.vendorLoggedIn) {
            vendor = req.session.vendor
            res.render('vendor/vendor-dashboard', { layout: 'admin-vendor-layout', vendorHeader: true, vendor })
        } else {
            res.redirect('/vendor/login')
        }
    },
    getLogin: (req, res) => {
        if (req.session.vendorLoggedIn) {
            res.redirect('/vendor')
        }
        res.render('vendor/vendor-login', { layout: 'admin-vendor-layout', vendorLogErr: req.session.vendorLogErr})
        req.session.vendorLogErr=false
    },
    postLogin: (req, res) => {
        vendorHelper.doLogin(req.body).then((response) => {
            if (response.status) {
                req.session.vendor = response.vendor
                req.session.vendorLoggedIn = true
                res.redirect('/vendor')
            }
            else {
                req.session.vendorLogErr = true
                res.redirect('/vendor/login')
            }
        })
    },
    getSignUp: (req, res) => {
        if (req.session.vendorLoggedIn) {
            res.redirect('/vendor')
        }
        else{
            res.render('vendor/vendor-signup', { layout: 'admin-vendor-layout' ,vendorEmailExistErr:req.session.vendorEmailExistErr})
        req.session.vendorEmailExistErr = false;
     }
        
    },
    postSignUp: (req, res) => {
        console.log(req.body);
        delete req.body.c_password
        vendorHelper.checkUnique(req.body).then((response) => {
            console.log(response.exist);
            if (response.exist) {
                req.session.vendorEmailExistErr = true;
                res.redirect('/vendor/signup')
            } else {
                req.session.body = req.body
                console.log(req.session.body);
                vendorHelper.doSignUp(req.body).then((response) => {
                    req.session.vendorLoggedIn = true
                    req.session.vendor = req.body
                    res.redirect('/vendor/')
                })

            }
        })
    },
    getLogOut: (req, res) => {
        req.session.vendorLoggedIn = false
        res.redirect('/vendor/login')
    },
    
    getViewProduct: (req,res)=>{
        vendor = req.session.vendor
        productHelper.getProductsForVendor(vendor._id).then((productData)=>{
            console.log(productData);
        res.render('vendor/view-product',{ layout: 'admin-vendor-layout', vendorHeader: true ,productData,vendor})

        })

    },
    getAddProduct:(req,res)=>{
        vendor = req.session.vendor    
        console.log(vendor);   
        categoryHelper.getViewCategory().then((categoryData)=>{
            res.render('vendor/add-product',{ layout: 'admin-vendor-layout', vendorHeader: true ,categoryData,vendor})
        })
    },
    postAddProduct:(req,res) =>{
        vendorId = req.session.vendor._id
        let images=[]
        let files=req.files
        console.log("files=",files);
        images=files.map((value)=>{
            return value.filename
        })
        productHelper.addProduct(req.body,images,vendorId).then((response)=>{
        })
        res.redirect('/vendor/addProduct')  

    },
    getEditProduct:(req,res)=>{
        vendor = req.session.vendor
        let productId=req.query.id
        categoryHelper.getViewCategory().then((categoryData)=>{
        
        productHelper.getOneProduct(productId).then((productData)=>{
        res.render('vendor/edit-product',{ layout: 'admin-vendor-layout', vendorHeader: true ,productData,categoryData,vendor} )
        })
    })
    },
    getDeleteProduct:(req,res)=>{
        let productId=req.query.id
        productHelper.deleteProduct(productId)
        res.redirect('/vendor/viewProduct')
    },
    postUpdateProduct:(req,res)=>{
        let productId=req.query.id
        let productData=req.body 
        let vendorId=req.session.vendor._id
        let images={}
        let files=req.files
        images=files.map((value)=>{return value.filename})
        console.log(productData);
        productHelper.updateProduct(productId,productData,images,vendorId)
        res.redirect('/vendor/viewProduct')
    },
    getViewCategory:(req,res)=>{
        vendor = req.session.vendor
        categoryHelper.getViewCategory().then((categoryData)=>{
        res.render('vendor/view-category',{ layout: 'admin-vendor-layout', vendorHeader: true,categoryData ,vendor})

        })
    },
    getAddCategory:(req,res)=>{
        vendor = req.session.vendor
        res.render('vendor/add-category',{ layout: 'admin-vendor-layout', vendorHeader: true ,vendor})
    },
    postAddCategory:(req,res)=>{
        categoryHelper.addCategory(req.body)
        res.redirect('/vendor/addCategory')
    },
    getEditCategory:(req,res)=>{
        let categoryId=req.query.id
        vendor = req.session.vendor
        categoryHelper.getOneCategory(categoryId).then((categoryData)=>{
        res.render('vendor/edit-category',{ layout: 'admin-vendor-layout', vendorHeader: true ,categoryData,vendor} )
        })
    },
    getDeleteCategory:(req,res)=>{
        let categoryId=req.query.id
        categoryHelper.deleteCategory(categoryId)
        res.redirect('/vendor/viewCategory')
    },
    postEditCategory:(req,res)=>{ 
        let categoryId=req.query.id
        let categoryData=req.body
        categoryHelper.updateCategory(categoryId,categoryData)
        res.redirect('/vendor/viewCategory')
    },
    getOrders:async(req,res)=>{
        vendor = req.session.vendor
        let orders=await orderHelper.getOrders(vendor._id)
        console.log(orders);
        res.render('vendor/view-orders',{ layout: 'admin-vendor-layout', vendorHeader: true,vendor,orders})
    },
    getChangeOrderStatus:(req,res)=>{
        console.log(req.body)
        
    },
    getProfile:(req,res)=>{
        res.render('vendor/profile',{ layout: 'admin-vendor-layout', vendorHeader: true,vendor})
    },
    updateOrderStatus:(req,res)=>{
        let orderId=req.body.orderId
        let productId=req.body.productId
        let status=req.body.status
        console.log(req.body);
        orderHelper.changeOrderdProductStatus(orderId,productId,status).then((response)=>{
            res.json({status:true})
        })
    }

}