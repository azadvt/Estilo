 function validate() {
        var email = document.login.email.value
        var password = document.login.password.value

        if (email == "" || password == "") {
            document.getElementById('emailerr').innerHTML = "Enter your Email";
            document.getElementById('passworderr').innerHTML = "Enter your Password";

            return false
        } else if (password.length < 6) {
            document.getElementById('passworderr').innerHTML = " ** password length minimum 6 ";
            return false

        }
    } 


    function validateSignUp() {
        var firstName = document.signup.firstName.value
        var lastName = document.signup.lastName.value
        var email = document.signup.email.value
        var phone = document.signup.phone.value
        var password = document.signup.password.value
        var confirm_password = document.signup.confirm_password.value

     

        if (firstName == "" || lastName == "" || email == "" || phone == "" || password == "" || password2 == "") {
            document.getElementById('firstNameerr').innerHTML = "Enter your First Name";
            document.getElementById('lastNameerr').innerHTML = " Enter your Last Name";
            document.getElementById('emailerr').innerHTML = " Enter your Email";
            document.getElementById('phoneerr').innerHTML = " Enter your Phone Number";
            document.getElementById('passworderr').innerHTML = " Enter your Password";
            document.getElementById('confirmPassworderr').innerHTML = " Enter your confirm Password";
            return false

        }

       else if (password != confirm_password) {
            document.getElementById('passworderr').innerHTML = " Password not Match";
            document.getElementById('confirmPassworderr').innerHTML = " Password not Match";
            return false
        }

    }