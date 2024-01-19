function addToCart(proId) {
    $.ajax({
        url: '/add-to-cart?id=' + proId,
        method: 'get',
        success(response) {
            if (response.status) {
                let count = $('#cart-counts').html()
                count = parseInt(count) + 1
                $('#cart-counts').html(count)
            }
        }
    })

}

function handleClick(cartId, prodId, count) {
    $.ajax({
        url: '/handle-product-quantity',
        data: { cartId, prodId, count},
        method: 'post',
        success(response) {
            if (response.status) {
                location.reload()
            }
        }
    })
}
