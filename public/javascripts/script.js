//add to cart
function addToCart(productId){
    $.ajax({
        url:'/addToCart/'+productId,
        method:'get',
        success:(response)=>{
            if(response.status){
                let count=$('#cart-Count').html()
                console.log(count)
                count =parseInt(count)+1
                $("#cart-Count").html(count)
                $("#cartCount").html(count)
    swal("Added to Cart", "Please Check your Cart", "success");
            }
            else{
                swal("Please login")
            }
        },
        error:(response)=>{
            alert('err')
        }
    })
}


//add to cart from wishlist

function addToCartWishlist(productId){
    $.ajax({
        url:'/addToCart/'+productId,
        method:'get',
        success:(response)=>{
            if(response.status){
                let count=$('#cart-Count').html()
                console.log(count)
                count =parseInt(count)+1
                $("#cart-Count").html(count)
                $("#cartCount").html(count)
    swal("Added to Cart", "Please Check your Cart", "success");
    setTimeout(function(){
        window.location.reload(1);
     }, 1000);
    
            }
        },
        error:(response)=>{
            alert('err')
        }
    })
}

//add to wish list

function addToWishlist(productId){
    $.ajax({
        url:'/addToWishlist/'+productId,
        method:'get',
        success:(response)=>{   
            console.log(response)
            if(response.added){
                let count=$('#wishlist-Count').html()
                console.log(count)
                count =parseInt(count)+1
                $("#wishlist-Count").html(count)
                $("#wishlistCount").html(count)
                swal("Added to Wishlist", "Please Check your wishlist", "success")
                
            }
           else if(response.removed){
            let count=$('#wishlist-Count').html()
                console.log(count)
                count =parseInt(count)-1
                $("#wishlist-Count").html(count)
                $("#wishlistCount").html(count)
                swal("Removed form Wishlist", "Please Check your wishlist", "warning")
            }
            else{
            swal("Please login")                }
        },
        error:(response)=>{
            alert('err')
        }
    })
}





//change product quantity

function changeQty(cartId, productId,userId,count) {
    let quantity = parseInt(document.getElementById(productId).innerHTML)
    $.ajax({
        url: '/changeProductQuantity',
        data: {
            count: count,
            productId: productId,
            cartId: cartId,
            quantity: quantity,
            userId:userId
        },
        method: 'post',
        success: (response) => {
            console.log(response)
            if (response.productRemoved) {
                alert('product removed')
                location.reload()
            } else {
                
                document.getElementById(productId).innerHTML = quantity + count
                document.getElementById('total').innerHTML="₹"+response.total
                document.getElementById('sub-total').innerHTML="₹"+response.total
            }
        }   

    })
}


// remove product from cart

function remove(cartId, productId) {
    console.log(productId)
    console.log(cartId)
    $.ajax({
        url: '/removeProductFromCart',
        data: {
            cartId: cartId,
            productId: productId
        },
        method: 'post',
        success: (response) => {

            if (response.productRemoved) {

                alert('product removed')
                location.reload()
            }
            else {
                alert('false')
            }
        },
        error: (response) => {
            alert('err')
        }
    })
}

//remove product from wishlist

function removeFromWishlist(wishlistId, productId) {
    console.log(productId)
    console.log(wishlistId)
    $.ajax({
        url: '/removeProductFromWishlist',
        data: {
            wishlistId: wishlistId,
            productId: productId
        },
        method: 'post',
        success: (response) => {

            if (response.productRemoved) {

                alert('product removed')
                location.reload()
            }
            else {
                alert('false')
            }
        },
        error: (response) => {
            alert('err')
        }
    })
}



$('#formCouponCode').submit((e)=>{
    e.preventDefault()
    $.ajax({
        url:'/couponCode',
        method:'post',
        data:$('#formCouponCode').serialize(),
        success:(response)=>{
            alert(response)
            if(response.status){
                location.href='/orderSuccess'
            }
        }
    })
})
