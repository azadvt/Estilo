var express = require('express');
const twilio = require('twilio');
const { response } = require('../app');
const userHelper = require('../helpers/user-helper');
const twilioHelpers = require('../helpers/twilio-helper');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  if (req.session.userLoggedIn) {
    let user = req.session.user
    res.render('user/home', { layout: 'user-layout', user });
  } else {
    res.render('user/home', { layout: 'user-layout' })
  }
});


router.get('/login', function (req, res, next) {
  if (req.session.userLoggedIn) {
    res.redirect('/')
  }
  else {
    res.render('user/user-login', { userLoggErr: req.session.userLoggErr })
    req.session.userLoggErr = false
  }
});

router.get('/signup', (req, res) => {
  res.render('user/user-signup',{userEmailExistErr:req.session.userEmailExistErr})
  req.session.userEmailExistErr=false
})

router.post('/userLogin', (req, res) => {
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

})

router.post('/userSignUp', (req, res) => {
  userHelper.checkUnique(req.body).then((response)=>{
    if(response.exist){
      req.session.userEmailExistErr=true
      res.redirect('/signup')
    }else{
      userHelper.doSignup(req.body).then((response) => {
        req.session.userphone=response.phone
        twilioHelpers.dosms(response).then((data)=>{
          if(data){
            res.redirect('/otp')
          }
        })
      })
    }
  })


  
})

router.get('/otp',(req,res)=>{
  userphone=req.session.userphone
  res.render('user/otp',{userphone})
})

router.post('/otp',(req,res)=>{
  twilioHelpers.otpVerify(req.body,userphone)
})


router.get('/loggout', (req, res) => {
  req.session.userLoggedIn = false
  res.redirect('/login')
})

module.exports = router;
