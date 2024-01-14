var express = require('express');
var router = express.Router();
var uploadProducts = require('../uploader/uploadProducts')

const products = [
  {
    key:1,
    title: "Vivo X100 Pro",
    description: "The phone allows for a day and half of usage on a single charge.",
    imageUrl: "https://i.gadgets360cdn.com/products/large/vivo-x100-pro-db-709x800-1699936880.jpg",
    category: "SmartPhone"
  },
  {
    key: 2,
    title: "OnePlus Open",
    description: "The OnePlus Open is the brand’s first ever foldable smartphone.",
    imageUrl: "https://i.gadgets360cdn.com/products/large/oneplus-open-db-746x800-1697732897.jpg",
    category: "SmartPhone"
  },
  {
    key: 3,
    title: "Google Pixel 8 Pro",
    description: "The Google Pixel 8 Pro has a brand-new design which appears flatter",
    imageUrl: "https://i.gadgets360cdn.com/products/large/Pixel-8-Pro-Bay-2-374x800-1696485846.jpg",
    category: "SmartPhone"
  },
  {
    key: 4,
    title: "Apple iPhone 15 Pro Max",
    description: "Apple’s iPhone 15 Pro Max appears similar to its predecessor.",
    imageUrl: "https://i.gadgets360cdn.com/products/large/iphone-15-pro-600x800-1694549264.jpg",
    category: "SmartPhone"
  }
]

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('admin/view-products', { admin: true, products });
});

router.get('/add-product', function(req,res) {
  res.render('admin/add-product', { admin: true })
})

router.post('/add-product', (req, res) => {

  uploadProducts.addProduct(req.body, (id) => {
    let image = req.files.image
  
    image.mv('./public/product-images/' + id + ".jpg", (err) => {
      if(!err) {
        res.render('admin/add-product')
      } else {
        console.log(err);
      }
    })
  })

})


module.exports = router;
