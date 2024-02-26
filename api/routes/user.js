const express = require("express");
const router = express.Router();
const productFuncs = require("../uploader/productFuncs");
const formFuncs = require("../uploader/formFuncs");

/* GET home page. */

const verifyUserLogin = (req, res, next) => {
  if (req.session.userLoggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};

router.get("/", async function (req, res) {
  let user = req.session.user;
  let cartCounts = null;
  if (user) {
    cartCounts = await productFuncs.getCartCounts(req.session.user._id);
  }

  productFuncs.getAllProduct().then((products) => {
    res.render("user/view-products", { products, user, cartCounts });
  });
});

router.get("/signup", (req, res) => {
  res.render("user/signup");
});

router.get("/login", (req, res) => {
  if (req.session.userLoggedIn) {
    res.redirect("/");
  } else {
    const userLoginErr = req.session.userLoginErr;
    res.render("user/login", { userLoginErr });
    req.session.userLoginErr = null;
  }
});

router.post("/signup", (req, res) => {
  formFuncs.doUserSignup(req.body).then((response) => {
    res.redirect("/login");
  });
});

router.post("/login", (req, res) => {
  formFuncs.doUserLogin(req.body).then((response) => {
    if (response.status) {
      req.session.userLoggedIn = true;
      req.session.user = response.user;
      res.redirect("/");
    } else {
      req.session.userLoginErr = "Invalid username or password";
      res.redirect("/login");
    }
  });
});

router.get("/logout", (req, res) => {
  req.session.user = null;
  req.session.userLoggedIn = false;
  res.redirect("/");
});

router.get("/cart", verifyUserLogin, async (req, res) => {
  let cartItems = await productFuncs.getCartProducts(req.session.user._id);
  let total = await productFuncs.getTotalAmount(req.session.user._id);
  res.render("user/cart", { user: req.session.user, cartItems, total });
});

router.get("/add-to-cart/", (req, res) => {
  productFuncs.addToCart(req.query.id, req.session.user._id).then(() => {
    res.json({ status: true });
  });
});

router.post("/handle-product-quantity", (req, res) => {
  productFuncs.changeProductQuantity(req.body).then(async (response) => {
    response.total = await productFuncs.getTotalAmount(req.body.userId);
    res.json(response);
  });
});

router.post("/handle-cart-product", (req, res) => {
  productFuncs.removeCartProduct(req.body).then(() => {
    res.json({ status: true });
  });
});

router.get("/place-order", verifyUserLogin, async (req, res) => {
  let amount = await productFuncs.getTotalAmount(req.session.user._id);
  res.render("user/place-order", { amount, user: req.session.user });
});

router.post("/place-order", async (req, res) => {
  const products = await productFuncs.getCartProductsList(req.session.user._id);
  const total = await productFuncs.getTotalAmount(req.session.user._id);
  const cartProducts = await productFuncs.getCartProducts(req.session.user._id);
  const user = req.session.user;

  productFuncs.placeOrder(req.body, products, total).then(async (response) => {
    if (req.body["payment-method"] === "COD") {
      res.json({ status: true, id: response });
    } else {
      productFuncs
        .stripeGenerator(total, user, cartProducts)
        .then((response) => {
          res.json({ id: response.id, url: response.url });
        });
    }
  });
});

router.get("/order-info/", (req, res) => {
  productFuncs.getOrderedDetails(req.query.id).then((response) => {
    res.render("user/order-info", { order: response, user: req.session.user });
  });
});

router.get("/view-orders", (req, res) => {
  productFuncs.getUserAllOrders(req.session.user._id).then((response) => {
    res.render("user/view-orders", {
      orders: response,
      user: req.session.user,
    });
  });
});

router.get("/view-selected-order/", (req, res) => {
  productFuncs.getSelectedOrder(req.query.id).then((response) => {
    res.render("user/view-selected-order", {
      products: response,
      user: req.session.user,
    });
  });
});

module.exports = router;


