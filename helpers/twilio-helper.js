const keys = require('../config/keys')
const serviceSid=keys.SERVICE_SID
const authToken=keys.TWILIO_AUTH_TOKEN
const accountSid=keys.TWILIO_ACCOUNT_SID
const client = require('twilio')(accountSid, authToken);

module.exports = {
    dosms: (userData) => {
        let res = {}
        return new Promise(async (resolve, reject) => {
            try{
                client.verify.services(serviceSid).verifications.create({
                    to: `+91${userData.phone}`,
                    channel: "sms"
                }).then((res) => {
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