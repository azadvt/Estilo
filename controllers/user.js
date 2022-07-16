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
            res.render('user/user-login', { userLogErr: req.session.userLogErr })
            req.session.userLogErr = true;
        }
    },
    getSignUp: (req, res) => {
        res.render('user/user-signup', { userEmailExistErr: req.session.userEmailExistErr })
        req.session.userEmailExistErr = false
    },
    postLogin: (req, res) => {
        userHelper.doLogin(req.body).then((response) => {
            if (response.status) {
                req.session.userLoggedIn = true
                req.session.user = response.user
                res.redirect('/')
            } else {
                req.session.userLogErr = true;
                res.redirect('/login')
            }
        })

    },
    postSignUp: (req, res) => {
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
        if (req.session.userLoggedIn) {
            res.redirect('/')
        }
        else {

        userphone = req.session.body.phone
        res.render('user/otp', { userphone, otpErr: req.session.otpErr })
        req.session.otpErr = false
        }
    },
    postOTP: (req, res) => {
        userphone = req.session.body.phone

        twilioHelpers.otpVerify(req.body, userphone).then((response) => {
            if (response.valid) {
                userHelper.doSignup(req.session.body).then((response) => {
                    req.session.userLoggedIn=true
                    req.session.user=req.session.body
                    res.redirect('/');
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