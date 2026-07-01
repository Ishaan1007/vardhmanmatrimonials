import Link from "next/link";

type StoredProfile = Record<string, unknown>;

export default function DashboardPage() {
  let profile: StoredProfile | null = null;
  try {
    if (typeof window !== "undefined") {
      const raw = window.localStorage.getItem("vardhman_user") || window.localStorage.getItem("vardhman_profile_submitted");
      if (raw) profile = JSON.parse(raw);
    }
  } catch {}

  return (
    <main style={{ padding: 28 }}>
      <h1>Dashboard</h1>
      {profile ? (
        <div>
          <p><strong>Name:</strong> {typeof profile["fullName"] === "string" ? profile["fullName"] : "-"}</p>
          <p><strong>Mobile:</strong> {typeof profile["mobileNumber"] === "string" ? profile["mobileNumber"] : "-"}</p>
          <p><strong>Status:</strong> {typeof profile["status"] === "string" ? profile["status"] : "Active"}</p>
        </div>
      ) : (
        <div>
          <p>No user data found. <Link href="/register">Create account</Link></p>
        </div>
      )}
    </main>
  );
}
