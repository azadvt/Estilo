
//  function validateLogin() {
//     var email = document.login.email.value
//     var password = document.login.password.value

   
//     if (email == "") {
//         document.getElementById('requiredEmail').innerHTML = "Enter your Email";
//         return false

//     }
//     if( password == ""){
//             document.getElementById('requiredPassword').innerHTML = "Enter your Password";
//             return false

//         }
        
//             return true


    
// } 


//     function validateUserSignUp() {
//         var firstName = document.signup.firstName.value
//         var lastName = document.signup.lastName.value
//         var email = document.signup.email.value
//         var phone = document.signup.phone.value
//         var password = document.signup.password.value
//         var confirm_password = document.signup.confirm_password.value

     

//         if (firstName == "" || lastName == "" || email == "" || phone == "" || password == "" || password2 == "") {
//             document.getElementById('firstNameerr').innerHTML = "Enter your First Name";
//             document.getElementById('lastNameerr').innerHTML = " Enter your Last Name";
//             document.getElementById('emailerr').innerHTML = " Enter your Email";
//             document.getElementById('phoneerr').innerHTML = " Enter your Phone Number";
//             document.getElementById('passworderr').innerHTML = " Enter your Password";
//             document.getElementById('confirmPassworderr').innerHTML = " Enter your confirm Password";
//             return false

//         }
//             console.log("password=",password,"confirmpassword=",confirm_password);
//          if (password != confirm_password) {
//             document.getElementById('passworderr').innerHTML = " Password not Match";
//             document.getElementById('confirmPassworderr').innerHTML = " Password not Match";
//             return false
//         }

//     }



    
    
    
    
//     function validateVendorSignUp() {
//         var name = document.vendorSignup.name.value
//         var businessName = document.vendorSignup.businessName.value
//         var phone = document.vendorSignup.phone.value
//         var email = document.vendorSignup.email.value
//         var password = document.vendorSignup.password.value

//         if (name == "" || businessName == "" || email == "" || phone == "" || password == "") {

//             document.getElementById('requiredName').innerHTML = "Enter your Name";
//             document.getElementById('requiredBusinessName').innerHTML = " Enter your Business Name";
//             document.getElementById('requiredPhone').innerHTML = " Enter your Phone Number";
//             document.getElementById('requiredEmail').innerHTML = " Enter your Email";
//             document.getElementById('requiredPassword').innerHTML = " Enter your Password";
//             return false

//         }

//     }

    
        

//         // if (productName == "" || brand == "" || price == "" || category == "" || image =="") {

//         //     document.getElementById('requiredProductName').innerHTML = "Enter your Product Name";
//         //     document.getElementById('requiredBrand').innerHTML = " Enter your Brand Name";
//         //     document.getElementById('requiredPrice').innerHTML = " Enter your Price";
//         //     document.getElementById('requiredCategory').innerHTML = " Enter your Category";
//         //     //  document.getElementById('requiredImage').innerHTML = " Upload atleast one Image";

//         //     return false


        

//         // }

    

//$(document).ready(function () {

    $('#table_id').DataTable();

    $("#userSignup").validate({
        errorClass: "error",
        rules: {
            firstName: {
                required: true,
                minlength: 3,
     lettersonly: true

            },
            lastName: {
                required: true,
                minlength: 3,
      lettersonly: true
            },

            email: {
                required: true,
                email: true,

            },

            phone: {
                required: true,
                minlength: 10
            },

            password: {
                required: true,
                minlength: 5
            },
            c_password: {
                required: true,
                equalTo: '#password'
            }
        },
        messages: {
            c_password: {
                equalTo: "Passwords are not match"
            }
        }
    })
//})
jQuery.validator.addMethod("lettersonly", function (value, element) {
    return this.optional(element) || /^[a-z]+$/i.test(value);
}, "Letters only please");

