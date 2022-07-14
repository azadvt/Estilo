const client = require('twilio')('AC4d4fd6cac826d0c73c130f3c8bbb8e90', 'c0bb4d3ae742e73b7026044d41864d3f');
const serviceSid = 'VAb7deb9cc0ed69121035032300b21b18f'

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
                console.log(res);

            })
        })
    },
    otpVerify: (otpData, userData) => {
        console.log(otpData, userData);
        let resp = {}
        return new Promise(async (resolve, reject) => {
            client.verify.services(serviceSid).verificationChecks.create({
                to: `+91${userData.phone}`,
                code: otpData
            }).then((resp) => {
                console.log("verification success");
                console.log(resp);
                resolve(resp)
            })
        })
    }

}