const adminHelper = require('../helpers/admin-helper')

module.exports = {
    getHome: function (req, res, next) {
        if (req.session.adminLoggedIn) {
            res.render('admin/home', { layout: 'admin-layout' })
        } else {
            res.redirect('/admin/login')
        }
    },
    getLogin: (req, res) => {
        if (req.session.adminLoggedIn) {
            res.redirect('/admin')
        } else {
            res.render('admin/admin-login', { adminLoggErr: req.session.adminLoggErr })
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
    }
}