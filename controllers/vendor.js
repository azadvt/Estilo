const { response } = require('../app')
const vendorHelper = require('../helpers/vendor-helper')

module.exports = {
    getHome: (req, res) => {
        if(req.session.vendorLoggedIn){
            res.render('vendor/vendor-dashboard', { layout: 'vendor-layout', vendorHeader: true })
        }else{
            res.redirect('/vendor/login')
        }
    },
    getLogin: (req, res) => {
        if(req.session.vendorLoggedIn){
            res.redirect('/vendor')
        }
        res.render('vendor/vendor-login', { layout: 'vendor-layout' })
    },
    postLogin: (req, res) => {
        vendorHelper.doLogin(req.body).then((response)=>{
            if(response.status){
                req.session.vendor=response.vendor
                req.session.vendorLoggedIn=true
                res.redirect('/vendor')
            }
            else{
                req.session.vendorLogErr=true
                res.redirect('/vendor/login')
            }
        })
    },
    getSignUp: (req, res) => {
        res.render('vendor/vendor-signup', { layout: 'vendor-layout' })
    },
    postSignUp: (req, res) => {
        vendorHelper.doSignUp(req.body)
        console.log(req.body)
    },
    getLogOut:(req,res)=>{
        req.session.vendorLoggedIn=false
        res.redirect('/vendor/login')
    }
}