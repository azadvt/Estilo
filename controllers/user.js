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
    getLogin: (req, res, next) => {
        if (req.session.userLoggedIn) {
            res.redirect('/')
        }
        else {
            res.render('user/user-login', { userLogErr: req.session.userLogErr })
            req.session.userLogErr = false;
        }
    },
    getSignUp: (req, res) => {
        if (req.session.userLoggedIn) {
            res.redirect('/')
        }
        else{
            res.render('user/user-signup', { userExistErr: req.session.userExistErr})
            req.session.userExistErr = false
        }
        
    },
    postLogin: (req, res) => {
        userHelper.doLogin(req.body).then((response) => {
            if(response.blockedUser){
                req.session.userLogErr="your account is blocked "
                res.redirect('/login')
            }
           else if (response.status) {
                req.session.userLoggedIn = true
                req.session.user = response.user
                res.redirect('/')
            } else {
                req.session.userLogErr = "Invalid Email or Password";
                res.redirect('/login')
            }
        })

    },
    postSignUp: (req, res) => {
        userHelper.checkUnique(req.body).then((response) => {
            console.log("response=",response);
            if (response.existEmail&&response.existPhone) {
                req.session.userExistErr = "Allready registerd Email and Phone"
                res.redirect('/signup')
            }
            else if(response.existEmail){
                req.session.userExistErr="Allready registered Email"
                res.redirect('/signup')
            }
            else if(response.existPhone){
                req.session.userExistErr="Allready registerd Phone Number"
                res.redirect('/signup')
            }
             else {
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