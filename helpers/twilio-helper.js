const twilioKeys = require('../config/twilioKeys')
const serviceSid=twilioKeys.SERVICE_SID
const authToken=twilioKeys.TWILIO_AUTH_TOKEN
const accountSid=twilioKeys.TWILIO_ACCOUNT_SID
const client = require('twilio')(accountSid, authToken);

module.exports = {
    dosms: (userData) => {
        let res = {}
        return new Promise(async (resolve, reject) => {
            client.verify.services(serviceSid).verifications.create({
                to: `+91${userData.phone}`,
                channel: "sms"
            }).then((res) => {
                res.valid = true;
                resolve(res)

            })
        })
    },
    otpVerify: (otpData, userphone) => {
        console.log(otpData, userphone);
        let resp = {}
        return new Promise(async (resolve, reject) => {
            client.verify.services(serviceSid).verificationChecks.create({
                to: `+91${userphone}`,
                code: otpData.otp
            }).then((resp) => {
                console.log("verification success");
                console.log(resp);
                resolve(resp)
            })
        })
    }

}