import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(request: Request) {
  try {
    // Parse request body (if amount/currency are passed; otherwise, use defaults)
    const { amount, currency } = await request.json();
    const registrationFee =
      amount === undefined || amount === null ? 50000 : amount; // e.g. 50000 paise = INR 500.00
    const paymentCurrency = currency || "INR";

    // Initialize Razorpay instance using server-side credentials
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const options = {
      amount: registrationFee,
      currency: paymentCurrency,
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    };

    // Create order
    const order = await razorpay.orders.create(options);
    return NextResponse.json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 },
    );
  }
}
