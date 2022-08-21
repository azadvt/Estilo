const { response } = require('../app')
const productHelper = require('../helpers/product-helper')
const vendorHelper = require('../helpers/vendor-helper')
const categoryHelper = require('../helpers/category-helper')
const orderHelper = require('../helpers/order-helper')

module.exports = {
    getHome: async(req, res, next) => {
        try {
            if (req.session.vendorLoggedIn) {
                vendor = req.session.vendor
                let revenue =await orderHelper.getRevenue(vendor._id)
                let income=(revenue-revenue/10) 
                let totalProducts = await orderHelper.getTotalProducts(vendor._id)
                let ordersCount = await orderHelper.getOrdersCount(vendor._id)
                let deliveredOrdersCount = await orderHelper.getDeliveredOrdersCount(vendor._id)
            let canceledOrdersCount = await orderHelper.getCanceledOrdersCount(vendor._id)
            let customers = await orderHelper.getMyCustomers(vendor._id)

                res.render('vendor/vendor-dashboard', { layout: 'admin-vendor-layout', 
                vendorHeader: true, vendor ,
                totalProducts,ordersCount,deliveredOrdersCount,canceledOrdersCount,revenue,income,customers})
            } else {
                res.redirect('/vendor/login')
            }
        }
        catch (error) {
            next(error)
        }

    },
    getLogin: (req, res, nex) => {
        try {
            if (req.session.vendorLoggedIn) {
                res.redirect('/vendor')
            }
            res.render('vendor/vendor-login', { layout: 'admin-vendor-layout', vendorLogErr: req.session.vendorLogErr })
            req.session.vendorLogErr = false
        } catch (error) {
            next(error)
        }

    },
    postLogin: (req, res, nex) => {
        try {
            vendorHelper.doLogin(req.body).then((response) => {
                if (response.status) {
                    req.session.vendor = response.vendor
                    req.session.vendorLoggedIn = true
                    res.redirect('/vendor')
                }
                else {
                    req.session.vendorLogErr = true
                    res.redirect('/vendor/login')
                }
            })
        }
        catch (error) {
            next(error)
        }
    },
    getSignUp: (req, res, nex) => {
        try {
            if (req.session.vendorLoggedIn) {
                res.redirect('/vendor')
            }
            else {
                res.render('vendor/vendor-signup', { layout: 'admin-vendor-layout', vendorEmailExistErr: req.session.vendorEmailExistErr })
                req.session.vendorEmailExistErr = false;
            }
        }
        catch (error) {
            next(error)
        }

    },
    postSignUp: (req, res, nex) => {
        try {
            delete req.body.c_password
            vendorHelper.checkUnique(req.body).then((response) => {
                console.log(response.exist);
                if (response.exist) {
                    req.session.vendorEmailExistErr = true;
                    res.redirect('/vendor/signup')
                } else {
                    req.session.body = req.body
                    console.log(req.session.body);
                    vendorHelper.doSignUp(req.body).then((response) => {
                        req.session.vendorLoggedIn = true
                        req.session.vendor = req.body
                        res.redirect('/vendor/')
                    })

                }
            })
        } catch (error) {
            next(error)
        }

    },
    getLogOut: (req, res, nex) => {
        try {
            req.session.vendorLoggedIn = false
            res.redirect('/vendor/login')
        }
        catch (error) {
            next(error)
        }
    },

    getViewProduct: (req, res, nex) => {

        try {
            vendor = req.session.vendor
            productHelper.getProductsForVendor(vendor._id).then((productData) => {
                console.log(productData);
                res.render('vendor/view-product', { layout: 'admin-vendor-layout', vendorHeader: true, productData, vendor })

            })
        } catch (error) {
            next(error)
        }

    },
    getAddProduct: (req, res, nex) => {

        try {
            vendor = req.session.vendor
            console.log(vendor);
            categoryHelper.getViewCategory().then((categoryData) => {
                res.render('vendor/add-product', { layout: 'admin-vendor-layout', vendorHeader: true, categoryData, vendor })
            })
        } catch (error) {
            next(error)
        }
    },
    postAddProduct: (req, res, nex) => {

        try {
            vendorId = req.session.vendor._id
            let images = []
            let files = req.files
            console.log("files=", files);
            images = files.map((value) => {
                return value.filename
            })
            productHelper.addProduct(req.body, images, vendorId).then((response) => {
            })
            res.redirect('/vendor/addProduct')
        } catch (error) {
            next(error)
        }

    },
    getEditProduct: (req, res, nex) => {

        try {
            vendor = req.session.vendor
            let productId = req.query.id
            categoryHelper.getViewCategory().then((categoryData) => {

                productHelper.getOneProduct(productId).then((productData) => {
                    res.render('vendor/edit-product', { layout: 'admin-vendor-layout', vendorHeader: true, productData, categoryData, vendor })
                })
            })
        } catch (error) {
            next(error)
        }
    },
    getDeleteProduct: (req, res, nex) => {

        try {
            let productId = req.query.id
            productHelper.deleteProduct(productId)
            res.redirect('/vendor/viewProduct')
        } catch (error) {
            next(error)
        }
    },
    postUpdateProduct: (req, res, nex) => {

        try {
            let productId = req.query.id
            let productData = req.body
            let vendorId = req.session.vendor._id
            let images = {}
            let files = req.files
            images = files.map((value) => { return value.filename })
            console.log(productData);
            productHelper.updateProduct(productId, productData, images, vendorId)
            res.redirect('/vendor/viewProduct')
        } catch (error) {
            next(error)
        }
    },
    getViewCategory: (req, res, nex) => {

        try {
            vendor = req.session.vendor
            categoryHelper.getViewCategory().then((categoryData) => {
                res.render('vendor/view-category', { layout: 'admin-vendor-layout', vendorHeader: true, categoryData, vendor })

            })
        } catch (error) {
            next(error)
        }
    },
    getAddCategory: (req, res, nex) => {

        try {
            vendor = req.session.vendor
            res.render('vendor/add-category', { layout: 'admin-vendor-layout', vendorHeader: true, vendor })
        } catch (error) {
            next(error)
        }
    },
    postAddCategory: (req, res, nex) => {

        try {
            categoryHelper.addCategory(req.body)
            res.redirect('/vendor/addCategory')
        }   
        catch(error){
            next(error)
        }    
    },
    getEditCategory: (req, res, nex) => {

        try {
            let categoryId = req.query.id
            vendor = req.session.vendor
            categoryHelper.getOneCategory(categoryId).then((categoryData) => {
                res.render('vendor/edit-category', { layout: 'admin-vendor-layout', vendorHeader: true, categoryData, vendor })
            })
        } catch (error) {
            next(error)
        }
    },
    getDeleteCategory: (req, res, nex) => {

        try {
            let categoryId = req.query.id
            categoryHelper.deleteCategory(categoryId)
            res.redirect('/vendor/viewCategory')
        }   
        catch(error){
            next(error)
        }   
    },
    postEditCategory: (req, res, nex) => {

        try {
            let categoryId = req.query.id
            let categoryData = req.body
            categoryHelper.updateCategory(categoryId, categoryData)
            res.redirect('/vendor/viewCategory')
        } catch (error) {
            next(error)
        }
    },
    getOrders: async (req, res, nex) => {

        try {
            vendor = req.session.vendor
            let orders = await orderHelper.getOrders(vendor._id)
            console.log(orders);
            res.render('vendor/view-orders', { layout: 'admin-vendor-layout', vendorHeader: true, vendor, orders })
        } catch (error) {
            next(error)
        }
    },
    getChangeOrderStatus: (req, res, nex) => {

        try {
            console.log(req.body)
        } catch (error) {
            next(error)
        }

    },
    getProfile: (req, res, nex) => {

        try {
            res.render('vendor/profile', { layout: 'admin-vendor-layout', vendorHeader: true, vendor })
        } catch (error) {
            next(error)
        }
    },
    updateOrderStatus: (req, res, nex) => {

        try {
            let orderId = req.body.orderId
            let productId = req.body.productId
            let status = req.body.status
            console.log(req.body);
            orderHelper.changeOrderdProductStatus(orderId, productId, status).then((response) => {
                res.json({ status: true })
            })
        } catch (error) {
            next(error)
        }
    }

}