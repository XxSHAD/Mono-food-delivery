//Email


//Notification


//OTP
export const GenerateOTP = () => {

    const otp = Math.floor(100000 + Math.random() * 900000)
    let expiry = new Date()
    expiry.setTime( new Date().getTime() + (30 * 60 * 1000))

    return {otp, expiry}

}


// export const onRequestOTP = async (otp: number, toPhoneNumber: string) => {
    
//     const accountSid = "ACac0fdeb612ea29c0352d15d78641108d";
//     const authToken = "2033262701eae15b4c479d071a85c24f";
//     const client = require("twilio")(accountSid, authToken);

//     const response = await client.messages.create({
//         body: `Your OTP is ${otp}`,
//         from: '+17752547626',
//         to: `+91${toPhoneNumber}`,
//     })

//     return response;

// }


export const onRequestOTP = async (otp: number, toPhoneNumber: string) => {
    const axios = require('axios');

    const options = {
        method: 'GET',
        url: 'https://phonenumbervalidatefree.p.rapidapi.com/ts_PhoneNumberValidateTest.jsp',
        params: {
            number: `+91${toPhoneNumber}`, // Using the provided phone number
            country: 'IND', // Using the provided country code
            verifyCode: otp
        },
        headers: {
            'X-RapidAPI-Key': 'ada3e8d24bmsh710c92a193b5fb9p18f5a0jsnf47eb6366cb1',
            'X-RapidAPI-Host': 'phonenumbervalidatefree.p.rapidapi.com'
        }
    };

    try {
        const response = await axios.request(options);
        console.log(response.data);
        return response.data; // Returning the response data
    } catch (error) {
        console.error(error);
        throw error; // Rethrowing the error to be handled by the caller
    }
}


//Payment Notification or emails