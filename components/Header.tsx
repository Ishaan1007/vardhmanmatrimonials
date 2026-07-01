"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type StoredProfile = Record<string, unknown>;

export default function Header() {
  const [profile, setProfile] = useState<StoredProfile | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("vardhman_profile_submitted") || window.localStorage.getItem("vardhman_user");
      if (raw) setProfile(JSON.parse(raw));
    } catch {}
  }, []);

  const handleLogout = () => {
    window.localStorage.removeItem("vardhman_user");
    window.localStorage.removeItem("vardhman_profile_submitted");
    window.location.href = "/";
  };

  return (
    <header style={{ display: "flex", justifyContent: "flex-end", padding: "12px 24px" }}>
      {profile ? (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 18, background: "#2f4f6f", color: "#fff", display: "grid", placeItems: "center", fontWeight: 700 }}>
            {typeof profile["fullName"] === "string" ? profile["fullName"].charAt(0).toUpperCase() : "U"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <span style={{ fontWeight: 700 }}>{typeof profile["fullName"] === "string" ? profile["fullName"] : typeof profile["mobileNumber"] === "string" ? profile["mobileNumber"] : "User"}</span>
            <small style={{ color: "#666" }}>{typeof profile["mobileNumber"] === "string" ? profile["mobileNumber"] : ""}</small>
          </div>
          <button onClick={handleLogout} style={{ marginLeft: 12 }}>Logout</button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/register" className="buttonSecondary">Register</Link>
          <Link href="/register" className="buttonPrimary">Sign up</Link>
        </div>
      )}
    </header>
  );
}
