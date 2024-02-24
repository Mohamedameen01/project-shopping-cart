var express = require("express");
var router = express.Router();
const productFuncs = require("../uploader/productFuncs");
const formFuncs = require("../uploader/formFuncs");
const fs = require("fs-extra");

/* GET users listing. */
function verifyAdminLogin(req, res, next) {
  if (req.session.adminLoggedIn) {
    next();
  } else {
    res.redirect("/admin/login");
  }
}

router.get("/", verifyAdminLogin, function (req, res, next) {
  productFuncs.getAllProduct().then((products) => {
    res.render("admin/view-products", { admin: true, products });
  });
});

router.get("/add-product", verifyAdminLogin, function (req, res) {
  res.render("admin/add-product", { admin: true });
});

router.post("/add-product", verifyAdminLogin, (req, res) => {
  productFuncs.addProduct(req.body, (id) => {
    let image = req.files.image;
    image.mv("./public/product-images/" + id + ".jpg", (err) => {
      if (!err) {
        res.render("admin/add-product", { admin: true });
      } else {
        console.log(err);
      }
    });
  });
});

router.get("/delete-product/", verifyAdminLogin, (req, res) => {
  const proId = req.query.id;
  productFuncs.deleteProduct(proId).then((response) => {
    fs.remove('./public/product-images/' + proId + '.jpg', (err) =>{
      if (!err) {
        res.redirect("/admin");
      } else {
        console.log(err);
      }
    });
  });
});

router.get("/edit-product/", verifyAdminLogin, (req, res) => {
  const proId = req.query.id;
  productFuncs.getProductDetails(proId).then((product) => {
    res.render("admin/edit-product", { product, admin: true });
  });
});

router.post("/edit-product/", verifyAdminLogin, (req, res) => {
  const proId = req.query.id;
  productFuncs.updateProduct(proId, req.body).then(() => {
    res.redirect("/admin");
    if (req.files) {
      let image = req.files.image;
      image.mv("./public/product-images/" + proId + ".jpg");
    }
  });
});

router.get("/login", (req, res) => {
  if (req.session.adminLoggedIn) {
    res.redirect("/admin");
  } else {
    const adminLoginErr = req.session.adminLoginErr;
    res.render("admin/login", { adminLoginErr, admin: true });
    req.session.adminLoginErr = null;
  }
});

router.post("/login", (req, res) => {
  formFuncs.doAdminLogin(req.body).then((response) => {
    if (response.status) {
      req.session.adminLoggedIn = true;
      req.session.admin = response.admin;
      res.redirect("/admin");
    } else {
      req.session.adminLoginErr = "Invalid username or password";
      res.redirect("/admin/login");
    }
  });
});

router.get("/all-products", verifyAdminLogin, (req, res) => {
  productFuncs.getAllProduct().then((response) => {
    res.render("admin/all-products", { products: response, admin: true });
  });
});

router.get("/all-users", verifyAdminLogin, (req, res) => {
  productFuncs.getAllUsers().then((response) => {
    res.render("admin/all-users", { users: response, admin: true });
  });
});

router.get("/all-orders", verifyAdminLogin, (req, res) => {
  productFuncs.getAllOrders().then((response) => {
    res.render("admin/all-orders", { orders: response, admin: true });
  });
});

router.post("/update-order-status", verifyAdminLogin, (req, res) => {
  console.log("clicks");
});

module.exports = router;
