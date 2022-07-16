const adminHelper = require('../helpers/admin-helper')
const userHelper = require('../helpers/user-helper')

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
                req.session.adminLoggErr = true;
                res.redirect('/admin/login')
            }
        })
    },
    getLogout: (req, res) => {
        req.session.adminLoggedIn = false
        res.redirect('/admin/login')
    },
    getDashBoard: (req, res, next) => {
        if (req.session.adminLoggedIn) {
            res.render('admin/admin-dashboard', { adminHeader:true ,layout: 'admin-layout'})
        } else {
            res.redirect('/admin/login')
        }
    },
    getViewUsers: (req, res) => {
        userHelper.getAllUsers().then((userDetails)=>{
            res.render('admin/view-users', { layout: 'admin-layout',userDetails,adminHeader:true})
        })
        
    }
}