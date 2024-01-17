var express = require('express');
var router = express.Router();

const productFuncs = require('../uploader/productFuncs');
const formFuncs = require('../uploader/formFuncs')
/* GET home page. */

const verifyLogin = (req, res, next) => {
  if(req.session.loggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}

router.get('/', function(req, res, next) {
  let user = req.session.user;
  productFuncs.getAllProduct().then( products => {
    res.render('user/view-products', { products, user });
  })
});

router.get('/signup', (req, res) => { 
  res.render('user/signup')
})

router.get('/login', (req, res) => {
  if(req.session.loggedIn) {
    res.redirect('/')
  } else {
    const loginErr = req.session.loginErr;
    res.render('user/login', {loginErr})
    req.session.loginErr = null
  }
})

router.post('/signup', (req, res) => {
  formFuncs.doSignup(req.body).then( response => {
    res.redirect('/login')
  })
})

router.post('/login', (req, res) => {
  formFuncs.doLogin(req.body).then( response => {
    if (response.status) {
      req.session.loggedIn = true;
      req.session.user = response.user;
      res.redirect('/');
    } else {
      req.session.loginErr = "Invalid username or password";
      res.redirect('/login');
      }
  })
})

router.get('/logout', (req,res) => {
  req.session.destroy()
  res.redirect('/')
})

router.get('/cart', verifyLogin, (req, res) => {
  productFuncs.getCartProducts(req.session.user._id).then(response => {
    console.log(response)
    res.render('user/cart')   
  })
})

router.get('/add-to-cart/',verifyLogin, (req, res) => {
  productFuncs.addToCart(req.query.id, req.session.user._id).then(() => {
    res.redirect('/')
  })
})

module.exports = router;
