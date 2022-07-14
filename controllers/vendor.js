

module.exports={
    getHome:(req,res)=>{
        res.render('vendor/home',{layout: 'admin-layout'})
    },
    getLogin:(req,res)=>{
        res.render('vendor/vendor-login')
    },
    getSignUp:(req,res)=>{
        res.render('vendor/vendor-signup')
    }
}