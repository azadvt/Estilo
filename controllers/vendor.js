const { response } = require('../app')
const productHelper = require('../helpers/product-helper')
const vendorHelper = require('../helpers/vendor-helper')
const categoryHelper  = require('../helpers/category-helper')
module.exports = {
    getHome: (req, res) => {
        if (req.session.vendorLoggedIn) {
            vendor = req.session.vendor
            res.render('vendor/vendor-dashboard', { layout: 'vendor-layout', vendorHeader: true, vendor })
        } else {
            res.redirect('/vendor/login')
        }
    },
    getLogin: (req, res) => {
        if (req.session.vendorLoggedIn) {
            res.redirect('/vendor')
        }
        res.render('vendor/vendor-login', { layout: 'vendor-layout', vendorLogErr: req.session.vendorLogErr})
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
            res.render('vendor/vendor-signup', { layout: 'vendor-layout' ,vendorEmailExistErr:req.session.vendorEmailExistErr})
        req.session.vendorEmailExistErr = false;
     }
        
    },
    postSignUp: (req, res) => {
        console.log(req.body);
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
        productHelper.getAllProduct().then((productData)=>{
        res.render('vendor/view-product',{ layout: 'vendor-layout', vendorHeader: true ,productData})

        })

    },
    getAddProduct:(req,res)=>{
        res.render('vendor/add-product',{ layout: 'vendor-layout', vendorHeader: true })
    },
    postAddProduct:(req,res) =>{
        let images=[]
        let files=req.files
        console.log("files=",files);
        images=files.map((value)=>{
            return value.filename
        })
        console.log("images=",images);
        productHelper.addProduct(req.body,images)
        res.redirect('/vendor/addProduct')  
    },
    getEditProduct:(req,res)=>{
        let productId=req.query.id
        productHelper.getOneProduct(productId).then((productData)=>{
        res.render('vendor/edit-product',{ layout: 'vendor-layout', vendorHeader: true ,productData} )
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
        let images={}
        let files=req.files
        images=files.map((value)=>{return value.filename})
        console.log(productData);
        productHelper.updateProduct(productId,productData,images)
        res.redirect('/vendor/viewProduct')
    },
    getViewCategory:(req,res)=>{
        categoryHelper.getViewCategory().then((categoryData)=>{
        res.render('vendor/view-category',{ layout: 'vendor-layout', vendorHeader: true,categoryData })

        })
    },
    getAddCategory:(req,res)=>{
        res.render('vendor/add-category',{ layout: 'vendor-layout', vendorHeader: true })
    },
    postAddCategory:(req,res)=>{
        categoryHelper.addCategory(req.body)
        res.send('hello')
    }

}