var request = require("request");

async function sendFast2OTP(resolve, reject, number, token) {
  var options = {
    method: "POST",
    url: `https://cpaas.messagecentral.com/verification/v3/send?countryCode=91&customerId=C-794E4CB7DE7C443&flowType=SMS&mobileNumber=${number}`,
    headers: {
      authToken: token,
    },
  };

  request(options, function (error, response) {
    if (error) {
      reject(error);
      return;
    }
    const res = JSON.parse(response.body);
    // console.log(res);
    resolve(res?.data?.verificationId);
  });
}

async function VerifyFast2OTP(resolve, reject, number, vid, code, token) {
  var options = {
    method: "GET",
    url: `https://cpaas.messagecentral.com/verification/v3/validateOtp?verificationId=${vid}&code=${code}`,
    headers: {
      authToken: token,
    },
  };
  request(options, function (error, response) {
    if (error) {
      reject(error);
      return;
    }
    const res = JSON.parse(response.body);
    // console.log(res);
    if (res?.data?.verificationStatus === "VERIFICATION_COMPLETED") {
      resolve(true);
    } else resolve(false);
  });
}

module.exports = {
  sendFast2OTP,
  VerifyFast2OTP,
};
