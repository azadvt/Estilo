const userHelper = require('../helpers/user-helper');
const twilioHelpers = require('../helpers/twilio-helper');

module.exports = {

    getHome: function (req, res, next) {
        if (req.session.userLoggedIn) {
            let user = req.session.user
            res.render('user/home', { layout: 'user-layout', user });
        } else {
            res.render('user/home', { layout: 'user-layout' })
        }
    },
    getLogin: function (req, res, next) {
        if (req.session.userLoggedIn) {
            res.redirect('/')
        }
        else {
            res.render('user/user-login', { userLoggErr: req.session.userLoggErr })
            req.session.userLoggErr = false
        }
    },
    getSignUp: (req, res) => {
        res.render('user/user-signup', { userEmailExistErr: req.session.userEmailExistErr })
        req.session.userEmailExistErr = false
    },
    postUserLogin: (req, res) => {
        userHelper.doLogin(req.body).then((response) => {
            if (response.status) {
                req.session.userLoggedIn = true
                req.session.user = response.user
                res.redirect('/')
            } else {
                req.session.userLoggErr = true;
                res.redirect('/login')
            }
        })

    },
    postUerSignUp: (req, res) => {
        userHelper.checkUnique(req.body).then((response) => {
            if (response.exist) {
                req.session.userEmailExistErr = true
                res.redirect('/signup')
            } else {
                req.session.body = req.body
                twilioHelpers.dosms(req.session.body).then((data) => {
                    if (data) {
                        res.redirect('/otp')
                    }
                })

            }
        })
    },
    getOTP: (req, res) => {
        userphone = req.session.body.phone
        res.render('user/otp', { userphone, otpErr: req.session.otpErr })
        req.session.otpErr = false
    },
    postOTP: (req, res) => {
        twilioHelpers.otpVerify(req.body, req.session.body).then((response) => {
            if (response.valid) {
                userHelper.doSignup(req.session.body).then((response) => {
                    res.redirect('/login')
                })
            } else {
                req.session.otpErr = true
                res.redirect('/otp')
            }
        })
    },
    getLogout: (req, res) => {
        req.session.userLoggedIn = false
        res.redirect('/login')
    }

}