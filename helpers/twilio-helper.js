const client = require('twilio')('AC4d4fd6cac826d0c73c130f3c8bbb8e90','c0bb4d3ae742e73b7026044d41864d3f');
const serviceSid='VAb7deb9cc0ed69121035032300b21b18f'

             module.exports={
                dosms:(noData)=>{
                    let res={}
                    return new Promise(async(resolve,reject)=>{
                        client.verify.services(serviceSid).verifications.create({
                            to :`+91${noData.phone}`,
                            channel:"sms"
                        }).then((res)=>{
                            res.valid=true;
                            resolve(res)
                            console.log(res);
                        })
                    })
                },
                otpVerify:(otpData,nuData)=>{
                    let resp ={}
                    return new Promise(async(resolve,reject)=>{
                        client.verify.services(serviceSid).verificationChecks.create({
                            to:   `+91${nuData.phone}`,
                            code:otpData.otp
                        }).then((resp)=>{
                            console.log("verification failed");
                            console.log(resp);
                            resolve(resp)
                        })
                    })
                }

             }