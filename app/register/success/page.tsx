import Link from "next/link";
import styles from "../register-form.module.css";

export default function RegistrationSuccessPage() {
  return (
    <main className={styles.pageShell}>
      <div className={styles.headerPanel}>
        <h1 className={styles.pageTitle}>Registration Submitted Successfully</h1>
        <p className={styles.pageSubtitle}>
          Thank you for registering with Vardhman Matrimonials. Your profile has been submitted successfully and will be reviewed by our team shortly.
        </p>
      </div>

      <div className={styles.wizardCard} style={{ textAlign: "center", gap: "28px" }}>
        <div>
          <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="48" cy="48" r="46" stroke="#D4AF37" strokeWidth="4" opacity="0.3" />
            <path d="M30 50L42 62L66 38" stroke="#7A1F2B" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div style={{ display: "grid", gap: "12px" }}>
          <p className={styles.stepDescription}>
            Your profile has been received and our verification team will review it shortly.
          </p>
        </div>

        <div className={styles.buttonRow} style={{ justifyContent: "center", marginTop: "12px" }}>
          <Link href="/" className={styles.buttonPrimary}>
            Return Home
          </Link>
          <Link href="/" className={styles.buttonSecondary}>
            Browse Profiles
          </Link>
        </div>
      </div>
    </main>
  );
}
