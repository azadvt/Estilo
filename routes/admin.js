var express = require('express');
const { response } = require('../app');
var router = express.Router();
const adminHelper = require('../helpers/admin-helper')

/* GET users listing. */
router.get('/', function (req, res, next) {
  if(req.session.adminLoggedIn){
    res.render('admin/home', { layout: 'admin-layout' })
  }else{
    res.redirect('/admin/login')
  }
});

router.get('/login', (req, res) => {
  if(req.session.adminLoggedIn){
    res.redirect('/admin')
  }else{
     res.render('admin/admin-login',{adminLoggErr:req.session.adminLoggErr} )
    req.session.adminLoggErr=false
  }
})

router.post('/adminLogin', (req, res) => {
  adminHelper.doLogin(req.body).then((response) => {
    if (response) {
      req.session.adminLoggedIn=true
      res.redirect('/admin')
    }
    else{
      req.session.adminLoggErr = true;
      res.redirect('/admin/login')
    }
  })
})

router.get('/logOut',(req,res)=>{
  req.session.adminLoggedIn=false
  res.redirect('/admin/login')
})

module.exports = router;
