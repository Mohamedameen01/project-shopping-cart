var express = require('express');
var router = express.Router();

/* GET home page. */
const products = [
  {
    title: "Vivo X100 Pro",
    description: "The phone allows for a day and half of usage on a single charge.",
    imageUrl: "https://i.gadgets360cdn.com/products/large/vivo-x100-pro-db-709x800-1699936880.jpg",
    category: "SmartPhone"
  },
  {
    title: "OnePlus Open",
    description: "The OnePlus Open is the brand’s first ever foldable smartphone.",
    imageUrl: "https://i.gadgets360cdn.com/products/large/oneplus-open-db-746x800-1697732897.jpg",
    category: "SmartPhone"
  },
  {
    title: "Google Pixel 8 Pro",
    description: "The Google Pixel 8 Pro has a brand-new design which appears flatter",
    imageUrl: "https://i.gadgets360cdn.com/products/large/Pixel-8-Pro-Bay-2-374x800-1696485846.jpg",
    category: "SmartPhone"
  },
  {
    title: "Apple iPhone 15 Pro Max",
    description: "Apple’s iPhone 15 Pro Max appears similar to its predecessor.",
    imageUrl: "https://i.gadgets360cdn.com/products/large/iphone-15-pro-600x800-1694549264.jpg",
    category: "SmartPhone"
  }
]

router.get('/', function(req, res, next) {
  res.render('index', { products, admin:false });
});

module.exports = router;
