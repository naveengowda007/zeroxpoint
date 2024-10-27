const axios = require("axios");

const dotenv = require("dotenv");
dotenv.config();

const whatsappId = process.env.WHATSAPP_ID;
const authToken = process.env.WHATAPP_TOKEN;

const messageTrigger = async (receipent, varlist) => {
  const num = receipent;
  const urltoReq = `https://graph.facebook.com/v18.0/${whatsappId}/messages`;
  const bodyKeys = Object.keys(varlist).filter((key) => key.startsWith("var"));

  // Construct the parameters array
  const parameters = bodyKeys.map((key) => ({
    type: "text",
    text: varlist[key],
  }));
  console.log(varlist);

  const data = {
    messaging_product: "whatsapp",
    to: num,
    recipient_type: "individual",
    type: "template",
    template: {
      name: `${varlist.templateName}`,
      language: {
        code: `${varlist.language}`,
      },
      components: [
        {
          type: "body",
          parameters: parameters,
        },
      ],
    },
  };

  const headers = {
    Authorization: `Bearer ${authToken}`,
    "Content-Type": "application/json",
  };

  try {
    const response = await axios.post(urltoReq, data, { headers });
    console.log("Response:", response.data);
    // res.json(response.data);
    console.log("Response:", response.data);
    // res.json(response.data);
  } catch (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
  }
};

module.exports = messageTrigger;
