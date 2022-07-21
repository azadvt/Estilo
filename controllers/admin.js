const adminHelper = require('../helpers/admin-helper')
const userHelper = require('../helpers/user-helper')
const vendorHelper = require('../helpers/vendor-helper')

module.exports = {
    getLogin: (req, res) => {
        if (req.session.adminLoggedIn) {
            res.redirect('/admin')
        } else {
            res.render('admin/admin-login', { adminLoggErr: req.session.adminLoggErr , layout: 'admin-layout' })
            req.session.adminLoggErr = false
        }
    },
    postLogin: (req, res) => {
        adminHelper.doLogin(req.body).then((response) => {
            if (response) {
                req.session.adminLoggedIn = true
                res.redirect('/admin')
            }
            else {
                req.session.adminLoggErr = "Invalid email or password"
                req.session.adminLoggedIn = false
                res.redirect('/admin/login')
            }
        })
    },
    getLogout: (req, res) => {
        req.session.adminLoggedIn = false
        res.redirect('/admin/login')
    },
    getDashBoard: (req, res, next) => {
            res.render('admin/admin-dashboard', { adminHeader:true ,layout: 'admin-layout'})
       
    },
    getViewUsers: (req, res) => {
        userHelper.getAllUsers().then((userDetails)=>{
            res.render('admin/view-users', { layout: 'admin-layout',userDetails,adminHeader:true})
        })
        
    },
    getViewVendors:(req,res)=>{
        vendorHelper.getAllVendor().then((vendorDetails)=>{
            res.render('admin/view-vendors',{layout:'admin-layout',vendorDetails,adminHeader:true})
        })
    },
        getBlockUser:(req,res)=>{
        let userId=req.query.id
        userHelper.blockUser(userId)
        res.redirect('/admin/viewUsers')
    },
    getUnBlockUser:(req,res)=>{ 
        let userId=req.query.id
        userHelper.unBlockUser(userId)
        res.redirect('/admin/viewUsers')
  
    },
    getBlockVendor:(req,res)=>{
        let vendorId=req.query.id
        console.log(vendorId);
        vendorHelper.blockVendor(vendorId)
        res.redirect('/admin/viewVendors')
    },
    getUnBlockVendor:(req,res)=>{ 
        let vendorId=req.query.id
        vendorHelper.unBlockVendor(vendorId)
        res.redirect('/admin/viewVendors')
  
    },

    

}