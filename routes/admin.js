var express = require('express');
var router = express.Router();
const productFuncs = require('../uploader/productFuncs')

/* GET users listing. */
router.get('/', function (req, res, next) {
  productFuncs.getAllProduct().then(products => {
    res.render('admin/view-products', { admin: true, products });
  })
});

router.get('/add-product', function (req, res) {
  res.render('admin/add-product', { admin: true })
})

router.post('/add-product', (req, res) => {

  productFuncs.addProduct(req.body, (id) => {
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

router.get('/delete-product/', (req, res) => {
  const proId = req.query.id;
  productFuncs.deleteProduct(proId).then(response => {
    res.redirect('/admin')
  })
})

router.get('/edit-product/', (req, res) => {
  const proId = req.query.id;
  productFuncs.getProductDetails(proId).then(product => {
    res.render('admin/edit-product', {product})
  })
})

router.post('/edit-product/', (req, res) => {
  const proId = req.query.id;
  productFuncs.updateProduct(proId, req.body).then(()=>{
    res.redirect('/')
    if(req.files.image) {
      let image = req.files.image;
      image.mv('./public/product-images/'+ proId + '.jpg')
    }
  })
})

module.exports = router;
