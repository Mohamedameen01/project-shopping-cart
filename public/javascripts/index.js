function addToCart(proId) {
  console.log(proId);
  $.ajax({
    url: "/add-to-cart?id=" + proId,
    method: "get",
    success(response) {
      if (response.status) {
        let count = $("#cart-counts").html();
        count = parseInt(count) + 1;
        $("#cart-counts").html(count);
      }
    },
  });
}

function handleClick(cartId, prodId, userId, count) {
  let quantity = parseInt(document.getElementById(prodId).innerHTML);
  count = parseInt(count);
  $.ajax({
    url: "/handle-product-quantity",
    data: { cartId, prodId, userId, count, quantity },
    method: "post",
    success(response) {
      if (response.removeProduct == true) {
        location.reload();
      } else {
        document.getElementById(prodId).innerHTML = quantity + count;
        document.getElementById("total").innerHTML = response.total;
      }
    },
  });
}

function handleRemove(cartId, prodId) {
  console.log(cartId, prodId);
  $.ajax({
    url: "/handle-cart-product",
    data: {
      cart: cartId,
      product: prodId,
    },
    method: "post",
    success(response) {
      if (response.status) {
        location.reload();
      }
    },
  });
}

$("#form-checkout").submit((e) => {
  e.preventDefault();
  $.ajax({
    url: "/place-order",
    method: "post",
    data: $("#form-checkout").serialize(),
    success(response) {
      if (response.status) {
        alert("Order Placed Successfully.");
        location.href = "/order-info?id=" + response.id;
      } else {
        alert("Payment");
        location.href= response.url
      }
    },
  });
});

$(function () {
  $("#myTable").DataTable();
});

function updateOrderStatus(orderId) {
  $.ajax({
    url: "/update-order-status",
    data: { orderId },
    method: "post",
    success(response) {
      alert(response);
    },
  });
}
