var express = require('express');
var router = express.Router();

const uploadProducts = require('../uploader/uploadProducts');
const uploadForm = require('../uploader/uploadForm')
/* GET home page. */

router.get('/', function(req, res, next) {
  let user = req.session.user;
  console.log(user);
  uploadProducts.getAllProduct().then( products => {
    res.render('user/view-products', { products, user });
  })
});

router.get('/signup', (req, res) => { 
  res.render('user/signup')
})

router.get('/login', (req, res) => {
  res.render('user/login')
})

router.post('/signup', (req, res) => {
  uploadForm.doSignup(req.body)
})

router.post('/login', (req, res) => {
  uploadForm.doLogin(req.body).then( response => {
    if (response.status) {
      req.session.loggedIn = true;
      req.session.user = response.user;
      res.redirect('/');
    } else {
      res.redirect('/login');
      }
  })
})

router.get('/logout', (req,res) => {
  req.session.destroy()
  res.redirect('/')
})

module.exports = router;
