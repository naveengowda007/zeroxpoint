import React, { useEffect } from "react";

const PaymentPage = () => {
  // Load the Razorpay checkout script
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Handle payment by creating an order and opening the Razorpay checkout
  const handlePayment = async () => {
    // Create an order on the server
    const res = await fetch("http://localhost:3000/order/processpayment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: 2, // Replace with the actual amount
        currency: "INR",
      }),
    });

    const data = await res.json();
    console.log(data);
    const options = {
      key: "rzp_live_KvFAjSn43zwpvG", // Enter the Key ID generated from the Dashboard
      amount: data.amount,
      currency: "INR",
      name: "ZEROX POINT", //your business name
      description: "Transaction",
      image: "https://example.com/your_logo",
      order_id: data.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
      handler: function (response) {
        alert(response.razorpay_payment_id);
        alert(response.razorpay_order_id);
        alert(response.razorpay_signature);
      },
      prefill: {
        //We recommend using the prefill parameter to auto-fill customer's contact information, especially their phone number
        name: "Gaurav Kumar", //your customer's name
        email: "gaurav.kumar@example.com",
        contact: "9000090000", //Provide the customer's phone number for better conversion rates
      },
      notes: {
        address: "Razorpay Corporate Office",
      },
      theme: {
        color: "#3399cc",
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  useEffect(() => {
    loadRazorpay();
  }, []);

  return (
    <div>
      <h1>Make a Payment</h1>
      <button onClick={handlePayment}>Pay Now</button>
    </div>
  );
};

export default PaymentPage;
