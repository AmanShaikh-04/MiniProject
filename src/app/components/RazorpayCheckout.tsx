"use client";

import React, { useEffect } from "react";

interface RazorpayCheckoutProps {
  amount: number; // amount in smallest currency unit
  currency?: string;
  description?: string;
  onPaymentSuccess: (paymentResponse: any) => void;
  onPaymentError?: (error: any) => void;
}

const RazorpayCheckout: React.FC<RazorpayCheckoutProps> = ({
  amount,
  currency = "INR",
  description = "Registration Fee Payment",
  onPaymentSuccess,
  onPaymentError,
}) => {
  // Dynamically load the Razorpay checkout script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    try {
      // Call the API to create an order
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount, currency }),
      });
      if (!res.ok) {
        throw new Error("Failed to create order");
      }
      const orderData = await res.json();

      // Configure Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Public key (client-side)
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Your Organization Name",
        description: description,
        order_id: orderData.id,
        handler: async function (response: any) {
          // Optionally verify payment on server side
          const verifyRes = await fetch("/api/razorpay/verify-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(response),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            onPaymentSuccess(response);
          } else {
            onPaymentError && onPaymentError(verifyData.error);
          }
        },
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        theme: {
          color: "#0d6efd",
        },
        // Payment method restrictions - only allowing UPI, wallet, card, and net banking
        method: {
          // Explicitly enable only the required payment methods
          netbanking: true,
          card: true,
          upi: true,
          wallet: true,

          // Explicitly disable all other payment methods
          emi: false,
          paylater: false,
          cod: false,
          bank_transfer: false,
          app: false,
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      onPaymentError && onPaymentError(error);
    }
  };

  return (
    <button
      onClick={handlePayment}
      className="bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition-colors"
    >
      Pay Registration Fee
    </button>
  );
};

export default RazorpayCheckout;
