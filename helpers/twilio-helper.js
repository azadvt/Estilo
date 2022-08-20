require('dotenv').config()
const authToken=process.env.TWILIO_AUTH_TOKEN
const accountSid=process.env.TWILIO_ACCOUNT_SID
const client = require('twilio')(accountSid, authToken);
const serviceSid=process.env.SERVICE_SID
module.exports = {
    dosms: (userData) => {
        let res = {}
        console.log(userData);
        console.log(serviceSid);
        return new Promise(async (resolve, reject) => {
            try{
                client.verify.services(serviceSid).verifications.create({
                    to: `+91${userData.phone}`,
                    channel: "sms"
                }).then((res) => {
                    console.log('ttree');
                    res.valid = true;
                    resolve(res)
    
                })
            }
            catch(error){
                reject(error)
            }
            
        })
    },
    otpVerify: (otp, userphone) => {
        
        let resp = {}
        return new Promise(async (resolve, reject) => {
            try{
                client.verify.services(serviceSid).verificationChecks.create({
                   to: `+91${userphone}`,
                    code: otp
                }).then((resp) => {
                    console.log("verification success");
                    console.log(resp);
                    resolve(resp)
                })
            }
            catch(error){
                reject(error)
            }
           
        })
    }

}