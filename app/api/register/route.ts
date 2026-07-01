import crypto from "crypto";
import { NextResponse } from "next/server";
import createSupabaseServerClient from "../../../lib/supabaseServer";
import initFirebaseAdmin from "../../../lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { idToken, values, payment } = body;

    if (!idToken) {
      return NextResponse.json({ error: "idToken required" }, { status: 400 });
    }

    if (!payment?.razorpay_order_id || !payment?.razorpay_payment_id || !payment?.razorpay_signature) {
      return NextResponse.json({ error: "Payment verification required" }, { status: 400 });
    }

    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!razorpaySecret) {
      return NextResponse.json({ error: "Missing server Razorpay key secret" }, { status: 500 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", razorpaySecret)
      .update(`${payment.razorpay_order_id}|${payment.razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== payment.razorpay_signature) {
      return NextResponse.json({ error: "Payment signature verification failed" }, { status: 401 });
    }

    const admin = initFirebaseAdmin();
    const decoded = await admin.auth().verifyIdToken(idToken);
    if (!decoded || !decoded.uid) {
      return NextResponse.json({ error: "Invalid Firebase ID token" }, { status: 401 });
    }

    const userId = decoded.uid;
    const mobileNumber = decoded.phone_number || values?.mobileNumber;

    const profile = {
      id: userId,
      mobileNumber,
      ...values,
      created_at: new Date().toISOString(),
    };

    const supabase = createSupabaseServerClient();
    const { error: insertError } = await supabase.from("profiles").insert(profile);
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ profile }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
