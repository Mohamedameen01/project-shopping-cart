var express = require('express');
var router = express.Router();
var uploadProducts = require('../uploader/uploadProducts')

/* GET users listing. */
router.get('/', function (req, res, next) {
  uploadProducts.getAllProduct().then(products => {
    res.render('admin/view-products', { admin: true, products });
  })
});

router.get('/add-product', function (req, res) {
  res.render('admin/add-product', { admin: true })
})

router.post('/add-product', (req, res) => {

  uploadProducts.addProduct(req.body, (id) => {
    let image = req.files.image
    image.mv('./public/product-images/' + id + ".jpg", (err) => {
      if (!err) {
        res.render('admin/add-product', {admin: true})
      } else {
        console.log(err);
      }
    })
  })
})


module.exports = router;
