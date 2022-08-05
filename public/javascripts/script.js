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
    let proPrice = parseInt(document.getElementById(productId+1).innerHTML)
    let qnt=quantity+count
    console.log(proPrice);
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
                document.getElementById(productId+2).innerHTML=proPrice*qnt

            }
        }   

    })
}


// remove product from cart

function remove(cartId, productId) {
    swal({
        title: "Are you sure?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      })
      .then((willDelete) => {
        if (willDelete) {
            $.ajax({
                url: '/removeProductFromCart',
                data: {
                    cartId: cartId,
                    productId: productId
                },
                method: 'post',
                success: (response) => {
                    console.log(response)
                    if (response.status) {
                        swal("Poof! Your imaginary file has been deleted!", {
                            icon: "success",
                          });
                          $("#refresh").load(location.href+" #refresh")
                    }
                    else {
                        alert('false')
                    }
                },
                error: (response) => {
                    alert('err')
                }
            })
         
        } else {
          swal("Your imaginary file is safe!");
        }
      });
   
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

//address///////////
function deleteAddress(id) {
    swal({
        title: "Are you sure?",
        icon: "warning",
        buttons: true,
        dangerMode: true,
    })
        .then((willDelete) => {
            
            if (willDelete) {
                $.ajax({
                url: '/deleteAddress/' + id,
                method: 'get',
                success: (response) => {
                    console.log(response)
                }
            })
                swal("Your Address has been deleted!", {
                    icon: "success",
                });
            }
        });

}
function editAddressForm(id) {
    $('#editAddressForm' + id).submit();
    $.ajax({
        url: '/editAddress',
        method: 'post',
        data: $('#editAddressForm' + id).serialize(),
        success: (response) => {
            console.log(response)
            if(response.staus){
            swal({
                title: "Address Edited Successfully!",
                text: "Please Select Your Address",
                icon: "success",
                button: "Ok",
            });
            $('#accordionExample').load(location.href+ " #accordionExample>*","");
            }
            else{
                alert("err")
            }
            
        }
    })
}

function submitAddressForm() {
    $('#addressForm').submit();
    console.log('ju')
    $.ajax({
        url: '/userAddress',
        method: 'post',
        data: $('#addressForm').serialize(),
        success: function (response) {
            swal({
                title: "Address Added Successfully!",
                text: "Please Select Your Address",
                icon: "success",
                button: "Ok",
            });
        }
    });

}



////////////////////////

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
