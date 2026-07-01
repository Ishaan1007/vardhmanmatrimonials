import { NextResponse } from "next/server";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

console.log("=== Payment Route Debug ===");
console.log("RAZORPAY_KEY_ID:", RAZORPAY_KEY_ID ? "SET" : "NOT SET");
console.log("RAZORPAY_KEY_SECRET:", RAZORPAY_KEY_SECRET ? "SET" : "NOT SET");

export async function POST(req: Request) {
  try {
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: "Missing Razorpay environment variables" }, { status: 500 });
    }

    const body = await req.json();
    const amount = Number(body.amount) || 25000;
    const currency = body.currency || "INR";

    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64");
    const orderPayload = {
      amount,
      currency,
      receipt: `order_${Date.now()}`,
      payment_capture: 1,
    };

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderPayload),
    });

    const json = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: json.error?.description || "Unable to create Razorpay order" }, { status: response.status });
    }

    return NextResponse.json({ order: json, keyId: RAZORPAY_KEY_ID }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
