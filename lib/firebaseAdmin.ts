import admin from "firebase-admin";

let initialized = false;

type FirebaseServiceAccount = Record<string, unknown>;

export function initFirebaseAdmin() {
  if (initialized) return admin;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    throw new Error("Missing FIREBASE_SERVICE_ACCOUNT environment variable (base64 or JSON)");
  }

  let creds: FirebaseServiceAccount;
  try {
    creds = JSON.parse(raw);
  } catch {
    // try base64 decode
    try {
      creds = JSON.parse(Buffer.from(raw, "base64").toString("utf8"));
    } catch {
      throw new Error("FIREBASE_SERVICE_ACCOUNT must be valid JSON or base64-encoded JSON");
    }
  }

  admin.initializeApp({
    credential: admin.credential.cert(creds as Parameters<typeof admin.credential.cert>[0]),
  });
  initialized = true;
  return admin;
}

export default initFirebaseAdmin;
