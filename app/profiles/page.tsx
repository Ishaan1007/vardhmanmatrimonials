"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function ProfilesPage() {
  const [paid, setPaid] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      setPaid(window.localStorage.getItem("vardhman_paid") === "true");
    } catch {
      setPaid(false);
    } finally {
      setLoaded(true);
    }
  }, []);

  if (!loaded) {
    return null;
  }

  if (!paid) {
    return (
      <main style={{ padding: 28 }}>
        <h1>Browse Profiles</h1>
        <p>
          You need to complete registration and pay the registration fee before you can browse profiles.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <Link href="/" className="buttonSecondary">
            Back to Home
          </Link>
          <Link href="/register" className="buttonPrimary">
            Continue Registration
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: 28 }}>
      <h1>Browse Profiles</h1>
      <p>Your payment is complete. Here are some sample profiles available to browse.</p>
      <section style={{ display: "grid", gap: 16, marginTop: 24 }}>
        <article style={{ padding: 18, border: "1px solid #ddd", borderRadius: 16 }}>
          <h2>Profile 1</h2>
          <p>Verified member, 28 years old, MBA, working professional.</p>
        </article>
        <article style={{ padding: 18, border: "1px solid #ddd", borderRadius: 16 }}>
          <h2>Profile 2</h2>
          <p>Verified member, 26 years old, software engineer, vegetarian.</p>
        </article>
      </section>
    </main>
  );
}
